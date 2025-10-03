-- PromptHub v2 - Schema Update para Imagen/Video y OpenRouter
-- Ejecutar DESPUÉS del schema principal

-- 1. Añadir nuevo enum para tipo de media
DO $$ BEGIN
    CREATE TYPE media_type AS ENUM ('text', 'image', 'video');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Añadir columnas a prompts para soporte de media
ALTER TABLE prompts 
ADD COLUMN IF NOT EXISTS media_type media_type DEFAULT 'text',
ADD COLUMN IF NOT EXISTS preview_url TEXT,
ADD COLUMN IF NOT EXISTS preview_thumbnail TEXT;

-- 3. Añadir OpenRouter como proveedor
INSERT INTO providers (id, name, enabled, base_url) 
VALUES ('openrouter', 'OpenRouter', true, 'https://openrouter.ai/api/v1')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, base_url = EXCLUDED.base_url;

-- 4. Añadir modelos de OpenRouter (ejemplos populares)
INSERT INTO models (id, name, provider_id, input_cost, output_cost, max_tokens, enabled) VALUES
('openrouter/openai/gpt-4-turbo', 'GPT-4 Turbo (OpenRouter)', 'openrouter', 0.01, 0.03, 128000, true),
('openrouter/anthropic/claude-3-opus', 'Claude 3 Opus (OpenRouter)', 'openrouter', 0.015, 0.075, 200000, true),
('openrouter/google/gemini-pro-1.5', 'Gemini Pro 1.5 (OpenRouter)', 'openrouter', 0.00125, 0.005, 1000000, true),
('openrouter/meta-llama/llama-3-70b', 'Llama 3 70B (OpenRouter)', 'openrouter', 0.0007, 0.0009, 8192, true),
('openrouter/mistral/mixtral-8x7b', 'Mixtral 8x7B (OpenRouter)', 'openrouter', 0.0005, 0.0005, 32000, true)
ON CONFLICT (id) DO NOTHING;

-- 5. Actualizar categorías con iconos específicos para cada tipo
UPDATE categories SET icon = 'FileText' WHERE name = 'Copywriting';
UPDATE categories SET icon = 'Code2' WHERE name = 'Desarrollo';
UPDATE categories SET icon = 'TrendingUp' WHERE name = 'SEO';
UPDATE categories SET icon = 'BarChart3' WHERE name = 'Análisis';
UPDATE categories SET icon = 'Palette' WHERE name = 'Creatividad';
UPDATE categories SET icon = 'GraduationCap' WHERE name = 'Educación';
UPDATE categories SET icon = 'MessageSquare' WHERE name = 'Social Media';
UPDATE categories SET icon = 'Zap' WHERE name = 'Productividad';

-- Comentario sobre migracion de datos de ejemplo:
-- Los datos de ejemplo ya están en la base de datos de Supabase
-- Puedes gestionarlos directamente desde el panel de administración
-- o desde la consola SQL de Supabase cuando quieras limpiarlos