/*
# Portfolio CMS tables for Abel Kebede's personal portfolio
Creates all tables: user_roles, site_settings, projects, skills, certifications,
timeline_items, contact_submissions, project_comments.
RLS on every table. Public read on content, admin-only writes.
*/

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===== user_roles (must exist before has_role function) =====
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_read_roles" ON public.user_roles;
CREATE POLICY "admin_read_roles" ON public.user_roles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "admin_manage_roles" ON public.user_roles;
CREATE POLICY "admin_manage_roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ===== has_role function =====
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role); $$;

-- ===== site_settings =====
CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read settings" ON public.site_settings;
CREATE POLICY "Public read settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admin insert settings" ON public.site_settings;
CREATE POLICY "Admin insert settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admin update settings" ON public.site_settings;
CREATE POLICY "Admin update settings" ON public.site_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admin delete settings" ON public.site_settings;
CREATE POLICY "Admin delete settings" ON public.site_settings FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ===== projects =====
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  discipline text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  image_url text,
  link_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read projects" ON public.projects;
CREATE POLICY "Public read projects" ON public.projects FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admin insert projects" ON public.projects;
CREATE POLICY "Admin insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admin update projects" ON public.projects;
CREATE POLICY "Admin update projects" ON public.projects FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admin delete projects" ON public.projects;
CREATE POLICY "Admin delete projects" ON public.projects FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ===== skills =====
CREATE TABLE IF NOT EXISTS public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  level integer NOT NULL DEFAULT 50,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read skills" ON public.skills;
CREATE POLICY "Public read skills" ON public.skills FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admin insert skills" ON public.skills;
CREATE POLICY "Admin insert skills" ON public.skills FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admin update skills" ON public.skills;
CREATE POLICY "Admin update skills" ON public.skills FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admin delete skills" ON public.skills;
CREATE POLICY "Admin delete skills" ON public.skills FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ===== certifications =====
CREATE TABLE IF NOT EXISTS public.certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  issuer text NOT NULL DEFAULT '',
  date text NOT NULL DEFAULT '—',
  credential_url text,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read certifications" ON public.certifications;
CREATE POLICY "Public read certifications" ON public.certifications FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admin insert certifications" ON public.certifications;
CREATE POLICY "Admin insert certifications" ON public.certifications FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admin update certifications" ON public.certifications;
CREATE POLICY "Admin update certifications" ON public.certifications FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admin delete certifications" ON public.certifications;
CREATE POLICY "Admin delete certifications" ON public.certifications FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ===== timeline_items =====
CREATE TABLE IF NOT EXISTS public.timeline_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'experience',
  title text NOT NULL,
  organization text,
  period text,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.timeline_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read timeline" ON public.timeline_items;
CREATE POLICY "Public read timeline" ON public.timeline_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admin insert timeline" ON public.timeline_items;
CREATE POLICY "Admin insert timeline" ON public.timeline_items FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admin update timeline" ON public.timeline_items;
CREATE POLICY "Admin update timeline" ON public.timeline_items FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admin delete timeline" ON public.timeline_items;
CREATE POLICY "Admin delete timeline" ON public.timeline_items FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ===== contact_submissions =====
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  project_needs text,
  preferred_date date NOT NULL DEFAULT CURRENT_DATE,
  ai_brief text,
  telegram_delivered boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin read submissions" ON public.contact_submissions;
CREATE POLICY "Admin read submissions" ON public.contact_submissions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admin delete submissions" ON public.contact_submissions;
CREATE POLICY "Admin delete submissions" ON public.contact_submissions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX IF NOT EXISTS contact_submissions_created_at_idx ON public.contact_submissions (created_at DESC);

-- ===== project_comments =====
CREATE TABLE IF NOT EXISTS public.project_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  comment text NOT NULL,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS project_comments_project_idx ON public.project_comments (project_id, created_at DESC);
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read approved comments" ON public.project_comments;
CREATE POLICY "Public read approved comments" ON public.project_comments FOR SELECT TO anon, authenticated USING (approved = true OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Anyone can submit pending comment" ON public.project_comments;
CREATE POLICY "Anyone can submit pending comment" ON public.project_comments FOR INSERT TO anon, authenticated WITH CHECK (approved = false AND char_length(btrim(name)) BETWEEN 2 AND 60 AND char_length(btrim(comment)) BETWEEN 3 AND 1000);
DROP POLICY IF EXISTS "Admin update comments" ON public.project_comments;
CREATE POLICY "Admin update comments" ON public.project_comments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admin delete comments" ON public.project_comments;
CREATE POLICY "Admin delete comments" ON public.project_comments FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ===== Comment guard trigger =====
CREATE OR REPLACE FUNCTION public.guard_project_comment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN RETURN NEW; END IF;
  NEW.name := btrim(regexp_replace(NEW.name, '<[^>]*>', '', 'g'));
  NEW.comment := btrim(regexp_replace(NEW.comment, '<[^>]*>', '', 'g'));
  NEW.approved := false;
  IF NEW.name IS NULL OR char_length(NEW.name) < 2 THEN RAISE EXCEPTION 'Name too short'; END IF;
  IF NEW.comment IS NULL OR char_length(NEW.comment) < 3 THEN RAISE EXCEPTION 'Comment too short'; END IF;
  IF NEW.comment ~* '(https?://|www\.)' AND (SELECT count(*) FROM regexp_matches(NEW.comment, 'https?://', 'g')) > 1 THEN RAISE EXCEPTION 'Too many links'; END IF;
  IF EXISTS (SELECT 1 FROM public.project_comments WHERE comment = NEW.comment AND created_at > now() - interval '1 day') THEN RAISE EXCEPTION 'Duplicate comment'; END IF;
  IF (SELECT count(*) FROM public.project_comments WHERE lower(name) = lower(NEW.name) AND created_at > now() - interval '10 minutes') >= 3 THEN RAISE EXCEPTION 'Please wait before commenting again'; END IF;
  IF (SELECT count(*) FROM public.project_comments WHERE created_at > now() - interval '1 hour') >= 40 THEN RAISE EXCEPTION 'Comments are temporarily paused'; END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS project_comment_guard ON public.project_comments;
CREATE TRIGGER project_comment_guard BEFORE INSERT ON public.project_comments FOR EACH ROW EXECUTE FUNCTION public.guard_project_comment();

-- ===== Storage bucket =====
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio-images', 'portfolio-images', true) ON CONFLICT (id) DO NOTHING;
