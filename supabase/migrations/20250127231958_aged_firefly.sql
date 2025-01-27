-- Add geospatial analytics functions and views

-- Create materialized view for order locations
CREATE MATERIALIZED VIEW order_locations AS
SELECT
  o.id as order_id,
  p.vendor_id,
  o.created_at,
  o.total_amount,
  o.status,
  o.delivery_option,
  COALESCE(
    (o.delivery_details->>'latitude')::numeric,
    v.latitude
  ) as latitude,
  COALESCE(
    (o.delivery_details->>'longitude')::numeric,
    v.longitude
  ) as longitude,
  CASE
    WHEN o.delivery_option = 'pickup' THEN v.address
    ELSE COALESCE(o.delivery_details->>'address', v.address)
  END as location,
  CASE
    WHEN o.delivery_option = 'pickup' THEN p.city
    ELSE COALESCE(o.delivery_details->>'city', p.city)
  END as city,
  p.state
FROM orders o
JOIN products p ON o.product_id = p.id
JOIN vendors v ON p.vendor_id = v.id;

-- Create index for better query performance
CREATE INDEX idx_order_locations_coords 
ON order_locations(latitude, longitude);

CREATE INDEX idx_order_locations_vendor 
ON order_locations(vendor_id);

-- Function to get regional order statistics
CREATE OR REPLACE FUNCTION get_regional_stats(
  start_date timestamptz DEFAULT (now() - interval '30 days'),
  end_date timestamptz DEFAULT now(),
  vendor_id_param uuid DEFAULT NULL
)
RETURNS TABLE (
  state text,
  city text,
  total_orders bigint,
  total_amount numeric,
  avg_order_value numeric,
  delivery_breakdown jsonb,
  status_breakdown jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ol.state,
    ol.city,
    COUNT(*) as total_orders,
    SUM(ol.total_amount) as total_amount,
    ROUND(AVG(ol.total_amount), 2) as avg_order_value,
    jsonb_build_object(
      'pickup', COUNT(*) FILTER (WHERE delivery_option = 'pickup'),
      'delivery', COUNT(*) FILTER (WHERE delivery_option = 'delivery'),
      'stockpiling', COUNT(*) FILTER (WHERE delivery_option = 'stockpiling')
    ) as delivery_breakdown,
    jsonb_build_object(
      'pending', COUNT(*) FILTER (WHERE status = 'pending'),
      'confirmed', COUNT(*) FILTER (WHERE status = 'confirmed'),
      'completed', COUNT(*) FILTER (WHERE status = 'completed'),
      'cancelled', COUNT(*) FILTER (WHERE status = 'cancelled')
    ) as status_breakdown
  FROM order_locations ol
  WHERE 
    ol.created_at BETWEEN start_date AND end_date
    AND (vendor_id_param IS NULL OR ol.vendor_id = vendor_id_param)
  GROUP BY ol.state, ol.city
  ORDER BY total_orders DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get heatmap data
CREATE OR REPLACE FUNCTION get_order_heatmap(
  start_date timestamptz DEFAULT (now() - interval '30 days'),
  end_date timestamptz DEFAULT now(),
  vendor_id_param uuid DEFAULT NULL
)
RETURNS TABLE (
  latitude numeric,
  longitude numeric,
  weight integer,
  amount numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ol.latitude,
    ol.longitude,
    COUNT(*)::integer as weight,
    SUM(ol.total_amount) as amount
  FROM order_locations ol
  WHERE 
    ol.created_at BETWEEN start_date AND end_date
    AND (vendor_id_param IS NULL OR ol.vendor_id = vendor_id_param)
    AND ol.latitude IS NOT NULL
    AND ol.longitude IS NOT NULL
  GROUP BY ol.latitude, ol.longitude;
END;
$$ LANGUAGE plpgsql;

-- Function to get customer demographics
CREATE OR REPLACE FUNCTION get_customer_demographics(
  vendor_id_param uuid,
  start_date timestamptz DEFAULT (now() - interval '30 days'),
  end_date timestamptz DEFAULT now()
)
RETURNS TABLE (
  state text,
  city text,
  total_customers bigint,
  repeat_customers bigint,
  avg_order_frequency numeric,
  total_revenue numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH customer_stats AS (
    SELECT
      ol.state,
      ol.city,
      COUNT(DISTINCT o.user_id) as unique_customers,
      COUNT(*) as total_orders,
      SUM(ol.total_amount) as revenue,
      COUNT(*) FILTER (
        WHERE o.user_id IN (
          SELECT user_id 
          FROM orders o2 
          JOIN products p2 ON o2.product_id = p2.id
          WHERE p2.vendor_id = vendor_id_param
          GROUP BY user_id 
          HAVING COUNT(*) > 1
        )
      ) as repeat_count
    FROM orders o
    JOIN products p ON o.product_id = p.id
    JOIN order_locations ol ON o.id = ol.order_id
    WHERE 
      p.vendor_id = vendor_id_param
      AND o.created_at BETWEEN start_date AND end_date
    GROUP BY ol.state, ol.city
  )
  SELECT
    cs.state,
    cs.city,
    cs.unique_customers as total_customers,
    cs.repeat_count as repeat_customers,
    ROUND(cs.total_orders::numeric / cs.unique_customers, 2) as avg_order_frequency,
    cs.revenue as total_revenue
  FROM customer_stats cs
  ORDER BY cs.unique_customers DESC;
END;
$$ LANGUAGE plpgsql;

-- Refresh materialized view periodically
CREATE OR REPLACE FUNCTION refresh_order_locations()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY order_locations;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_order_locations_trigger()
RETURNS trigger AS $$
BEGIN
  PERFORM refresh_order_locations();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_order_locations_on_change
AFTER INSERT OR UPDATE OR DELETE ON orders
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_order_locations_trigger();

-- Create security definer functions to access the materialized view
CREATE OR REPLACE FUNCTION get_order_locations_for_vendor(vendor_id_param uuid)
RETURNS SETOF order_locations
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM order_locations 
  WHERE vendor_id = vendor_id_param
  AND EXISTS (
    SELECT 1 FROM vendors 
    WHERE id = vendor_id_param 
    AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION get_order_locations_for_admin()
RETURNS SETOF order_locations
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM order_locations 
  WHERE EXISTS (
    SELECT 1 FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() 
    AND r.name = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION get_order_locations_for_support()
RETURNS SETOF order_locations
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT ol.* FROM order_locations ol
  WHERE EXISTS (
    SELECT 1 FROM support_vendor_assignments sva
    WHERE sva.support_user_id = auth.uid()
    AND sva.vendor_id = ol.vendor_id
  );
$$;