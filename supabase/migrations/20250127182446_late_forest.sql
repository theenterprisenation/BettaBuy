/*
  # Add Support Role and Related Tables

  1. New Features
    - Support role for managing vendor relationships
    - Support vendor assignments tracking
    - Monthly transaction statistics for support users

  2. Changes
    - Add support role to roles table
    - Create support_vendor_assignments table
    - Add functions for calculating support commissions

  3. Security
    - Enable RLS on new table
    - Add policies for admin and support access
*/

-- Add support role if it doesn't exist
INSERT INTO roles (name, description)
VALUES ('support', 'Support staff with vendor monitoring capabilities')
ON CONFLICT (name) DO NOTHING;

-- Create support_vendor_assignments table
CREATE TABLE support_vendor_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  support_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(support_user_id, vendor_id)
);

-- Enable RLS
ALTER TABLE support_vendor_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage assignments"
  ON support_vendor_assignments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.name = 'admin'
    )
  );

CREATE POLICY "Support can view their assignments"
  ON support_vendor_assignments
  FOR SELECT
  TO authenticated
  USING (support_user_id = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_support_assignments_updated_at
  BEFORE UPDATE ON support_vendor_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function for monthly transactions
CREATE OR REPLACE FUNCTION get_support_monthly_stats(support_id uuid, month date)
RETURNS TABLE (
  vendor_id uuid,
  vendor_name text,
  total_transactions numeric,
  commission numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id as vendor_id,
    v.business_name as vendor_name,
    COALESCE(SUM(o.total_amount), 0) as total_transactions,
    COALESCE(SUM(o.total_amount) * 0.005, 0) as commission
  FROM support_vendor_assignments sva
  JOIN vendors v ON v.id = sva.vendor_id
  LEFT JOIN orders o ON o.product_id IN (
    SELECT id FROM products WHERE vendor_id = v.id
  )
  AND DATE_TRUNC('month', o.created_at) = DATE_TRUNC('month', month)
  AND o.payment_status = 'success'
  WHERE sva.support_user_id = support_id
  GROUP BY v.id, v.business_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;