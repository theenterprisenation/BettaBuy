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

-- Create indexes for better performance if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'route_stops' AND indexname = 'idx_route_stops_route_id'
  ) THEN
    CREATE INDEX idx_route_stops_route_id ON route_stops(route_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'route_stops' AND indexname = 'idx_route_stops_order_id'
  ) THEN
    CREATE INDEX idx_route_stops_order_id ON route_stops(order_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'delivery_routes' AND indexname = 'idx_delivery_routes_vendor_id'
  ) THEN
    CREATE INDEX idx_delivery_routes_vendor_id ON delivery_routes(vendor_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'delivery_routes' AND indexname = 'idx_delivery_routes_date'
  ) THEN
    CREATE INDEX idx_delivery_routes_date ON delivery_routes(date);
  END IF;
END $$;