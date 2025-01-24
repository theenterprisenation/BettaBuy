/*
  # Add user roles and permissions

  1. New Tables
    - `roles`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Changes
    - Add `role` column to `users` table
    - Add role-based policies for all tables

  3. Security
    - Enable RLS on `roles` table
    - Add policies for role-based access
*/

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default roles first
INSERT INTO roles (name, description) VALUES
  ('admin', 'Global administrator with full access'),
  ('vendor', 'Vendor role with product management capabilities'),
  ('user', 'Regular user role')
ON CONFLICT (name) DO NOTHING;

-- Add role column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'role_id'
  ) THEN
    ALTER TABLE users ADD COLUMN role_id uuid REFERENCES roles(id);
    -- Set default role as 'user' for existing users
    UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'user');
  END IF;
END $$;

-- Enable RLS on roles table
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Create policies for roles table
CREATE POLICY "Admins can manage roles"
  ON roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role_id IN (SELECT id FROM roles WHERE name = 'admin')
    )
  );

CREATE POLICY "All users can view roles"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Update users table policies
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM roles
      WHERE users.role_id IN (SELECT id FROM roles WHERE name = 'admin')
    )
  );

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM roles
      WHERE users.role_id IN (SELECT id FROM roles WHERE name = 'admin')
    )
  );

-- Update vendors table policies
DROP POLICY IF EXISTS "Vendors can read their own data" ON vendors;
DROP POLICY IF EXISTS "Public can view verified vendors" ON vendors;

CREATE POLICY "Vendors and admins can manage vendor data"
  ON vendors
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role_id IN (SELECT id FROM roles WHERE name = 'admin')
    )
  );

CREATE POLICY "Public can view verified vendors"
  ON vendors
  FOR SELECT
  TO authenticated
  USING (is_verified = true);

-- Update products table policies
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Vendors can manage their products" ON products;

CREATE POLICY "Anyone can view products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Vendors and admins can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role_id IN (SELECT id FROM roles WHERE name = 'admin')
    )
  );

-- Update orders table policies
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Vendors can view orders for their products" ON orders;

CREATE POLICY "Users can view their own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role_id IN (SELECT id FROM roles WHERE name = 'admin')
    )
  );

CREATE POLICY "Users can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Vendors and admins can manage orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (
    product_id IN (
      SELECT id FROM products WHERE vendor_id IN (
        SELECT id FROM vendors WHERE user_id = auth.uid()
      )
    ) OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role_id IN (SELECT id FROM roles WHERE name = 'admin')
    )
  );

-- Create trigger for updated_at on roles table
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();