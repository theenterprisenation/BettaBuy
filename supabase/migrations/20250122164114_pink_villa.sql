-- Drop existing policies for users table
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own data' AND tablename = 'users') THEN
    DROP POLICY "Users can read own data" ON users;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own data' AND tablename = 'users') THEN
    DROP POLICY "Users can update own data" ON users;
  END IF;
END $$;

-- Create new policies for users table
CREATE POLICY "Enable insert for authenticated users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() 
    OR EXISTS (
      SELECT 1 
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() 
      AND r.name = 'admin'
    )
  );

CREATE POLICY "Enable update for users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid() 
    OR EXISTS (
      SELECT 1 
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() 
      AND r.name = 'admin'
    )
  );

-- Refresh RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;