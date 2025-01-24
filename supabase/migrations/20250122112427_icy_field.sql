/*
  # Initial Foodrient Database Schema

  1. New Tables
    - users (extends auth.users)
      - id (uuid, references auth.users)
      - full_name (text)
      - avatar_url (text)
      - phone (text)
      - address (text)
      - created_at (timestamp)
      - updated_at (timestamp)

    - vendors
      - id (uuid)
      - user_id (uuid, references users)
      - business_name (text)
      - description (text)
      - logo_url (text)
      - address (text)
      - is_verified (boolean)
      - created_at (timestamp)
      - updated_at (timestamp)

    - products
      - id (uuid)
      - vendor_id (uuid, references vendors)
      - name (text)
      - description (text)
      - price (numeric)
      - image_url (text)
      - available_slots (integer)
      - minimum_slots (integer)
      - purchase_window_start (timestamp)
      - purchase_window_end (timestamp)
      - created_at (timestamp)
      - updated_at (timestamp)

    - orders
      - id (uuid)
      - user_id (uuid, references users)
      - product_id (uuid, references products)
      - quantity (integer)
      - total_amount (numeric)
      - status (text)
      - created_at (timestamp)
      - updated_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for vendors
*/

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  phone text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create vendors table
CREATE TABLE vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users ON DELETE CASCADE NOT NULL,
  business_name text NOT NULL,
  description text,
  logo_url text,
  address text NOT NULL,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can read their own data"
  ON vendors
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Public can view verified vendors"
  ON vendors
  FOR SELECT
  TO authenticated
  USING (is_verified = true);

-- Create products table
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price > 0),
  image_url text,
  available_slots integer NOT NULL CHECK (available_slots > 0),
  minimum_slots integer NOT NULL CHECK (minimum_slots > 0),
  purchase_window_start timestamptz NOT NULL,
  purchase_window_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_window CHECK (purchase_window_end > purchase_window_start)
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

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

-- Create orders table
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  total_amount numeric NOT NULL CHECK (total_amount > 0),
  status text NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

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

-- Create functions and triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();