/*
# Add is_visible column to content tables

Adds an is_visible boolean column to projects, skills, certifications,
and timeline_items. This lets the admin hide items from the public site
without deleting them. Defaults to true so existing items remain visible.

1. New Columns
- projects.is_visible (boolean, default true)
- skills.is_visible (boolean, default true)
- certifications.is_visible (boolean, default true)
- timeline_items.is_visible (boolean, default true)

2. Security
- No RLS changes needed. Existing policies cover the new column.
*/

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;
ALTER TABLE public.certifications ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;
ALTER TABLE public.timeline_items ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;