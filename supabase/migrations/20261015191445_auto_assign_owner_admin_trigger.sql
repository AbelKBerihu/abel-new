/*
# Auto-assign admin role for owner email

When the owner signs in with Google OAuth, a new auth user is created
without an entry in user_roles. This trigger automatically assigns
the 'admin' role when a new user is created with the owner's email.
*/

CREATE OR REPLACE FUNCTION public.auto_assign_owner_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email = 'ks.avebina7@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS auto_assign_owner_admin ON auth.users;
CREATE TRIGGER auto_assign_owner_admin
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.auto_assign_owner_admin();