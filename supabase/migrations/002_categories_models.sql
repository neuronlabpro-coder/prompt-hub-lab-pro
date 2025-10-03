-- ====================================
-- CATEGORIES, SUBCATEGORIES & MODELS UPDATE
-- ====================================
-- Este archivo actualiza el sistema de categorías y modelos LLM

-- 1. CREAR TABLA DE SUBCATEGORÍAS
CREATE TABLE IF NOT EXISTS subcategories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subcategories_category ON subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_active ON subcategories(is_active);

-- 2. AGREGAR CAMPOS A PROMPTS PARA MODELOS Y SUBCATEGORÍAS
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS preferred_model_id TEXT REFERENCES models(id);
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS subcategory_id TEXT REFERENCES subcategories(id);

CREATE INDEX IF NOT EXISTS idx_prompts_model ON prompts(preferred_model_id);
CREATE INDEX IF NOT EXISTS idx_prompts_subcategory ON prompts(subcategory_id);

-- 3. AGREGAR NUEVOS PROVIDERS
INSERT INTO providers (id, name, enabled, base_url)
VALUES 
  ('google', 'Google Gemini', true, 'https://generativelanguage.googleapis.com/v1beta'),
  ('deepseek', 'DeepSeek', true, 'https://api.deepseek.com/v1')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  base_url = EXCLUDED.base_url;

-- 4. AGREGAR NUEVOS MODELOS
INSERT INTO models (id, name, provider_id, input_cost, output_cost, max_tokens, enabled)
VALUES 
  -- Gemini Models
  ('gemini-2.0-flash-exp', 'Gemini 2.0 Flash', 'google', 0.000001, 0.000002, 1000000, true),
  ('gemini-1.5-pro', 'Gemini 1.5 Pro', 'google', 0.00000125, 0.00000375, 2000000, true),
  ('gemini-1.5-flash', 'Gemini 1.5 Flash', 'google', 0.000000075, 0.0000003, 1000000, true),
  -- DeepSeek Models
  ('deepseek-chat', 'DeepSeek Chat', 'deepseek', 0.00000014, 0.00000028, 64000, true),
  ('deepseek-coder', 'DeepSeek Coder', 'deepseek', 0.00000014, 0.00000028, 64000, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  input_cost = EXCLUDED.input_cost,
  output_cost = EXCLUDED.output_cost;

-- 5. ELIMINAR CATEGORÍAS ANTIGUAS Y CREAR NUEVAS
DELETE FROM categories;

INSERT INTO categories (id, name, description, icon, color) VALUES
  ('text', 'Texto', 'Prompts para generación de contenido textual', 'FileText', 'bg-blue-500'),
  ('image', 'Imagen', 'Prompts para generación de imágenes', 'Image', 'bg-purple-500'),
  ('video', 'Vídeo', 'Prompts para generación de vídeos', 'Video', 'bg-red-500');

-- 6. CREAR SUBCATEGORÍAS PARA TEXTO
INSERT INTO subcategories (id, name, description, category_id, icon, color) VALUES
  ('text-marketing', 'Marketing', 'Contenido para campañas y publicidad', 'text', 'TrendingUp', 'bg-orange-500'),
  ('text-social', 'Redes Sociales', 'Posts y contenido para RRSS', 'text', 'Share2', 'bg-blue-400'),
  ('text-business', 'Negocios', 'Emails, reportes y documentos empresariales', 'text', 'Briefcase', 'bg-gray-600'),
  ('text-creative', 'Creativo', 'Historias, poemas y contenido artístico', 'text', 'Sparkles', 'bg-pink-500'),
  ('text-education', 'Educación', 'Material educativo y tutoriales', 'text', 'GraduationCap', 'bg-indigo-500'),
  ('text-code', 'Programación', 'Código y documentación técnica', 'text', 'Code2', 'bg-green-600');

-- 7. CREAR SUBCATEGORÍAS PARA IMAGEN
INSERT INTO subcategories (id, name, description, category_id, icon, color) VALUES
  ('image-marketing', 'Marketing', 'Imágenes publicitarias y promocionales', 'image', 'TrendingUp', 'bg-orange-500'),
  ('image-social', 'Redes Sociales', 'Imágenes para posts y stories', 'image', 'Share2', 'bg-blue-400'),
  ('image-animals', 'Animales', 'Imágenes de mascotas y fauna', 'image', 'PawPrint', 'bg-amber-600'),
  ('image-nature', 'Naturaleza', 'Paisajes y elementos naturales', 'image', 'Trees', 'bg-green-500'),
  ('image-people', 'Personas', 'Retratos y personas', 'image', 'Users', 'bg-purple-400'),
  ('image-art', 'Arte Digital', 'Arte conceptual y diseño', 'image', 'Palette', 'bg-pink-500'),
  ('image-product', 'Productos', 'Fotografía de productos', 'image', 'Package', 'bg-gray-600');

-- 8. CREAR SUBCATEGORÍAS PARA VÍDEO
INSERT INTO subcategories (id, name, description, category_id, icon, color) VALUES
  ('video-marketing', 'Marketing', 'Vídeos promocionales y ads', 'video', 'TrendingUp', 'bg-orange-500'),
  ('video-social', 'Redes Sociales', 'Shorts, Reels y TikToks', 'video', 'Share2', 'bg-blue-400'),
  ('video-asmr', 'ASMR', 'Contenido de relajación y ASMR', 'video', 'Headphones', 'bg-purple-400'),
  ('video-animals', 'Animales', 'Vídeos de mascotas y fauna', 'video', 'PawPrint', 'bg-amber-600'),
  ('video-education', 'Educación', 'Tutoriales y contenido educativo', 'video', 'GraduationCap', 'bg-indigo-500'),
  ('video-vlog', 'Vlogs', 'Contenido de estilo de vida', 'video', 'Camera', 'bg-pink-500'),
  ('video-music', 'Música', 'Vídeos musicales y audio visual', 'video', 'Music', 'bg-red-500');

-- 9. COMENTARIOS DE DOCUMENTACIÓN
COMMENT ON TABLE subcategories IS 'Subcategorías específicas para cada tipo de prompt (texto, imagen, vídeo)';
COMMENT ON COLUMN prompts.preferred_model_id IS 'Modelo LLM preferido para ejecutar este prompt';
COMMENT ON COLUMN prompts.subcategory_id IS 'Subcategoría específica del prompt';
