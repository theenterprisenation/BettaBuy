-- Create vendor_ratings table
CREATE TABLE vendor_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE UNIQUE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback text,
  delivery_rating integer CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  quality_rating integer CHECK (quality_rating >= 1 AND quality_rating <= 5),
  communication_rating integer CHECK (communication_rating >= 1 AND communication_rating <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE vendor_ratings ENABLE ROW LEVEL SECURITY;

-- Create trigger for updated_at
CREATE TRIGGER update_vendor_ratings_updated_at
  BEFORE UPDATE ON vendor_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create policies
CREATE POLICY "Users can create ratings for their orders"
  ON vendor_ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_id
      AND orders.user_id = auth.uid()
      AND orders.status = 'completed'
    )
  );

CREATE POLICY "Users can view all ratings"
  ON vendor_ratings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own ratings"
  ON vendor_ratings
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Create function to calculate vendor rating statistics
CREATE OR REPLACE FUNCTION calculate_vendor_rating_stats(vendor_id_param uuid)
RETURNS TABLE (
  average_rating numeric,
  total_ratings bigint,
  rating_distribution json,
  average_delivery numeric,
  average_quality numeric,
  average_communication numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROUND(AVG(rating)::numeric, 1) as average_rating,
    COUNT(*) as total_ratings,
    json_build_object(
      '5', COUNT(*) FILTER (WHERE rating = 5),
      '4', COUNT(*) FILTER (WHERE rating = 4),
      '3', COUNT(*) FILTER (WHERE rating = 3),
      '2', COUNT(*) FILTER (WHERE rating = 2),
      '1', COUNT(*) FILTER (WHERE rating = 1)
    ) as rating_distribution,
    ROUND(AVG(delivery_rating)::numeric, 1) as average_delivery,
    ROUND(AVG(quality_rating)::numeric, 1) as average_quality,
    ROUND(AVG(communication_rating)::numeric, 1) as average_communication
  FROM vendor_ratings
  WHERE vendor_id = vendor_id_param;
END;
$$ LANGUAGE plpgsql;

-- Add rating stats columns to vendors table
ALTER TABLE vendors
ADD COLUMN average_rating numeric,
ADD COLUMN total_ratings bigint;

-- Create function to update vendor rating stats
CREATE OR REPLACE FUNCTION update_vendor_rating_stats()
RETURNS trigger AS $$
DECLARE
  stats record;
BEGIN
  -- Calculate new stats
  SELECT * FROM calculate_vendor_rating_stats(
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.vendor_id
      ELSE NEW.vendor_id
    END
  ) INTO stats;

  -- Update vendor stats
  UPDATE vendors
  SET
    average_rating = stats.average_rating,
    total_ratings = stats.total_ratings
  WHERE id = CASE
    WHEN TG_OP = 'DELETE' THEN OLD.vendor_id
    ELSE NEW.vendor_id
  END;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update vendor stats
CREATE TRIGGER update_vendor_stats_on_rating
  AFTER INSERT OR UPDATE OR DELETE ON vendor_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_vendor_rating_stats();

-- Create index for better performance
CREATE INDEX idx_vendor_ratings_vendor_id ON vendor_ratings(vendor_id);

-- Update existing vendors with initial stats
DO $$
BEGIN
  UPDATE vendors v
  SET
    (average_rating, total_ratings) = (
      SELECT average_rating, total_ratings
      FROM calculate_vendor_rating_stats(v.id)
    );
END $$;