/*
# Seed portfolio content for Abel Kebede
Populates site_settings, projects, skills, certifications, and timeline_items.
*/

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
  ('contact_email', 'ks.avebina7@gmail.com')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

INSERT INTO public.projects (title, discipline, description, tags, sort_order) VALUES
  ('Network Traffic Analyzer with Suricata', 'Cybersecurity', 'Built a network traffic monitoring setup using Suricata to detect suspicious activity on a local network. Configured rules to flag common attack patterns and analyzed logs to understand traffic behavior.', ARRAY['Suricata', 'Networking', 'IDS', 'Linux'], 0),
  ('SIEM Lab with Wazuh', 'Cybersecurity', 'Set up a Wazuh SIEM environment to collect and analyze security events from multiple sources. Practiced writing detection rules, investigating alerts, and generating security reports.', ARRAY['Wazuh', 'SIEM', 'Log Analysis', 'Security'], 1),
  ('Python Port Scanner & Packet Tool', 'Security Tool', 'Developed a Python-based port scanning and packet inspection tool using Scapy. Explored network reconnaissance techniques and practiced reading raw packet data to understand network protocols.', ARRAY['Python', 'Scapy', 'Networking', 'Scripting'], 2),
  ('Personal Portfolio Website', 'Web Development', 'Designed and built a portfolio website using React, TypeScript, and Tailwind CSS. Implemented a custom CMS with Supabase, a contact form with Telegram integration, and a cybersecurity-themed animated background.', ARRAY['React', 'TypeScript', 'Tailwind', 'Supabase'], 3),
  ('Packet Capture & Analysis Lab', 'Cybersecurity', 'Practiced capturing and analyzing network packets using Wireshark and tcpdump. Studied protocol behavior, identified anomalies, and documented findings in structured lab reports.', ARRAY['Wireshark', 'tcpdump', 'Networking', 'Analysis'], 4)
ON CONFLICT DO NOTHING;

INSERT INTO public.skills (name, category, level, sort_order) VALUES
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
ON CONFLICT DO NOTHING;

INSERT INTO public.certifications (title, issuer, date, sort_order) VALUES
  ('DISH Computer Science Level 1', 'DISH', '2023', 0),
  ('Cybersecurity Fundamentals', 'Self-study', '2024', 1),
  ('Networking Essentials', 'Self-study', '2024', 2)
ON CONFLICT DO NOTHING;

INSERT INTO public.timeline_items (kind, title, organization, period, description, sort_order) VALUES
  ('education', 'Computer Science Studies', 'Self-directed & Online', 'Ongoing', 'Continuing to study computer science independently through online courses, hands-on labs, and personal projects after interruptions to formal education.', 0),
  ('education', 'DISH Computer Science Level 1 Training', 'DISH', '2023', 'Completed foundational computer science training covering programming concepts, problem-solving, and basic technology skills.', 1),
  ('experience', 'ICT Club Leadership', 'School ICT Club', '2022 – 2023', 'Led the ICT club, organizing technology activities and helping peers learn about computers, networking, and digital skills.', 2),
  ('education', 'Ethiopian National Exam', 'Ethiopia', 'Completed', 'Completed the Ethiopian national examination as part of secondary education.', 3),
  ('learning', 'Cybersecurity Hands-on Labs', 'Self-directed', 'Ongoing', 'Running personal security labs: setting up IDS/IPS with Suricata, SIEM with Wazuh, packet analysis with Wireshark, and Python-based security tools.', 4),
  ('learning', 'Web Development', 'Self-directed', 'Ongoing', 'Learning React, TypeScript, and modern web development by building real projects including this portfolio website.', 5),
  ('experience', 'Photo & Video Editing', 'Self-directed', '2021 – Ongoing', 'Developed creative skills in photo and video editing, working on personal projects and learning visual storytelling alongside technical studies.', 6)
ON CONFLICT DO NOTHING;
