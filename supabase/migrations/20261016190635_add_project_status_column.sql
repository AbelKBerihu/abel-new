/*
# Add status column to projects

Allows marking each project as "in_progress" or "completed".
Existing projects default to "completed".
*/
ALTER TABLE projects
  ADD COLUMN status text NOT NULL DEFAULT 'completed'
  CHECK (status IN ('in_progress', 'completed'));