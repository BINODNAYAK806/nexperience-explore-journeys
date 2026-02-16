INSERT INTO public.user_roles (user_id, role) VALUES 
  ('0561f1fc-d7c4-4411-9477-796ab8c2401b', 'admin'),
  ('a6c8ccbf-d308-4ae8-af2c-b5cce92a4555', 'admin'),
  ('6012022c-d7f6-456c-93a2-75a40545716b', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;