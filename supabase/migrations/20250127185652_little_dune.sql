/*
  # Support Bank Details Schema

  1. New Tables
    - `support_bank_details`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `account_name` (text)
      - `bank_name` (text)  
      - `account_number` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for:
      - Support users to manage their own bank details
      - Admins to view all support bank details
*/

-- Create support_bank_details table
CREATE TABLE support_bank_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  account_name text NOT NULL,
  bank_name text NOT NULL,
  account_number text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE support_bank_details ENABLE ROW LEVEL SECURITY;

-- Create trigger for updated_at
CREATE TRIGGER update_support_bank_details_updated_at
  BEFORE UPDATE ON support_bank_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create policies
CREATE POLICY "Support users can manage their own bank details"
  ON support_bank_details
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all support bank details"
  ON support_bank_details
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.name = 'admin'
    )
  );