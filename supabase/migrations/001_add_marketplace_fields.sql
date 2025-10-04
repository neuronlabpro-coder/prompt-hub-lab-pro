-- Migration: Add marketplace fields to prompts table
-- Execute this in Supabase SQL Editor

ALTER TABLE prompts
ADD COLUMN IF NOT EXISTS is_for_sale BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS sales_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_eligible BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS preferred_model_id TEXT,
ADD COLUMN IF NOT EXISTS subcategory_id TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_prompts_for_sale ON prompts(is_for_sale) WHERE is_for_sale = true;
CREATE INDEX IF NOT EXISTS idx_prompts_price ON prompts(price) WHERE is_for_sale = true;

-- Add comment
COMMENT ON COLUMN prompts.is_for_sale IS 'Indicates if this prompt is available for sale in marketplace';
COMMENT ON COLUMN prompts.price IS 'Price in EUR for this prompt';
COMMENT ON COLUMN prompts.sales_count IS 'Number of times this prompt has been sold';
COMMENT ON COLUMN prompts.discount_eligible IS 'Whether this prompt is eligible for tier-based discounts';
