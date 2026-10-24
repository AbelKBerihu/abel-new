/*
# Security & Deduplication Fixes
1. Lock down user_roles RLS so only admins can grant/modify roles.
2. Add UNIQUE (user_id, role) constraint on user_roles.
3. Lock down portfolio-images storage write policies to admins only.
4. Remove duplicate rows in projects, skills, certifications, and timeline_items.
*/

-- Deduplicate user_roles before adding unique constraint
DELETE FROM public.user_roles a
USING public.user_roles b
WHERE a.id > b.id
  AND a.user_id = b.user_id
  AND a.role = b.role;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_user_id_role_key'
  ) THEN
    ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);
  END IF;
END $$;

DROP POLICY IF EXISTS "admin_manage_roles" ON public.user_roles;
CREATE POLICY "admin_manage_roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Lock down portfolio-images storage write policies to admin only
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

-- Deduplicate projects by title (keep earliest created_at)
DELETE FROM public.projects a
USING public.projects b
WHERE a.created_at > b.created_at
  AND lower(a.title) = lower(b.title);

-- Deduplicate skills by name (keep earliest created_at)
DELETE FROM public.skills a
USING public.skills b
WHERE a.created_at > b.created_at
  AND lower(a.name) = lower(b.name);

-- Deduplicate certifications by title (keep earliest created_at)
DELETE FROM public.certifications a
USING public.certifications b
WHERE a.created_at > b.created_at
  AND lower(a.title) = lower(b.title);

-- Deduplicate timeline_items by title (keep earliest created_at)
DELETE FROM public.timeline_items a
USING public.timeline_items b
WHERE a.created_at > b.created_at
  AND lower(a.title) = lower(b.title);
