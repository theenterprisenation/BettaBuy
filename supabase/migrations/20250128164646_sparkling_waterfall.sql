-- Check auth.users table first
SELECT id, email, confirmed_at
FROM auth.users
WHERE email = 'purplereefng@gmail.com';

-- Check users table with role information by joining with auth.users
SELECT 
  u.id,
  au.email,
  r.name as role_name
FROM users u
JOIN auth.users au ON u.id = au.id
JOIN roles r ON u.role_id = r.id
WHERE au.email = 'purplereefng@gmail.com';