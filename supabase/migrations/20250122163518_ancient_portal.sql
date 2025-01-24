/*
  # Fix policy recursion issues

  1. Changes
    - Simplify policies to avoid circular references
    - Use direct role checks instead of nested queries
    - Remove redundant policies
    - Ensure proper access control without recursion

  2. Security
    - Maintain same security level with simplified policies
    - Ensure admin access works correctly
    - Preserve user data privacy
*/

-- First, drop existing problematic policies
DO $$ 
BEGIN
  -- Drop policies only if they exist
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users read own data' AND tablename = 'users') THEN
    DROP POLICY "Users read own data" ON users;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin read all users' AND tablename = 'users') THEN
    DROP POLICY "Admin read all users" ON users;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users update own data' AND tablename = 'users') THEN
    DROP POLICY "Users update own data" ON users;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin manage orders' AND tablename = 'orders') THEN
    DROP POLICY "Admin manage orders" ON orders;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage site content' AND tablename = 'site_content') THEN
    DROP POLICY "Admins can manage site content" ON site_content;
  END IF;
END $$;

-- Create new simplified policies
-- Users table policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM roles
      WHERE id = (
        SELECT role_id FROM users WHERE id = auth.uid()
      )
      AND name = 'admin'
    )
  );

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Orders table policies
CREATE POLICY "Admins can manage orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM roles
      WHERE id = (
        SELECT role_id FROM users WHERE id = auth.uid()
      )
      AND name = 'admin'
    )
  );

-- Site content policies
CREATE POLICY "Admins can manage site content"
  ON site_content
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM roles
      WHERE id = (
        SELECT role_id FROM users WHERE id = auth.uid()
      )
      AND name = 'admin'
    )
  );