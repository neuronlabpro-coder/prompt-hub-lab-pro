-- PromptHub v2 - Supabase Database Schema
-- Execute this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in correct order to avoid foreign key constraints)
DROP TABLE IF EXISTS smtp_config CASCADE;
DROP TABLE IF EXISTS email_templates CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS referral_programs CASCADE;
DROP TABLE IF EXISTS organization_plans CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS models CASCADE;
DROP TABLE IF EXISTS providers CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS prompt_stats CASCADE;
DROP TABLE IF EXISTS prompts CASCADE;
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing enums if they exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS prompt_type CASCADE;
DROP TYPE IF EXISTS support_category CASCADE;
DROP TYPE IF EXISTS support_priority CASCADE;
DROP TYPE IF EXISTS support_status CASCADE;
DROP TYPE IF EXISTS email_template_type CASCADE;

-- Create enums
CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'editor', 'viewer', 'user');
CREATE TYPE prompt_type AS ENUM ('system', 'user');
CREATE TYPE support_category AS ENUM ('billing', 'technical', 'feature_request', 'bug_report', 'general');
CREATE TYPE support_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE support_status AS ENUM ('open', 'in_progress', 'waiting_response', 'resolved', 'closed');
CREATE TYPE email_template_type AS ENUM ('welcome', 'payment_confirmation', 'access_granted', 'support_response', 'custom');

-- Create tables
CREATE TABLE plans (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  tokens_included INTEGER NOT NULL DEFAULT 0,
  overage_price NUMERIC(10,4) NOT NULL DEFAULT 0,
  stripe_price_id TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  plan_id TEXT REFERENCES plans(id),
  tokens_used INTEGER NOT NULL DEFAULT 0,
  tokens_limit INTEGER NOT NULL DEFAULT 100000,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE prompts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title TEXT NOT NULL,
  content_es TEXT NOT NULL,
  content_en TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  type prompt_type NOT NULL DEFAULT 'system',
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE prompt_stats (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  prompt_id TEXT NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  characters_es INTEGER NOT NULL DEFAULT 0,
  characters_en INTEGER NOT NULL DEFAULT 0,
  tokens_es INTEGER NOT NULL DEFAULT 0,
  tokens_en INTEGER NOT NULL DEFAULT 0,
  visits INTEGER NOT NULL DEFAULT 0,
  copies INTEGER NOT NULL DEFAULT 0,
  improvements INTEGER NOT NULL DEFAULT 0,
  translations INTEGER NOT NULL DEFAULT 0,
  last_execution TIMESTAMPTZ,
  ctr NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(prompt_id)
);

CREATE TABLE providers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  base_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE models (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  input_cost NUMERIC(10,6) NOT NULL DEFAULT 0,
  output_cost NUMERIC(10,6) NOT NULL DEFAULT 0,
  max_tokens INTEGER NOT NULL DEFAULT 4096,
  supports_temperature BOOLEAN NOT NULL DEFAULT true,
  supports_top_p BOOLEAN NOT NULL DEFAULT true,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE organizations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id TEXT REFERENCES plans(id),
  team_size INTEGER NOT NULL DEFAULT 1,
  monthly_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  tokens_included INTEGER NOT NULL DEFAULT 0,
  stripe_subscription_id TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE organization_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_per_user NUMERIC(10,2) NOT NULL,
  tokens_per_user INTEGER NOT NULL,
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  min_team_size INTEGER NOT NULL DEFAULT 5,
  stripe_price_id TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE referral_programs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL UNIQUE,
  referral_url TEXT NOT NULL,
  total_referrals INTEGER NOT NULL DEFAULT 0,
  total_earnings NUMERIC(10,2) NOT NULL DEFAULT 0,
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 10,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE support_tickets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category support_category NOT NULL DEFAULT 'general',
  priority support_priority NOT NULL DEFAULT 'medium',
  status support_status NOT NULL DEFAULT 'open',
  assigned_to TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_response_at TIMESTAMPTZ
);

CREATE TABLE email_templates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT NOT NULL,
  variables TEXT[] DEFAULT ARRAY[]::TEXT[],
  type email_template_type NOT NULL DEFAULT 'custom',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE smtp_config (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  host TEXT NOT NULL,
  port INTEGER NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT NOT NULL,
  use_tls BOOLEAN NOT NULL DEFAULT true,
  active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_prompts_category ON prompts(category);
CREATE INDEX idx_prompts_user_id ON prompts(user_id);
CREATE INDEX idx_prompts_type ON prompts(type);
CREATE INDEX idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX idx_prompt_stats_prompt_id ON prompt_stats(prompt_id);
CREATE INDEX idx_models_provider_id ON models(provider_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);

-- Create function to increment prompt stats
CREATE OR REPLACE FUNCTION increment_prompt_stats(p_prompt_id TEXT, p_field TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('
    UPDATE prompt_stats 
    SET %I = %I + 1, updated_at = NOW() 
    WHERE prompt_id = $1', p_field, p_field)
  USING p_prompt_id;
  
  IF NOT FOUND THEN
    INSERT INTO prompt_stats (prompt_id, visits, copies, improvements, translations)
    VALUES (p_prompt_id, 0, 0, 0, 0)
    ON CONFLICT (prompt_id) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to add tokens to user
CREATE OR REPLACE FUNCTION add_user_tokens(p_user_id TEXT, p_tokens INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET tokens_limit = tokens_limit + p_tokens, updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Insert initial data

-- Insert default plans
INSERT INTO plans (id, name, price, tokens_included, overage_price, active) VALUES
  ('plan_free', 'Free', 0, 100000, 0.00001, true),
  ('plan_starter', 'Starter', 9.99, 500000, 0.000008, true),
  ('plan_pro', 'Pro', 29.99, 2000000, 0.000006, true),
  ('plan_business', 'Business', 99.99, 10000000, 0.000004, true);

-- Insert default categories
INSERT INTO categories (id, name, description, icon, color) VALUES
  ('marketing', 'Marketing', 'Prompts para campañas y contenido', 'Megaphone', 'bg-blue-500'),
  ('copywriting', 'Copywriting', 'Textos persuasivos y ventas', 'FileText', 'bg-purple-500'),
  ('seo', 'SEO', 'Optimización para motores de búsqueda', 'Search', 'bg-green-500'),
  ('social', 'Social Media', 'Contenido para redes sociales', 'Share2', 'bg-pink-500'),
  ('email', 'Email', 'Campañas de email marketing', 'Mail', 'bg-yellow-500'),
  ('development', 'Desarrollo', 'Código y programación', 'Code', 'bg-indigo-500'),
  ('business', 'Negocios', 'Estrategia y análisis', 'Briefcase', 'bg-red-500'),
  ('creative', 'Creatividad', 'Escritura creativa', 'Lightbulb', 'bg-orange-500');

-- Insert default providers
INSERT INTO providers (id, name, enabled, base_url) VALUES
  ('openai', 'OpenAI', true, 'https://api.openai.com/v1'),
  ('anthropic', 'Anthropic', true, 'https://api.anthropic.com/v1'),
  ('google', 'Google AI', true, 'https://generativelanguage.googleapis.com/v1'),
  ('deepseek', 'DeepSeek', true, 'https://api.deepseek.com/v1');

-- Insert default models
INSERT INTO models (id, name, provider_id, input_cost, output_cost, max_tokens, enabled) VALUES
  ('gpt-4', 'GPT-4', 'openai', 0.00003, 0.00006, 8192, true),
  ('gpt-3.5-turbo', 'GPT-3.5 Turbo', 'openai', 0.000001, 0.000002, 16385, true),
  ('claude-3-opus', 'Claude 3 Opus', 'anthropic', 0.000015, 0.000075, 200000, true),
  ('claude-3-sonnet', 'Claude 3 Sonnet', 'anthropic', 0.000003, 0.000015, 200000, true),
  ('gemini-pro', 'Gemini Pro', 'google', 0.000001, 0.000002, 32768, true),
  ('deepseek-chat', 'DeepSeek Chat', 'deepseek', 0.00000027, 0.0000011, 64000, true);

-- Insert sample prompts
INSERT INTO prompts (id, title, content_es, content_en, category, tags, type) VALUES
  ('prompt_1', 'Generador de Títulos SEO', 'Genera 5 títulos SEO optimizados para un artículo sobre [TEMA]. Los títulos deben ser atractivos, incluir la palabra clave principal y tener menos de 60 caracteres.', 'Generate 5 SEO-optimized titles for an article about [TOPIC]. Titles should be engaging, include the main keyword, and be under 60 characters.', 'seo', ARRAY['seo', 'titles', 'optimization'], 'system'),
  ('prompt_2', 'Descripción de Producto E-commerce', 'Escribe una descripción persuasiva de producto para [PRODUCTO]. Incluye beneficios clave, características únicas y un llamado a la acción convincente. Máximo 150 palabras.', 'Write a persuasive product description for [PRODUCT]. Include key benefits, unique features, and a compelling call-to-action. Maximum 150 words.', 'copywriting', ARRAY['ecommerce', 'product', 'sales'], 'system'),
  ('prompt_3', 'Post para LinkedIn Profesional', 'Crea un post profesional para LinkedIn sobre [TEMA]. El tono debe ser profesional pero accesible. Incluye un gancho inicial, 3-5 puntos clave y una pregunta final para fomentar el engagement.', 'Create a professional LinkedIn post about [TOPIC]. Tone should be professional yet approachable. Include an opening hook, 3-5 key points, and a closing question to encourage engagement.', 'social', ARRAY['linkedin', 'professional', 'engagement'], 'system');

-- Insert stats for sample prompts
INSERT INTO prompt_stats (prompt_id, characters_es, characters_en, tokens_es, tokens_en, visits, copies, ctr) VALUES
  ('prompt_1', 150, 142, 38, 36, 1250, 156, 12.48),
  ('prompt_2', 168, 159, 42, 40, 890, 98, 11.01),
  ('prompt_3', 187, 176, 47, 44, 650, 72, 11.08);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic examples - adjust based on your auth setup)
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid()::TEXT = id);
CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::TEXT AND role IN ('admin', 'superadmin'))
);

CREATE POLICY "Anyone can view prompts" ON prompts FOR SELECT USING (true);
CREATE POLICY "Users can create their own prompts" ON prompts FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id);
CREATE POLICY "Users can update their own prompts" ON prompts FOR UPDATE USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Anyone can view prompt stats" ON prompt_stats FOR SELECT USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ PromptHub v2 database schema created successfully!';
  RAISE NOTICE 'Tables created: users, plans, prompts, categories, providers, models, and more';
  RAISE NOTICE 'Sample data inserted: 4 plans, 8 categories, 6 models, 3 sample prompts';
END $$;