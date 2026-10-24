# AI Rules and Project Guidelines

## Tech Stack
- **Framework & Build:** React 18 with Vite and TypeScript (strict mode enabled).
- **Styling:** Tailwind CSS with tailwindcss-animate and PostCSS for rapid, utility-first UI styling.
- **UI Components:** shadcn/ui component primitives built on top of Radix UI primitives (`@radix-ui/*`).
- **Icons:** `lucide-react` for all system, interface, and indicator icons.
- **Routing:** React Router v6 (`react-router-dom`) with client-side SPA routing centered in `src/App.tsx`.
- **Server State & Data Fetching:** TanStack React Query (`@tanstack/react-query`) for caching, background refetching, and state management.
- **Backend & Database:** Supabase (`@supabase/supabase-js`) providing database querying, Row-Level Security (RLS), authentication, and storage.
- **Notifications & Feedback:** `sonner` for toast notifications and alert feedback.
- **Animations:** Framer Motion (`framer-motion`) for smooth page transitions and interactive micro-animations.

---

## Library Usage Rules

### 1. UI Components & Layout (`shadcn/ui` + Radix UI)
- **Do not invent custom low-level UI primitives** (modals, dropdowns, tooltips, dialogs, tabs). Always import and compose shadcn/ui components located in `@/components/ui/`.
- Never modify the base files inside `src/components/ui/` directly; build wrappers or feature-level components in `src/components/`.
- Ensure accessible markup: all interactive controls must be keyboard accessible and labeled properly.

### 2. Styling (Tailwind CSS)
- Style components exclusively with Tailwind utility classes.
- Use `cn(...)` from `@/lib/utils` whenever joining conditional class names.
- Stick to semantic theme color tokens defined in `tailwind.config.ts` (e.g., `bg-background`, `text-foreground`, `border-border`, `bg-primary`, `text-muted-foreground`).
- Avoid raw hardcoded hex codes unless specifically representing branding colors.

### 3. Icons (`lucide-react`)
- Always use `lucide-react` icons. Do not install external icon libraries (e.g., FontAwesome, react-icons).
- Set consistent sizing using standard Tailwind dimensions (e.g., `className="h-4 w-4"` or `className="h-5 w-5"`).

### 4. Routing (`react-router-dom`)
- Keep route definitions consolidated in `src/App.tsx`.
- Page views reside under `src/pages/` (e.g., `src/pages/Index.tsx`, `src/pages/Admin.tsx`).
- Use `<Link to="...">` or `useNavigate()` for internal navigation; do not use raw `<a>` tags for client-routed paths.

### 5. Backend & Supabase Client (`@supabase/supabase-js`)
- Import the Supabase client instance solely from `@/integrations/supabase/client`.
- Check `isSupabaseConfigured` before executing network operations that require Supabase credentials, or handle network/missing credential errors gracefully so the frontend never crashes when environment variables are omitted or pending.
- Rely on TypeScript types from `@/integrations/supabase/types` to maintain type safety when interacting with table schemas.

### 6. Data Fetching & Caching (`@tanstack/react-query`)
- Use React Query (`useQuery`, `useMutation`) for asynchronous remote data, caching, and mutation state.
- Keep query keys standardized (e.g., `['portfolio', table]`, `['comments', projectId]`).
- Do not store fetched API server state in React `useState` when TanStack React Query can manage it directly.

### 7. Feedback & Notifications (`sonner`)
- Use `toast.success()`, `toast.error()`, and `toast.info()` from `sonner` for user action feedback.
- Ensure messages are actionable, concise, and clear.
