-- ============================================
-- PromptHub v2 - Datos Iniciales (Seed Data)
-- ============================================
-- Este archivo contiene los datos iniciales necesarios
-- para el funcionamiento de PromptHub v2
-- ============================================

-- ============================================
-- CATEGORÍAS PRINCIPALES
-- ============================================
INSERT INTO categories (id, name, description, icon, color) VALUES
  ('text', 'Texto', 'Prompts para generación de contenido textual', 'FileText', 'bg-blue-500'),
  ('image', 'Imagen', 'Prompts para generación de imágenes', 'Image', 'bg-purple-500'),
  ('video', 'Vídeo', 'Prompts para generación de vídeos', 'Video', 'bg-red-500')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color;

-- ============================================
-- SUBCATEGORÍAS PARA TEXTO
-- ============================================
INSERT INTO subcategories (id, name, description, category_id, icon, color) VALUES
  ('text-marketing', 'Marketing', 'Contenido para campañas y publicidad', 'text', 'TrendingUp', 'bg-orange-500'),
  ('text-social', 'Redes Sociales', 'Posts y contenido para RRSS', 'text', 'Share2', 'bg-blue-400'),
  ('text-business', 'Negocios', 'Emails, reportes y documentos empresariales', 'text', 'Briefcase', 'bg-gray-600'),
  ('text-creative', 'Creativo', 'Historias, poemas y contenido artístico', 'text', 'Sparkles', 'bg-pink-500'),
  ('text-education', 'Educación', 'Material educativo y tutoriales', 'text', 'GraduationCap', 'bg-indigo-500'),
  ('text-code', 'Programación', 'Código y documentación técnica', 'text', 'Code2', 'bg-green-600')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ============================================
-- SUBCATEGORÍAS PARA IMAGEN
-- ============================================
INSERT INTO subcategories (id, name, description, category_id, icon, color) VALUES
  ('image-marketing', 'Marketing', 'Imágenes publicitarias y promocionales', 'image', 'TrendingUp', 'bg-orange-500'),
  ('image-social', 'Redes Sociales', 'Imágenes para posts y stories', 'image', 'Share2', 'bg-blue-400'),
  ('image-animals', 'Animales', 'Imágenes de mascotas y fauna', 'image', 'PawPrint', 'bg-amber-600'),
  ('image-nature', 'Naturaleza', 'Paisajes y elementos naturales', 'image', 'Trees', 'bg-green-500'),
  ('image-people', 'Personas', 'Retratos y personas', 'image', 'Users', 'bg-purple-400'),
  ('image-art', 'Arte Digital', 'Arte conceptual y diseño', 'image', 'Palette', 'bg-pink-500'),
  ('image-product', 'Productos', 'Fotografía de productos', 'image', 'Package', 'bg-gray-600')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ============================================
-- SUBCATEGORÍAS PARA VÍDEO
-- ============================================
INSERT INTO subcategories (id, name, description, category_id, icon, color) VALUES
  ('video-marketing', 'Marketing', 'Vídeos promocionales y ads', 'video', 'TrendingUp', 'bg-orange-500'),
  ('video-social', 'Redes Sociales', 'Shorts, Reels y TikToks', 'video', 'Share2', 'bg-blue-400'),
  ('video-asmr', 'ASMR', 'Contenido de relajación y ASMR', 'video', 'Headphones', 'bg-purple-400'),
  ('video-animals', 'Animales', 'Vídeos de mascotas y fauna', 'video', 'PawPrint', 'bg-amber-600'),
  ('video-education', 'Educación', 'Tutoriales y contenido educativo', 'video', 'GraduationCap', 'bg-indigo-500'),
  ('video-vlog', 'Vlogs', 'Contenido de estilo de vida', 'video', 'Camera', 'bg-pink-500'),
  ('video-music', 'Música', 'Vídeos musicales y audio visual', 'video', 'Music', 'bg-red-500')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ============================================
-- PROVEEDORES DE IA
-- ============================================
INSERT INTO providers (id, name, enabled, base_url, api_key_env) VALUES
  ('openai', 'OpenAI', true, 'https://api.openai.com/v1', 'OPENAI_API_KEY'),
  ('anthropic', 'Anthropic', true, 'https://api.anthropic.com/v1', 'ANTHROPIC_API_KEY'),
  ('replicate', 'Replicate', true, 'https://api.replicate.com/v1', 'REPLICATE_API_KEY'),
  ('google', 'Google Gemini', true, 'https://generativelanguage.googleapis.com/v1beta', 'GOOGLE_API_KEY'),
  ('deepseek', 'DeepSeek', true, 'https://api.deepseek.com/v1', 'DEEPSEEK_API_KEY')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  base_url = EXCLUDED.base_url,
  api_key_env = EXCLUDED.api_key_env;

-- ============================================
-- MODELOS LLM
-- ============================================

-- OpenAI Models
INSERT INTO models (id, name, provider_id, input_cost, output_cost, max_tokens, enabled) VALUES
  ('gpt-5', 'GPT-5', 'openai', 0.000003, 0.000015, 128000, true),
  ('gpt-5-mini', 'GPT-5 Mini', 'openai', 0.00000015, 0.0000006, 128000, true),
  ('gpt-4o', 'GPT-4o', 'openai', 0.0000025, 0.00001, 128000, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  input_cost = EXCLUDED.input_cost,
  output_cost = EXCLUDED.output_cost,
  max_tokens = EXCLUDED.max_tokens;

-- Anthropic Models
INSERT INTO models (id, name, provider_id, input_cost, output_cost, max_tokens, enabled) VALUES
  ('claude-3-5-sonnet-20241022', 'Claude 3.5 Sonnet', 'anthropic', 0.000003, 0.000015, 200000, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  input_cost = EXCLUDED.input_cost,
  output_cost = EXCLUDED.output_cost,
  max_tokens = EXCLUDED.max_tokens;

-- Replicate Models
INSERT INTO models (id, name, provider_id, input_cost, output_cost, max_tokens, enabled) VALUES
  ('meta/llama-2-70b-chat', 'Llama 2 70B Chat', 'replicate', 0.00000065, 0.00000275, 4096, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  input_cost = EXCLUDED.input_cost,
  output_cost = EXCLUDED.output_cost,
  max_tokens = EXCLUDED.max_tokens;

-- Google Gemini Models
INSERT INTO models (id, name, provider_id, input_cost, output_cost, max_tokens, enabled) VALUES
  ('gemini-2.0-flash-exp', 'Gemini 2.0 Flash', 'google', 0.000001, 0.000002, 1000000, true),
  ('gemini-1.5-pro', 'Gemini 1.5 Pro', 'google', 0.00000125, 0.00000375, 2000000, true),
  ('gemini-1.5-flash', 'Gemini 1.5 Flash', 'google', 0.000000075, 0.0000003, 1000000, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  input_cost = EXCLUDED.input_cost,
  output_cost = EXCLUDED.output_cost,
  max_tokens = EXCLUDED.max_tokens;

-- DeepSeek Models
INSERT INTO models (id, name, provider_id, input_cost, output_cost, max_tokens, enabled) VALUES
  ('deepseek-chat', 'DeepSeek Chat', 'deepseek', 0.00000014, 0.00000028, 64000, true),
  ('deepseek-coder', 'DeepSeek Coder', 'deepseek', 0.00000014, 0.00000028, 64000, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  input_cost = EXCLUDED.input_cost,
  output_cost = EXCLUDED.output_cost,
  max_tokens = EXCLUDED.max_tokens;

-- ============================================
-- PLANES DE SUSCRIPCIÓN
-- ============================================
INSERT INTO plans (name, display_name, price, tokens_included, tokens_overage_price, storage_mb, max_team_members, is_active) VALUES
  ('free', 'Free', 0.00, 10000, 0.00002, 100, 1, true),
  ('pro', 'PRO', 29.99, 500000, 0.00001, 1000, 3, true),
  ('business', 'Business', 99.99, 2000000, 0.000008, 5000, 10, true),
  ('plus', 'Plus', 49.99, 1000000, 0.00001, 2000, 5, true)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  price = EXCLUDED.price,
  tokens_included = EXCLUDED.tokens_included,
  storage_mb = EXCLUDED.storage_mb,
  max_team_members = EXCLUDED.max_team_members;

-- ============================================
-- FIN DE DATOS INICIALES
-- ============================================
