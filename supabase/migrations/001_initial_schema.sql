-- ============================================
-- PromptHub v2 - Schema Completo para Self-Host
-- ============================================
-- Versión: 2.0
-- Fecha: Octubre 2025
-- Incluye: Sistema completo con categorías, subcategorías,
-- modelos LLM, marketplace y soporte técnico
-- ============================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('superadmin', 'admin', 'editor', 'viewer', 'user')),
  plan VARCHAR(50) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business', 'plus')),
  tokens_included INTEGER DEFAULT 10000,
  tokens_used INTEGER DEFAULT 0,
  tokens_overage INTEGER DEFAULT 0,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  two_factor_secret VARCHAR(255),
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);

-- ============================================
-- TABLA: categories (Categorías Principales)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

-- ============================================
-- TABLA: subcategories (Subcategorías)
-- ============================================
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

-- ============================================
-- TABLA: providers (Proveedores de IA)
-- ============================================
CREATE TABLE IF NOT EXISTS providers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  base_url TEXT,
  api_key_env VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_providers_enabled ON providers(enabled);

-- ============================================
-- TABLA: models (Modelos LLM)
-- ============================================
CREATE TABLE IF NOT EXISTS models (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  provider_id TEXT REFERENCES providers(id) ON DELETE CASCADE,
  input_cost DECIMAL(12, 10) DEFAULT 0,
  output_cost DECIMAL(12, 10) DEFAULT 0,
  max_tokens INTEGER DEFAULT 4096,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_models_provider ON models(provider_id);
CREATE INDEX IF NOT EXISTS idx_models_enabled ON models(enabled);

-- ============================================
-- TABLA: prompts
-- ============================================
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id TEXT REFERENCES subcategories(id) ON DELETE SET NULL,
  preferred_model_id TEXT REFERENCES models(id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  content_es TEXT NOT NULL,
  content_en TEXT,
  type VARCHAR(50) DEFAULT 'text' CHECK (type IN ('text', 'image', 'video')),
  tags TEXT[],
  is_public BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_for_sale BOOLEAN DEFAULT FALSE,
  price DECIMAL(10,2) DEFAULT 0.00,
  sales_count INTEGER DEFAULT 0,
  discount_eligible BOOLEAN DEFAULT TRUE,
  media_url TEXT,
  media_preview_url TEXT,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_category_id ON prompts(category_id);
CREATE INDEX IF NOT EXISTS idx_prompts_subcategory_id ON prompts(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_prompts_model ON prompts(preferred_model_id);
CREATE INDEX IF NOT EXISTS idx_prompts_type ON prompts(type);
CREATE INDEX IF NOT EXISTS idx_prompts_public ON prompts(is_public);
CREATE INDEX IF NOT EXISTS idx_prompts_featured ON prompts(is_featured);
CREATE INDEX IF NOT EXISTS idx_prompts_for_sale ON prompts(is_for_sale) WHERE is_for_sale = TRUE;

-- ============================================
-- TABLA: prompt_versions
-- ============================================
CREATE TABLE IF NOT EXISTS prompt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content_es TEXT NOT NULL,
  content_en TEXT,
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  change_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prompt_versions_prompt_id ON prompt_versions(prompt_id);

-- ============================================
-- TABLA: prompt_stats
-- ============================================
CREATE TABLE IF NOT EXISTS prompt_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID UNIQUE NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  views INTEGER DEFAULT 0,
  copies INTEGER DEFAULT 0,
  favorites INTEGER DEFAULT 0,
  executions INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  avg_cost DECIMAL(10, 6) DEFAULT 0,
  avg_latency DECIMAL(10, 2) DEFAULT 0,
  last_used TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prompt_stats_prompt_id ON prompt_stats(prompt_id);

-- ============================================
-- TABLA: prompt_purchases (Marketplace)
-- ============================================
CREATE TABLE IF NOT EXISTS prompt_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  price_paid DECIMAL(10,2) NOT NULL,
  discount_percent INTEGER DEFAULT 0,
  original_price DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'stripe',
  stripe_payment_intent_id VARCHAR(255),
  transaction_status VARCHAR(50) DEFAULT 'completed',
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchases_buyer ON prompt_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_prompt ON prompt_purchases(prompt_id);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON prompt_purchases(purchased_at DESC);

-- ============================================
-- TABLA: support_tickets (Sistema de Soporte)
-- ============================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('soporte', 'general', 'ventas', 'tecnico', 'billing')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_response', 'resolved', 'closed')),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_response_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON support_tickets(category);

-- ============================================
-- TABLA: support_responses
-- ============================================
CREATE TABLE IF NOT EXISTS support_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  is_admin_response BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_responses_ticket ON support_responses(ticket_id);
CREATE INDEX IF NOT EXISTS idx_responses_user ON support_responses(user_id);

-- ============================================
-- TABLA: executions
-- ============================================
CREATE TABLE IF NOT EXISTS executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES prompts(id) ON DELETE SET NULL,
  model_id TEXT REFERENCES models(id) ON DELETE SET NULL,
  input_text TEXT NOT NULL,
  output_text TEXT,
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  tokens_total INTEGER DEFAULT 0,
  cost DECIMAL(10, 6) DEFAULT 0,
  latency DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'success' CHECK (status IN ('success', 'error', 'timeout')),
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_executions_user_id ON executions(user_id);
CREATE INDEX IF NOT EXISTS idx_executions_prompt_id ON executions(prompt_id);
CREATE INDEX IF NOT EXISTS idx_executions_created_at ON executions(created_at);

-- ============================================
-- TABLA: plans
-- ============================================
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  tokens_included INTEGER NOT NULL,
  tokens_overage_price DECIMAL(10, 6) DEFAULT 0.00002,
  storage_mb INTEGER DEFAULT 100,
  max_team_members INTEGER DEFAULT 1,
  features JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  stripe_price_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plans_active ON plans(is_active);

-- ============================================
-- TABLA: api_keys
-- ============================================
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  prefix VARCHAR(20) NOT NULL,
  last_used TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);

-- ============================================
-- TABLA: newsletter_subscribers
-- ============================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  source VARCHAR(100) DEFAULT 'website',
  is_active BOOLEAN DEFAULT TRUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscribers(is_active);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Actualizar contador de ventas en marketplace
CREATE OR REPLACE FUNCTION update_prompt_sales_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE prompts 
  SET sales_count = sales_count + 1
  WHERE id = NEW.prompt_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sales_count
AFTER INSERT ON prompt_purchases
FOR EACH ROW
EXECUTE FUNCTION update_prompt_sales_count();

-- Trigger: Actualizar timestamps de tickets de soporte
CREATE OR REPLACE FUNCTION update_ticket_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE support_tickets 
  SET 
    updated_at = NOW(),
    last_response_at = NOW()
  WHERE id = NEW.ticket_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ticket_timestamp
AFTER INSERT ON support_responses
FOR EACH ROW
EXECUTE FUNCTION update_ticket_timestamp();

-- ============================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- ============================================
COMMENT ON TABLE categories IS 'Categorías principales: Texto, Imagen, Vídeo';
COMMENT ON TABLE subcategories IS 'Subcategorías específicas para cada tipo de prompt';
COMMENT ON TABLE providers IS 'Proveedores de modelos LLM (OpenAI, Anthropic, Gemini, etc.)';
COMMENT ON TABLE models IS 'Modelos LLM disponibles con configuración de costos';
COMMENT ON TABLE prompts IS 'Prompts con soporte para marketplace y categorización avanzada';
COMMENT ON TABLE prompt_purchases IS 'Historial de compras en el marketplace';
COMMENT ON TABLE support_tickets IS 'Sistema de tickets de soporte técnico';
COMMENT ON TABLE support_responses IS 'Conversaciones de tickets de soporte';
COMMENT ON COLUMN prompts.preferred_model_id IS 'Modelo LLM preferido para ejecutar este prompt';
COMMENT ON COLUMN prompts.subcategory_id IS 'Subcategoría específica del prompt';
COMMENT ON COLUMN prompts.is_for_sale IS 'Indica si el prompt está disponible en el marketplace';

-- ============================================
-- FIN DEL SCHEMA
-- ============================================
