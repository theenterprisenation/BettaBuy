-- Add YouTube explainer content
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