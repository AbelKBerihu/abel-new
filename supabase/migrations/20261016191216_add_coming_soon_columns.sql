/*
# Add coming_soon column to projects, certifications, skills

This is separate from the progress status. It lets the admin mark
placeholder items that will appear as "Coming soon" cards on the public site.
*/
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS coming_soon boolean NOT NULL DEFAULT false;

ALTER TABLE certifications
  ADD COLUMN IF NOT EXISTS coming_soon boolean NOT NULL DEFAULT false;

ALTER TABLE skills
  ADD COLUMN IF NOT EXISTS coming_soon boolean NOT NULL DEFAULT false;