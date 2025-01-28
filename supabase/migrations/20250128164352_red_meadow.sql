-- Check auth.users table
SELECT id, email, confirmed_at
FROM auth.users
WHERE email = 'purplereefng@gmail.com';

-- Check users table with role information
SELECT 
  u.id,
  u.email,
  r.name as role_name
FROM users u
JOIN roles r ON u.role_id = r.id
WHERE u.email = 'purplereefng@gmail.com';