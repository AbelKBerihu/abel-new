/*
# Fix admin user password hash

The previous migration created the admin user with a bcrypt cost factor of 6.
Supabase Auth expects cost factor 10. This updates the password hash.
*/

UPDATE auth.users
SET 
  encrypted_password = crypt('It''sme@1221', gen_salt('bf', 10)),
  email_confirmed_at = now(),
  updated_at = now()
WHERE email = 'ks.avebina7@gmail.com';