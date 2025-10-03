-- Crear usuario superadmin para acceso directo al panel de administración
-- Ejecuta esto en Supabase SQL Editor

-- Insertar usuario superadmin directamente
INSERT INTO users (
  id,
  email,
  name,
  role,
  plan_id,
  tokens_used,
  tokens_limit,
  created_at,
  updated_at
) VALUES (
  'admin-001',  -- ID simple y fijo
  'admin@prompthub.com',
  'Super Admin',
  'superadmin',
  'plan_business',
  0,
  100000000,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE 
SET 
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  plan_id = EXCLUDED.plan_id,
  tokens_limit = EXCLUDED.tokens_limit,
  updated_at = NOW();

-- Verificar que se creó correctamente
SELECT 
  id,
  email,
  name,
  role,
  tokens_limit as "Tokens Disponibles"
FROM users 
WHERE role = 'superadmin'
LIMIT 1;