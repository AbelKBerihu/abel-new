/*
# Ensure owner admin role assignment

Assigns the 'admin' role in user_roles for ks.avebina7@gmail.com if the user exists.
(Avoids inserting duplicate seed rows that conflict with 20261015000355_seed_portfolio_content.sql)
*/

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'ks.avebina7@gmail.com'
ON CONFLICT DO NOTHING;
