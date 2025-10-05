-- Planes de ejemplo para PromptHub v2
-- Ejecutar en Supabase SQL Editor

-- Eliminar planes existentes (opcional, comenta si quieres mantenerlos)
-- DELETE FROM plans;

-- Insertar planes individuales
INSERT INTO plans (id, name, price, tokens_included, overage_price, active) VALUES
('plan_basico', 'Básico', 9.99, 50000, 0.0001, true),
('plan_business', 'Business', 29.99, 200000, 0.00008, true),
('plan_plus', 'Plus', 49.99, 500000, 0.00006, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  tokens_included = EXCLUDED.tokens_included,
  overage_price = EXCLUDED.overage_price,
  active = EXCLUDED.active;

-- Plan Multitenant (base para equipos)
INSERT INTO plans (id, name, price, tokens_included, overage_price, active) VALUES
('plan_multitenant', 'Multitenant (Equipos)', 29.00, 200000, 0.00008, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  tokens_included = EXCLUDED.tokens_included,
  overage_price = EXCLUDED.overage_price,
  active = EXCLUDED.active;

-- Añadir columna de almacenamiento a planes (si no existe)
ALTER TABLE plans 
ADD COLUMN IF NOT EXISTS storage_limit_mb INTEGER DEFAULT 100;

-- Actualizar límites de almacenamiento por plan
UPDATE plans SET storage_limit_mb = 500 WHERE id = 'plan_basico';
UPDATE plans SET storage_limit_mb = 2000 WHERE id = 'plan_business';
UPDATE plans SET storage_limit_mb = 5000 WHERE id = 'plan_plus';
UPDATE plans SET storage_limit_mb = 2000 WHERE id = 'plan_multitenant';

-- Comentarios sobre descuentos multitenant:
-- Los descuentos del 10% (2-19 usuarios) y 20% (20+ usuarios)
-- se calcularán en el frontend/backend al momento de facturación
-- El precio base es $29/usuario/mes