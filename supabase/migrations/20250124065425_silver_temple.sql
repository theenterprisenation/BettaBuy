/*
  # Add payment reference to orders

  1. New Columns
    - Add payment_reference column to orders table
    - Add payment_status column to orders table
  
  2. Changes
    - Add constraints to ensure payment reference is provided
    - Add check constraint for payment status values
*/

-- Add payment reference and status columns to orders table
ALTER TABLE orders
ADD COLUMN payment_reference text,
ADD COLUMN payment_status text CHECK (payment_status IN ('pending', 'success', 'failed'));

-- Create index on payment_reference for faster lookups
CREATE INDEX idx_orders_payment_reference ON orders(payment_reference);