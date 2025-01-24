/*
  # Update RLS Policies

  This migration updates the RLS policies for better security and performance.
  Instead of dropping and recreating the auth.is_admin() function, we'll update it in place.
  
  1. Updates
    - Modify auth.is_admin() function to be more efficient
    - Update user policies to use simpler conditions
    - Refresh RLS on users table
  
  2. Security
    - Maintains existing RLS policies
    - Updates function without breaking dependencies
*/

-- Update the is_admin function without dropping it
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM users u
    WHERE u.id = auth.uid() 
    AND u.role_id IN (SELECT id FROM roles WHERE name = 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies for users table
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable insert for authenticated users' AND tablename = 'users') THEN
    DROP POLICY "Enable insert for authenticated users" ON users;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable select for users' AND tablename = 'users') THEN
    DROP POLICY "Enable select for users" ON users;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable update for users' AND tablename = 'users') THEN
    DROP POLICY "Enable update for users" ON users;
  END IF;
END $$;

-- Create simplified policies for users table
CREATE POLICY "users_insert_policy"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_select_policy"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() 
    OR (SELECT auth.is_admin())
  );

CREATE POLICY "users_update_policy"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid() 
    OR (SELECT auth.is_admin())
  );

-- Refresh RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;