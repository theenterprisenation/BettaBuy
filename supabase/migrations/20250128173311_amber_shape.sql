-- Update admin user email
DO $$ 
DECLARE
  admin_user_id uuid;
  admin_role_id uuid;
BEGIN
  -- Get admin role id
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';

  -- Update auth.users email
  UPDATE auth.users 
  SET 
    email = 'purplereefconsult@gmail.com',
    updated_at = NOW()
  WHERE email = 'purplereefng@gmail.com'
  RETURNING id INTO admin_user_id;

  -- Ensure user record exists with admin role
  INSERT INTO users (id, role_id, full_name)
  VALUES (admin_user_id, admin_role_id, 'System Administrator')
  ON CONFLICT (id) DO UPDATE
  SET role_id = admin_role_id;
END $$;