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
    email,
    raw_user_meta_data,
    raw_app_meta_data,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token
  ) 
  VALUES (
    'purplereefng@gmail.com',
    '{"role":"admin"}'::jsonb,
    '{"provider":"email","providers":["email"]}'::jsonb,
    crypt('Kwawalwa$Ap@selead001', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    encode(gen_random_bytes(32), 'hex')
  )
  ON CONFLICT (email) DO UPDATE
  SET 
    encrypted_password = crypt('Kwawalwa$Ap@selead001', gen_salt('bf')),
    email_confirmed_at = NOW(),
    updated_at = NOW()
  RETURNING id INTO admin_user_id;

  -- Get admin role id
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';

  -- Create or update user record
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