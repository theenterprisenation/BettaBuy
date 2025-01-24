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
DROP POLICY IF EXISTS "Anyone can view roles" ON roles;
CREATE POLICY "Anyone can view roles"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Update users table policies
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Admins can read all user data" ON users;

CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can read all user data"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u
      WHERE u.role_id IN (SELECT r.id FROM roles r WHERE r.name = 'admin')
    )
  );

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Update vendors table policies
DROP POLICY IF EXISTS "Vendors can read their own data" ON vendors;
DROP POLICY IF EXISTS "Public can view verified vendors" ON vendors;
DROP POLICY IF EXISTS "Vendors can manage their own data" ON vendors;
DROP POLICY IF EXISTS "Admins can manage all vendor data" ON vendors;

CREATE POLICY "Vendors can manage their own data"
  ON vendors
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all vendor data"
  ON vendors
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u
      WHERE u.role_id IN (SELECT r.id FROM roles r WHERE r.name = 'admin')
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
DROP POLICY IF EXISTS "Admins can manage all products" ON products;

CREATE POLICY "Anyone can view products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Vendors can manage their products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u
      WHERE u.role_id IN (SELECT r.id FROM roles r WHERE r.name = 'admin')
    )
  );

-- Update orders table policies
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Vendors can view orders for their products" ON orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON orders;

CREATE POLICY "Users can view their own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Vendors can view orders for their products"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    product_id IN (
      SELECT id FROM products WHERE vendor_id IN (
        SELECT id FROM vendors WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage all orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u
      WHERE u.role_id IN (SELECT r.id FROM roles r WHERE r.name = 'admin')
    )
  );