-- Enable Storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vendor-images', 'vendor-images', true);

-- Set up storage policies for vendor images
CREATE POLICY "Vendors can upload images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'vendor-images' AND
  (auth.uid() IN (
    SELECT user_id FROM vendors
  ) OR auth.uid() IN (
    SELECT u.id FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE r.name = 'admin'
  ))
);

CREATE POLICY "Anyone can view vendor images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'vendor-images');

CREATE POLICY "Vendors can update their own images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'vendor-images' AND
  (auth.uid() IN (
    SELECT user_id FROM vendors WHERE user_id = auth.uid()
  ) OR auth.uid() IN (
    SELECT u.id FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE r.name = 'admin'
  ))
);

CREATE POLICY "Vendors can delete their own images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'vendor-images' AND
  (auth.uid() IN (
    SELECT user_id FROM vendors WHERE user_id = auth.uid()
  ) OR auth.uid() IN (
    SELECT u.id FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE r.name = 'admin'
  ))
);