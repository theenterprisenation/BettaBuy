/*
  # Add vendor location fields

  1. Changes
    - Add state and city fields to products table
    - Add NOT NULL constraints to ensure locations are always provided
    - Add check constraints to validate state and city are not empty

  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE products
ADD COLUMN state text NOT NULL DEFAULT '',
ADD COLUMN city text NOT NULL DEFAULT '';

-- Remove default values after adding columns
ALTER TABLE products 
ALTER COLUMN state DROP DEFAULT,
ALTER COLUMN city DROP DEFAULT;

-- Add check constraints
ALTER TABLE products
ADD CONSTRAINT valid_state CHECK (length(trim(state)) > 0),
ADD CONSTRAINT valid_city CHECK (length(trim(city)) > 0);