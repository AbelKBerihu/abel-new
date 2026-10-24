/*
# Storage policies for portfolio-images bucket

Allows:
- Anyone (anon + authenticated) to SELECT (read) public images
- Only authenticated admins to INSERT/UPDATE/DELETE objects in portfolio-images
*/

DROP POLICY IF EXISTS "read_portfolio_images" ON storage.objects;
CREATE POLICY "read_portfolio_images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'portfolio-images');

DROP POLICY IF EXISTS "upload_portfolio_images" ON storage.objects;
CREATE POLICY "upload_portfolio_images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'portfolio-images' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "update_portfolio_images" ON storage.objects;
CREATE POLICY "update_portfolio_images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'portfolio-images' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'portfolio-images' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "delete_portfolio_images" ON storage.objects;
CREATE POLICY "delete_portfolio_images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'portfolio-images' AND public.has_role(auth.uid(), 'admin'));
