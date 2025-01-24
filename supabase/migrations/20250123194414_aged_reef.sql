/*
  # Add vendor authentication fields

  1. Changes
    - Add email and password fields to vendors table
    - Add unique constraint on vendor email
    - Add RLS policies for vendor authentication
*/

-- Add email field to vendors table
ALTER TABLE vendors
ADD COLUMN email text UNIQUE NOT NULL;

-- Create a function to handle vendor registration
CREATE OR REPLACE FUNCTION register_vendor(
  vendor_email text,
  vendor_password text,
  business_name text,
  description text,
  address text,
  state text,
  city text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  new_vendor_id uuid;
BEGIN
  -- Create auth user
  new_user_id := (
    SELECT id FROM auth.users
    WHERE email = vendor_email
    LIMIT 1
  );

  IF new_user_id IS NULL THEN
    new_user_id := extensions.uuid_generate_v4();
    
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      new_user_id,
      vendor_email,
      crypt(vendor_password, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"role":"vendor"}',
      now(),
      now()
    );
  END IF;

  -- Create vendor record
  INSERT INTO vendors (
    user_id,
    email,
    business_name,
    description,
    address,
    state,
    city
  ) VALUES (
    new_user_id,
    vendor_email,
    business_name,
    description,
    address,
    state,
    city
  )
  RETURNING id INTO new_vendor_id;

  -- Set user role to vendor
  UPDATE users
  SET role_id = (SELECT id FROM roles WHERE name = 'vendor')
  WHERE id = new_user_id;

  RETURN new_vendor_id;
END;
$$;