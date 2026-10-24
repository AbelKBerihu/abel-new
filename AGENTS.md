# Project rules

- Keep portfolio sections as focused React components and share visual roles through semantic CSS tokens, so the site stays cohesive and maintainable.
- Route private third-party credentials through Lovable Cloud functions, never browser code, because client bundles are publicly inspectable.

- Read public portfolio content through shared query hooks and invalidate those queries after CMS writes, so edits reach every section consistently.
- Protect the owner workspace with a server-validated user and has_role RPC; rely on existing RLS for all data operations, so client state cannot grant privileges.
- Store uploaded public portfolio images in a separate public bucket with admin-only writes, so private portfolio files remain private.
- Use Intl calendar formatting for local date rails and a capped canvas network for background motion, so the effects stay lightweight and honor reduced motion.
