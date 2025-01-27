-- Create delivery_routes table
CREATE TABLE delivery_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  date date NOT NULL,
  status text NOT NULL CHECK (status IN ('draft', 'active', 'completed')),
  total_distance numeric,
  estimated_duration interval,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create route_stops table
CREATE TABLE route_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid REFERENCES delivery_routes(id) ON DELETE CASCADE NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  stop_number integer NOT NULL,
  address text NOT NULL,
  latitude numeric(10,8),
  longitude numeric(11,8),
  estimated_arrival timestamptz,
  actual_arrival timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(route_id, stop_number),
  UNIQUE(route_id, order_id)
);

-- Enable RLS
ALTER TABLE delivery_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;

-- Create triggers for updated_at
CREATE TRIGGER update_delivery_routes_updated_at
  BEFORE UPDATE ON delivery_routes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_route_stops_updated_at
  BEFORE UPDATE ON route_stops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create policies for delivery_routes
CREATE POLICY "Vendors can manage their routes"
  ON delivery_routes
  FOR ALL
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Support can view assigned vendor routes"
  ON delivery_routes
  FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT vendor_id FROM support_vendor_assignments
      WHERE support_user_id = auth.uid()
    )
  );

-- Create policies for route_stops
CREATE POLICY "Vendors can manage their route stops"
  ON route_stops
  FOR ALL
  TO authenticated
  USING (
    route_id IN (
      SELECT id FROM delivery_routes
      WHERE vendor_id IN (
        SELECT id FROM vendors WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Support can view assigned vendor route stops"
  ON route_stops
  FOR SELECT
  TO authenticated
  USING (
    route_id IN (
      SELECT id FROM delivery_routes
      WHERE vendor_id IN (
        SELECT vendor_id FROM support_vendor_assignments
        WHERE support_user_id = auth.uid()
      )
    )
  );

-- Create function to calculate route metrics
CREATE OR REPLACE FUNCTION calculate_route_metrics(route_id_param uuid)
RETURNS TABLE (
  total_distance numeric,
  estimated_duration interval
) AS $$
DECLARE
  prev_lat numeric;
  prev_lon numeric;
  total_dist numeric := 0;
  total_dur interval := interval '0';
  avg_speed_kmh numeric := 30; -- Assumed average speed in km/h
  stop_coords RECORD;
BEGIN
  -- Get first stop coordinates
  SELECT latitude, longitude INTO prev_lat, prev_lon
  FROM route_stops
  WHERE route_id = route_id_param
  ORDER BY stop_number
  LIMIT 1;

  -- Calculate cumulative distance and duration
  FOR stop_coords IN
    SELECT latitude, longitude
    FROM route_stops
    WHERE route_id = route_id_param
    AND stop_number > 1
    ORDER BY stop_number
  LOOP
    -- Calculate distance using Haversine formula
    WITH haversine AS (
      SELECT 
        2 * 6371 * asin(
          sqrt(
            sin(radians((stop_coords.latitude - prev_lat)/2))^2 +
            cos(radians(prev_lat)) * cos(radians(stop_coords.latitude)) *
            sin(radians((stop_coords.longitude - prev_lon)/2))^2
          )
        ) AS distance
    )
    SELECT distance INTO total_dist
    FROM haversine;

    -- Update previous coordinates
    prev_lat := stop_coords.latitude;
    prev_lon := stop_coords.longitude;
  END LOOP;

  -- Calculate estimated duration based on average speed
  total_dur := (total_dist / avg_speed_kmh) * interval '1 hour';

  RETURN QUERY SELECT total_dist, total_dur;
END;
$$ LANGUAGE plpgsql;

-- Create function to optimize route order
CREATE OR REPLACE FUNCTION optimize_route_order(route_id_param uuid)
RETURNS void AS $$
DECLARE
  current_stop RECORD;
  nearest_stop RECORD;
  min_distance numeric;
  temp_distance numeric;
  new_order integer := 1;
BEGIN
  -- Start from the vendor's location (first stop)
  UPDATE route_stops
  SET stop_number = new_order
  WHERE route_id = route_id_param
  AND stop_number = 1;

  new_order := new_order + 1;

  -- For each remaining stop, find the nearest unassigned stop
  WHILE EXISTS (
    SELECT 1 FROM route_stops
    WHERE route_id = route_id_param
    AND stop_number > new_order
  ) LOOP
    -- Get current stop
    SELECT latitude, longitude INTO current_stop
    FROM route_stops
    WHERE route_id = route_id_param
    AND stop_number = new_order - 1;

    -- Find nearest unassigned stop
    min_distance := float8 'infinity';
    
    FOR nearest_stop IN
      SELECT id, latitude, longitude
      FROM route_stops
      WHERE route_id = route_id_param
      AND stop_number > new_order
    LOOP
      -- Calculate distance using Haversine formula
      WITH haversine AS (
        SELECT 
          2 * 6371 * asin(
            sqrt(
              sin(radians((nearest_stop.latitude - current_stop.latitude)/2))^2 +
              cos(radians(current_stop.latitude)) * cos(radians(nearest_stop.latitude)) *
              sin(radians((nearest_stop.longitude - current_stop.longitude)/2))^2
            )
          ) AS distance
      )
      SELECT distance INTO temp_distance
      FROM haversine;

      IF temp_distance < min_distance THEN
        min_distance := temp_distance;
        
        -- Update stop number for nearest stop
        UPDATE route_stops
        SET stop_number = new_order
        WHERE id = nearest_stop.id;
      END IF;
    END LOOP;

    new_order := new_order + 1;
  END LOOP;

  -- Update route metrics
  WITH metrics AS (
    SELECT * FROM calculate_route_metrics(route_id_param)
  )
  UPDATE delivery_routes
  SET 
    total_distance = metrics.total_distance,
    estimated_duration = metrics.estimated_duration
  FROM metrics
  WHERE id = route_id_param;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX idx_route_stops_route_id ON route_stops(route_id);
CREATE INDEX idx_route_stops_order_id ON route_stops(order_id);
CREATE INDEX idx_delivery_routes_vendor_id ON delivery_routes(vendor_id);
CREATE INDEX idx_delivery_routes_date ON delivery_routes(date);