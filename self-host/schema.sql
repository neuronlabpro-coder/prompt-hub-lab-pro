-- ============================================
-- PromptHub v2 - Schema Completo
-- ============================================
-- Este archivo contiene todas las tablas necesarias
-- para una instalación limpia de PromptHub v2
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
-- TABLA: categories
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_es VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  icon VARCHAR(100),
  color VARCHAR(50),
  description_es TEXT,
  description_en TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

-- ============================================
-- TABLA: prompts
-- ============================================
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  content_es TEXT NOT NULL,
  content_en TEXT,
  type VARCHAR(50) DEFAULT 'text' CHECK (type IN ('text', 'image', 'video')),
  tags TEXT[],
  is_public BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  media_url TEXT,
  media_preview_url TEXT,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_category_id ON prompts(category_id);
CREATE INDEX IF NOT EXISTS idx_prompts_type ON prompts(type);
CREATE INDEX IF NOT EXISTS idx_prompts_public ON prompts(is_public);
CREATE INDEX IF NOT EXISTS idx_prompts_featured ON prompts(is_featured);

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
-- TABLA: providers
-- ============================================
CREATE TABLE IF NOT EXISTS providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  api_endpoint TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_providers_active ON providers(is_active);

-- ============================================
-- TABLA: models
-- ============================================
CREATE TABLE IF NOT EXISTS models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  model_id VARCHAR(255) NOT NULL,
  supports_streaming BOOLEAN DEFAULT TRUE,
  supports_functions BOOLEAN DEFAULT FALSE,
  context_window INTEGER DEFAULT 4096,
  max_tokens INTEGER DEFAULT 2048,
  is_active BOOLEAN DEFAULT TRUE,
  config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider_id, model_id)
);

CREATE INDEX IF NOT EXISTS idx_models_provider_id ON models(provider_id);
CREATE INDEX IF NOT EXISTS idx_models_active ON models(is_active);

-- ============================================
-- TABLA: token_prices
-- ============================================
CREATE TABLE IF NOT EXISTS token_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID REFERENCES models(id) ON DELETE CASCADE,
  input_price_per_1k DECIMAL(10, 6) NOT NULL,
  output_price_per_1k DECIMAL(10, 6) NOT NULL,
  effective_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_token_prices_model_id ON token_prices(model_id);

-- ============================================
-- TABLA: executions
-- ============================================
CREATE TABLE IF NOT EXISTS executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES prompts(id) ON DELETE SET NULL,
  model_id UUID REFERENCES models(id) ON DELETE SET NULL,
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
-- FIN DEL SCHEMA
-- ============================================
