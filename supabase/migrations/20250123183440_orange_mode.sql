/*
  # Add delivery options support

  1. Changes
    - Add delivery_option and delivery_details to orders table
    - Add is_perishable flag to products table
    - Add location coordinates to vendors table

  2. Security
    - Maintain existing RLS policies
    - Add check constraints for valid delivery options
*/

-- Add delivery-related columns to orders table
ALTER TABLE orders
ADD COLUMN delivery_option text NOT NULL DEFAULT 'pickup'
CHECK (delivery_option IN ('pickup', 'delivery', 'stockpiling')),
ADD COLUMN delivery_details jsonb;

-- Remove default after adding column
ALTER TABLE orders
ALTER COLUMN delivery_option DROP DEFAULT;

-- Add is_perishable flag to products table
ALTER TABLE products
ADD COLUMN is_perishable boolean NOT NULL DEFAULT false;

-- Add location coordinates to vendors table
ALTER TABLE vendors
ADD COLUMN latitude numeric(10,8),
ADD COLUMN longitude numeric(11,8);

-- Add check constraints for coordinates
ALTER TABLE vendors
ADD CONSTRAINT valid_latitude CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90)),
ADD CONSTRAINT valid_longitude CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));