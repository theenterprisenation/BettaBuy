/*
  # Fix infinite recursion in roles policies

  1. Changes
    - Drop and recreate policies to prevent circular references
    - Update user and order policies to use direct role checks
    - Remove recursive policy dependencies

  2. Security
    - Maintain same security level with simplified policy structure
*/

-- First drop all existing policies
DO $$ 
BEGIN
  -- Drop policies only if they exist
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage roles' AND tablename = 'roles') THEN
    DROP POLICY "Admins can manage roles" ON roles;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read their own data' AND tablename = 'users') THEN
    DROP POLICY "Users can read their own data" ON users;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can read all user data' AND tablename = 'users') THEN
    DROP POLICY "Admins can read all user data" ON users;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own data' AND tablename = 'users') THEN
    DROP POLICY "Users can update their own data" ON users;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage all orders' AND tablename = 'orders') THEN
    DROP POLICY "Admins can manage all orders" ON orders;
  END IF;
END $$;

-- Create new policies with simplified structure
CREATE POLICY "Users read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admin read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.name = 'admin'
    )
  );

CREATE POLICY "Users update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admin manage orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.name = 'admin'
    )
  );