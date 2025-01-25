/*
  # Add Paystack subaccount support
  
  1. Changes
    - Add paystack_subaccount_code column to vendor_bank_details table
    - Add unique constraint to ensure one subaccount per vendor
    - Add index for faster lookups
*/

ALTER TABLE vendor_bank_details
ADD COLUMN paystack_subaccount_code text,
ADD CONSTRAINT unique_subaccount_code UNIQUE (paystack_subaccount_code);

-- Create index for faster lookups
CREATE INDEX idx_vendor_bank_details_subaccount ON vendor_bank_details(paystack_subaccount_code);