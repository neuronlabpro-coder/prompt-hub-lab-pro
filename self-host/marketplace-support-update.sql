-- ====================================
-- MARKETPLACE & SUPPORT SYSTEM UPDATE
-- ====================================

-- 1. ADD MARKETPLACE FIELDS TO PROMPTS
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS is_for_sale BOOLEAN DEFAULT FALSE;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS discount_eligible BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_prompts_for_sale ON prompts(is_for_sale) WHERE is_for_sale = TRUE;

-- 2. CREATE PROMPT PURCHASES TABLE
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

-- 3. CREATE SUPPORT TICKETS TABLE
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

-- 4. CREATE SUPPORT RESPONSES TABLE
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

-- 5. CREATE TRIGGER TO UPDATE SALES COUNT
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

-- 6. CREATE TRIGGER TO UPDATE TICKET TIMESTAMPS
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

-- 7. GRANT PERMISSIONS (adjust as needed)
GRANT ALL ON prompt_purchases TO postgres;
GRANT ALL ON support_tickets TO postgres;
GRANT ALL ON support_responses TO postgres;

COMMENT ON TABLE prompt_purchases IS 'Stores all marketplace purchases with discount tracking';
COMMENT ON TABLE support_tickets IS 'Customer support ticket system';
COMMENT ON TABLE support_responses IS 'Conversation thread for support tickets';
