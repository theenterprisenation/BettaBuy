/*
  # Add Product Share Date Range

  1. Changes
    - Add share_date_start and share_date_end columns to products table
    - Add validation to ensure share dates are after purchase window
    - Add validation to ensure share_date_end is after share_date_start

  2. Notes
    - Share dates must be after the purchase window end date
    - Share date range is when products will be distributed to buyers
    - Required for proper delivery scheduling
*/

-- Add share date columns to products table
ALTER TABLE products
ADD COLUMN share_date_start timestamptz NOT NULL DEFAULT now(),
ADD COLUMN share_date_end timestamptz NOT NULL DEFAULT now();

-- Remove default values after adding columns
ALTER TABLE products 
ALTER COLUMN share_date_start DROP DEFAULT,
ALTER COLUMN share_date_end DROP DEFAULT;

-- Add check constraints to ensure valid date ranges
ALTER TABLE products
ADD CONSTRAINT valid_share_window 
  CHECK (share_date_end > share_date_start),
ADD CONSTRAINT share_after_purchase 
  CHECK (share_date_start >= purchase_window_end);

-- Update existing products to have valid share dates (if any exist)
UPDATE products
SET 
  share_date_start = purchase_window_end + interval '1 day',
  share_date_end = purchase_window_end + interval '7 days'
WHERE share_date_start = share_date_end;

-- Create index for efficient date range queries
CREATE INDEX idx_products_share_dates 
ON products(share_date_start, share_date_end);