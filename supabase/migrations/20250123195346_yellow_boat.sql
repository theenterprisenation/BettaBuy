/*
  # Add bank account details for vendors

  1. New Tables
    - `vendor_bank_details`
      - `id` (uuid, primary key)
      - `vendor_id` (uuid, references vendors)
      - `account_name` (text)
      - `bank_name` (text)
      - `account_number` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for vendors to manage their own bank details
    - Add policies for admins to view all bank details
*/

DO $$ 
BEGIN
  -- Create table only if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'vendor_bank_details') THEN
    CREATE TABLE vendor_bank_details (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE UNIQUE NOT NULL,
      account_name text NOT NULL,
      bank_name text NOT NULL,
      account_number text NOT NULL,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE vendor_bank_details ENABLE ROW LEVEL SECURITY;

    -- Create trigger for updated_at
    CREATE TRIGGER update_vendor_bank_details_updated_at
      BEFORE UPDATE ON vendor_bank_details
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();

    -- Create policies
    CREATE POLICY "Vendors can manage their own bank details"
      ON vendor_bank_details
      FOR ALL
      TO authenticated
      USING (
        vendor_id IN (
          SELECT id FROM vendors
          WHERE user_id = auth.uid()
        )
      );

    CREATE POLICY "Admins can view all bank details"
      ON vendor_bank_details
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE id = auth.uid()
          AND role_id IN (SELECT id FROM roles WHERE name = 'admin')
        )
      );
  END IF;
END $$;