/*
  # Add site content management

  1. New Tables
    - `site_content`
      - `id` (uuid, primary key)
      - `type` (text) - Type of content (menu, text, logo)
      - `key` (text) - Unique identifier for the content
      - `value` (jsonb) - Content value
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on site_content table
    - Add policies for admin management and public reading
*/

-- Create site_content table
CREATE TABLE site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('menu', 'text', 'logo')),
  key text NOT NULL,
  value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(type, key)
);

-- Enable RLS
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view site content"
  ON site_content
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage site content"
  ON site_content
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.name = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON site_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default content
INSERT INTO site_content (type, key, value) VALUES
  ('menu', 'main_menu', '[
    {"label": "Home", "path": "/"},
    {"label": "Products", "path": "/products"},
    {"label": "Contact", "path": "/contact"},
    {"label": "FAQ", "path": "/faq"}
  ]'::jsonb),
  ('text', 'hero_title', '"Buy Together, Save Together"'::jsonb),
  ('text', 'hero_subtitle', '"Join the smart food shopping revolution. Connect with others, buy in bulk, and save money while enjoying quality food."'::jsonb),
  ('logo', 'main_logo', '{"icon": "shopping-basket", "text": "Foodrient"}'::jsonb);