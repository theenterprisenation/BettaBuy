-- First, modify the type check constraint to allow 'youtube' type
ALTER TABLE site_content 
DROP CONSTRAINT IF EXISTS site_content_type_check;

ALTER TABLE site_content 
ADD CONSTRAINT site_content_type_check 
CHECK (type IN ('menu', 'text', 'logo', 'youtube'));

-- Then add YouTube explainer content
INSERT INTO site_content (type, key, value)
VALUES (
  'youtube',
  'youtube_explainer',
  '{
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "title": "How Group Buying Works",
    "description": "Learn how to save money and build community through group food purchases"
  }'::jsonb
) ON CONFLICT (type, key) DO UPDATE
  SET value = EXCLUDED.value;