-- First ensure admin role exists
INSERT INTO roles (name, description)
VALUES ('admin', 'Global administrator with full access')
ON CONFLICT (name) DO NOTHING;

-- Create admin user function for better error handling
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id uuid;
  admin_role_id uuid;
BEGIN
  -- Create auth user if doesn't exist
  INSERT INTO auth.users (
    id,
    email,
    raw_user_meta_data,
    raw_app_meta_data,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    aud,
    role
  ) 
  VALUES (
    gen_random_uuid(),
    'purplereefng@gmail.com',
    '{"role":"admin"}'::jsonb,
    '{"provider":"email","providers":["email"]}'::jsonb,
    crypt('Kwawalwa$Ap@selead001', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  )
  RETURNING id INTO admin_user_id;

  -- Get admin role id
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';

  -- Create user record
  INSERT INTO users (id, role_id, full_name)
  VALUES (admin_user_id, admin_role_id, 'System Administrator');

EXCEPTION 
  WHEN unique_violation THEN
    -- If user already exists, get their ID and update
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'purplereefng@gmail.com';

    -- Update password
    UPDATE auth.users 
    SET 
      encrypted_password = crypt('Kwawalwa$Ap@selead001', gen_salt('bf')),
      email_confirmed_at = NOW(),
      updated_at = NOW()
    WHERE id = admin_user_id;

    -- Update or insert users record
    INSERT INTO users (id, role_id, full_name)
    VALUES (admin_user_id, admin_role_id, 'System Administrator')
    ON CONFLICT (id) DO UPDATE
    SET role_id = admin_role_id;
END;
$$;

-- Execute the function
SELECT create_admin_user();

-- Drop the function after use
DROP FUNCTION create_admin_user();