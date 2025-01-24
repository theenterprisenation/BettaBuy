/*
  # Fix policy recursion with simplified structure

  1. Changes
    - Remove all complex policy checks that could cause recursion
    - Implement direct role checks using a simplified approach
    - Ensure proper access control without circular references

  2. Security
    - Maintain security while avoiding recursion
    - Preserve data access controls
    - Simplify admin role checks
*/

-- First, drop existing problematic policies
DO $$ 
BEGIN
  -- Drop policies only if they exist
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own data' AND tablename = 'users') THEN
    DROP POLICY "Users can read own data" ON users;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can read all users' AND tablename = 'users') THEN
    DROP POLICY "Admins can read all users" ON users;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own data' AND tablename = 'users') THEN
    DROP POLICY "Users can update own data" ON users;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage orders' AND tablename = 'orders') THEN
    DROP POLICY "Admins can manage orders" ON orders;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage site content' AND tablename = 'site_content') THEN
    DROP POLICY "Admins can manage site content" ON site_content;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view site content' AND tablename = 'site_content') THEN
    DROP POLICY "Public can view site content" ON site_content;
  END IF;
END $$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users au
    JOIN users u ON au.id = u.id
    JOIN roles r ON u.role_id = r.id
    WHERE au.id = auth.uid() 
    AND r.name = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Create new simplified policies
-- Users table policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR auth.is_admin());

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR auth.is_admin());

-- Orders table policies
CREATE POLICY "Users can manage orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR auth.is_admin());

-- Site content policies
CREATE POLICY "Anyone can view site content"
  ON site_content
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage site content"
  ON site_content
  FOR ALL
  TO authenticated
  USING (auth.is_admin());

-- Refresh the RLS policies
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

ALTER TABLE site_content DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;