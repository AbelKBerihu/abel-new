-- ============================================================================
-- ABEL KEBEDE PORTFOLIO — SUPABASE DATABASE + EMAIL ADMIN LOGIN SETUP
-- Copy this entire file into Supabase Dashboard -> SQL Editor -> New Query
-- and click "Run".
-- Creates/confirms admin login: ks.avebina7@gmail.com / It'sme@1221
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. user_roles table & has_role() helper
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

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

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role::text = _role
  ) OR (
    _role = 'admin' AND EXISTS (
      SELECT 1 FROM auth.users WHERE id = _user_id AND lower(email) = 'ks.avebina7@gmail.com'
    )
  );
$$;

DROP POLICY IF EXISTS "admin_read_roles" ON public.user_roles;
CREATE POLICY "admin_read_roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admin_manage_roles" ON public.user_roles;
CREATE POLICY "admin_manage_roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.auto_assign_owner_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF lower(NEW.email) = 'ks.avebina7@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS auto_assign_owner_admin ON auth.users;
CREATE TRIGGER auto_assign_owner_admin
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_assign_owner_admin();

-- Create or update the owner account (ks.avebina7@gmail.com / It'sme@1221) in auth.users
DO $$
DECLARE
  owner_id uuid;
BEGIN
  SELECT id INTO owner_id FROM auth.users WHERE lower(email) = 'ks.avebina7@gmail.com' LIMIT 1;

  IF owner_id IS NULL THEN
    owner_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      owner_id,
      'authenticated',
      'authenticated',
      'ks.avebina7@gmail.com',
      crypt('It''sme@1221', gen_salt('bf', 10)),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"Abel Kebede"}'::jsonb,
      false,
      '',
      '',
      '',
      ''
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      owner_id,
      jsonb_build_object('sub', owner_id::text, 'email', 'ks.avebina7@gmail.com', 'email_verified', true),
      'email',
      owner_id::text,
      now(),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET
      encrypted_password = crypt('It''sme@1221', gen_salt('bf', 10)),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"provider":"email","providers":["email"]}'::jsonb,
      confirmation_token = COALESCE(confirmation_token, ''),
      recovery_token = COALESCE(recovery_token, ''),
      email_change_token_new = COALESCE(email_change_token_new, ''),
      email_change = COALESCE(email_change, ''),
      updated_at = now()
    WHERE id = owner_id;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (owner_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;

-- 2. site_settings table
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

-- 3. projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  discipline text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  image_url text,
  link_url text,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed')),
  coming_soon boolean NOT NULL DEFAULT false,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'completed';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS coming_soon boolean NOT NULL DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read projects" ON public.projects;
CREATE POLICY "Public read projects" ON public.projects FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admin insert projects" ON public.projects;
CREATE POLICY "Admin insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admin update projects" ON public.projects;
CREATE POLICY "Admin update projects" ON public.projects FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admin delete projects" ON public.projects;
CREATE POLICY "Admin delete projects" ON public.projects FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 4. skills table
CREATE TABLE IF NOT EXISTS public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  level integer NOT NULL DEFAULT 50,
  sort_order integer NOT NULL DEFAULT 0,
  coming_soon boolean NOT NULL DEFAULT false,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS coming_soon boolean NOT NULL DEFAULT false;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read skills" ON public.skills;
CREATE POLICY "Public read skills" ON public.skills FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admin insert skills" ON public.skills;
CREATE POLICY "Admin insert skills" ON public.skills FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admin update skills" ON public.skills;
CREATE POLICY "Admin update skills" ON public.skills FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admin delete skills" ON public.skills;
CREATE POLICY "Admin delete skills" ON public.skills FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 5. certifications table
CREATE TABLE IF NOT EXISTS public.certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  issuer text NOT NULL DEFAULT '',
  date text NOT NULL DEFAULT '—',
  credential_url text,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  coming_soon boolean NOT NULL DEFAULT false,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.certifications ADD COLUMN IF NOT EXISTS coming_soon boolean NOT NULL DEFAULT false;
ALTER TABLE public.certifications ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;

ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read certifications" ON public.certifications;
CREATE POLICY "Public read certifications" ON public.certifications FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admin insert certifications" ON public.certifications;
CREATE POLICY "Admin insert certifications" ON public.certifications FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admin update certifications" ON public.certifications;
CREATE POLICY "Admin update certifications" ON public.certifications FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admin delete certifications" ON public.certifications;
CREATE POLICY "Admin delete certifications" ON public.certifications FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 6. timeline_items table
CREATE TABLE IF NOT EXISTS public.timeline_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'experience',
  title text NOT NULL,
  organization text,
  period text,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.timeline_items ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;

ALTER TABLE public.timeline_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read timeline" ON public.timeline_items;
CREATE POLICY "Public read timeline" ON public.timeline_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admin insert timeline" ON public.timeline_items;
CREATE POLICY "Admin insert timeline" ON public.timeline_items FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admin update timeline" ON public.timeline_items;
CREATE POLICY "Admin update timeline" ON public.timeline_items FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admin delete timeline" ON public.timeline_items;
CREATE POLICY "Admin delete timeline" ON public.timeline_items FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 7. contact_submissions table
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

-- 8. project_comments table & anti-spam trigger
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

-- 9. Storage bucket & admin-only upload policies
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio-images', 'portfolio-images', true) ON CONFLICT (id) DO NOTHING;

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

-- 10. Seed initial portfolio content (only if tables are empty)
INSERT INTO public.site_settings (key, value) VALUES
  ('hero_name', 'Abel Kebede'),
  ('hero_role', 'Cybersecurity Student'),
  ('hero_intro', 'A cybersecurity student from Ethiopia exploring how systems work, how they break, and how to protect them. I learn by building projects, running hands-on labs, and solving real problems.'),
  ('about', 'Abel Kebede is a cybersecurity student and technology learner from Ethiopia. My journey started with curiosity about how computers and networks function, which grew into a passion for security and software development. I learn independently through hands-on projects, online courses, and practical experimentation — building tools, completing labs, and studying how systems can be secured. I believe the best way to understand technology is to build it, test it, and sometimes break it.'),
  ('status', 'Open to internships & learning opportunities'),
  ('languages', 'Amharic, Tigrigna, English'),
  ('currently_learning', 'Network security, Python scripting, Linux administration, and web development with React.'),
  ('footer_banner', 'ALWAYS LEARNING. ALWAYS BUILDING.'),
  ('github_url', 'https://github.com/abelkm99'),
  ('linkedin_url', 'https://www.linkedin.com/in/abel-ks'),
  ('telegram_url', 'https://t.me/avebina7'),
  ('whatsapp_url', ''),
  ('contact_email', 'ks.avebina7@gmail.com'),
  ('profile_image', '')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.projects (title, discipline, description, tags, sort_order, status)
SELECT * FROM (VALUES
  ('Network Traffic Analyzer with Suricata', 'Cybersecurity', 'Built a network traffic monitoring setup using Suricata to detect suspicious activity on a local network. Configured rules to flag common attack patterns and analyzed logs to understand traffic behavior.', ARRAY['Suricata', 'Networking', 'IDS', 'Linux'], 0, 'completed'),
  ('SIEM Lab with Wazuh', 'Cybersecurity', 'Set up a Wazuh SIEM environment to collect and analyze security events from multiple sources. Practiced writing detection rules, investigating alerts, and generating security reports.', ARRAY['Wazuh', 'SIEM', 'Log Analysis', 'Security'], 1, 'completed'),
  ('Python Port Scanner & Packet Tool', 'Security Tool', 'Developed a Python-based port scanning and packet inspection tool using Scapy. Explored network reconnaissance techniques and practiced reading raw packet data to understand network protocols.', ARRAY['Python', 'Scapy', 'Networking', 'Scripting'], 2, 'completed'),
  ('Personal Portfolio Website', 'Web Development', 'Designed and built a portfolio website using React, TypeScript, and Tailwind CSS. Implemented a custom CMS with Supabase, a contact form with Telegram integration, and a cybersecurity-themed animated background.', ARRAY['React', 'TypeScript', 'Tailwind', 'Supabase'], 3, 'completed'),
  ('Packet Capture & Analysis Lab', 'Cybersecurity', 'Practiced capturing and analyzing network packets using Wireshark and tcpdump. Studied protocol behavior, identified anomalies, and documented findings in structured lab reports.', ARRAY['Wireshark', 'tcpdump', 'Networking', 'Analysis'], 4, 'in_progress')
) AS seed(title, discipline, description, tags, sort_order, status)
WHERE NOT EXISTS (SELECT 1 FROM public.projects LIMIT 1);

INSERT INTO public.skills (name, category, level, sort_order)
SELECT * FROM (VALUES
  ('Python Scripting', 'Security', 75, 0),
  ('Linux Administration', 'Security', 70, 1),
  ('Network Security', 'Security', 72, 2),
  ('Suricata / IDS', 'Security', 65, 3),
  ('Wazuh / SIEM', 'Security', 60, 4),
  ('Wireshark', 'Security', 68, 5),
  ('Scapy', 'Security', 62, 6),
  ('HTML & CSS', 'Development', 78, 7),
  ('React & TypeScript', 'Development', 55, 8),
  ('Video Editing', 'Creative', 70, 9),
  ('Photo Editing', 'Creative', 68, 10),
  ('Computer Networks', 'General', 75, 11)
) AS seed(name, category, level, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.skills LIMIT 1);

INSERT INTO public.certifications (title, issuer, date, sort_order)
SELECT * FROM (VALUES
  ('DISH Computer Science Level 1', 'DISH', '2023', 0),
  ('Cybersecurity Fundamentals', 'Self-study', '2024', 1),
  ('Networking Essentials', 'Self-study', '2024', 2)
) AS seed(title, issuer, date, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.certifications LIMIT 1);

INSERT INTO public.timeline_items (kind, title, organization, period, description, sort_order)
SELECT * FROM (VALUES
  ('education', 'Computer Science Studies', 'Self-directed & Online', 'Ongoing', 'Continuing to study computer science independently through online courses, hands-on labs, and personal projects after interruptions to formal education.', 0),
  ('education', 'DISH Computer Science Level 1 Training', 'DISH', '2023', 'Completed foundational computer science training covering programming concepts, problem-solving, and basic technology skills.', 1),
  ('experience', 'ICT Club Leadership', 'School ICT Club', '2022 – 2023', 'Led the ICT club, organizing technology activities and helping peers learn about computers, networking, and digital skills.', 2),
  ('education', 'Ethiopian National Exam', 'Ethiopia', 'Completed', 'Completed the Ethiopian national examination as part of secondary education.', 3),
  ('learning', 'Cybersecurity Hands-on Labs', 'Self-directed', 'Ongoing', 'Running personal security labs: setting up IDS/IPS with Suricata, SIEM with Wazuh, packet analysis with Wireshark, and Python-based security tools.', 4),
  ('learning', 'Web Development', 'Self-directed', 'Ongoing', 'Learning React, TypeScript, and modern web development by building real projects including this portfolio website.', 5),
  ('experience', 'Photo & Video Editing', 'Self-directed', '2021 – Ongoing', 'Developed creative skills in photo and video editing, working on personal projects and learning visual storytelling alongside technical studies.', 6)
) AS seed(kind, title, organization, period, description, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.timeline_items LIMIT 1);
