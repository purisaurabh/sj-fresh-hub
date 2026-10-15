-- Create the first admin. Never commit a real mobile number or password.
-- Admins log in on /login with the same mobile number and password as customers.
-- The app then reads profiles.role and opens /admin automatically.

-- 1. Open /register and create an account with the shop owner's 10-digit
--    mobile number, password, name, and any active building.
-- 2. Replace the phone below with that number and run this in the SQL editor.

update public.profiles
set role = 'admin'
where phone = '9999999999';

-- Confirm it worked:
-- select id, full_name, phone, role from public.profiles where role = 'admin';
