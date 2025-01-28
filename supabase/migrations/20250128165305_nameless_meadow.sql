-- Create admin user in auth.users
INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
SELECT 
  'purplereefng@gmail.com',
  crypt('Kwawalwa$Ap@selead001', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"admin"}',
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'purplereefng@gmail.com'
);

-- Get the user ID
DO $$
DECLARE
  admin_user_id uuid;
  admin_role_id uuid;
BEGIN
  -- Get the admin user ID
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'purplereefng@gmail.com';

  -- Get the admin role ID
  SELECT id INTO admin_role_id
  FROM roles
  WHERE name = 'admin';

  -- Create user record with admin role
  INSERT INTO users (id, role_id, full_name)
  VALUES (admin_user_id, admin_role_id, 'System Administrator')
  ON CONFLICT (id) DO UPDATE
  SET role_id = admin_role_id;
END $$;