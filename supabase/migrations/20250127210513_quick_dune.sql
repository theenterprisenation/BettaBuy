/*
  # Support Affiliate System

  1. New Tables
    - `support_affiliates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `code` (text, unique)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Functions
    - Function to generate unique affiliate codes
    - Function to automatically assign vendors to support staff based on referral codes

  3. Triggers
    - Trigger to create affiliate code when support user is created
    - Trigger to handle vendor assignment on registration
*/

-- Create support_affiliates table
CREATE TABLE support_affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE support_affiliates ENABLE ROW LEVEL SECURITY;

-- Create trigger for updated_at
CREATE TRIGGER update_support_affiliates_updated_at
  BEFORE UPDATE ON support_affiliates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create policies
CREATE POLICY "Support users can view their own affiliate code"
  ON support_affiliates
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all affiliate codes"
  ON support_affiliates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.name = 'admin'
    )
  );

-- Function to generate unique affiliate code
CREATE OR REPLACE FUNCTION generate_affiliate_code(support_name text)
RETURNS text AS $$
DECLARE
  base_code text;
  final_code text;
  counter integer := 0;
BEGIN
  -- Create base code from support name (first 3 letters + random numbers)
  base_code := UPPER(SUBSTRING(REGEXP_REPLACE(support_name, '[^a-zA-Z]', '', 'g'), 1, 3));
  final_code := base_code || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0');
  
  -- Keep trying until we get a unique code
  WHILE EXISTS (SELECT 1 FROM support_affiliates WHERE code = final_code) LOOP
    counter := counter + 1;
    final_code := base_code || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0');
    IF counter > 100 THEN
      RAISE EXCEPTION 'Could not generate unique affiliate code';
    END IF;
  END LOOP;
  
  RETURN final_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to create affiliate code for new support users
CREATE OR REPLACE FUNCTION create_support_affiliate()
RETURNS trigger AS $$
BEGIN
  -- Check if the user is a support staff
  IF EXISTS (
    SELECT 1 FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = NEW.id AND r.name = 'support'
  ) THEN
    -- Create affiliate code
    INSERT INTO support_affiliates (user_id, code)
    VALUES (NEW.id, generate_affiliate_code(NEW.full_name));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new support users
CREATE TRIGGER create_support_affiliate_trigger
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_support_affiliate();

-- Modify register_vendor function to handle referral codes
CREATE OR REPLACE FUNCTION register_vendor(
  vendor_email text,
  vendor_password text,
  business_name text,
  description text,
  address text,
  state text,
  city text,
  referral_code text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  new_vendor_id uuid;
  support_user_id uuid;
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

  -- Handle referral code if provided
  IF referral_code IS NOT NULL THEN
    -- Get support user from referral code
    SELECT user_id INTO support_user_id
    FROM support_affiliates
    WHERE code = referral_code;

    -- If valid referral code, create assignment
    IF support_user_id IS NOT NULL THEN
      INSERT INTO support_vendor_assignments (support_user_id, vendor_id)
      VALUES (support_user_id, new_vendor_id);
    END IF;
  END IF;

  RETURN new_vendor_id;
END;
$$;

-- Create affiliate codes for existing support users
DO $$
DECLARE
  support_user RECORD;
BEGIN
  FOR support_user IN
    SELECT u.id, u.full_name 
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE r.name = 'support'
    AND NOT EXISTS (
      SELECT 1 FROM support_affiliates WHERE user_id = u.id
    )
  LOOP
    INSERT INTO support_affiliates (user_id, code)
    VALUES (support_user.id, generate_affiliate_code(support_user.full_name));
  END LOOP;
END $$;