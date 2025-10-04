import { sql } from 'drizzle-orm';
import { pgTable, uuid, text, varchar, timestamp, bigint, numeric, integer, boolean, jsonb, inet, pgEnum } from 'drizzle-orm/pg-core';

// Custom types/enums
export const userRoleEnum = pgEnum('user_role', ['superadmin', 'admin', 'editor', 'viewer', 'user']);
export const promptTypeEnum = pgEnum('prompt_type', ['system', 'user']);
export const couponTypeEnum = pgEnum('coupon_type', ['percentage', 'fixed']);
export const couponScopeEnum = pgEnum('coupon_scope', ['plan', 'addon', 'global']);
export const organizationMemberRoleEnum = pgEnum('organization_member_role', ['owner', 'admin', 'member']);
export const referralStatusEnum = pgEnum('referral_status', ['pending', 'confirmed', 'paid']);
export const popupTriggerEnum = pgEnum('popup_trigger', ['always', 'usage_threshold', 'time_based']);
export const emailTemplateTypeEnum = pgEnum('email_template_type', ['welcome', 'payment_confirmation', 'access_granted', 'support_response', 'custom']);
export const supportCategoryEnum = pgEnum('support_category', ['billing', 'technical', 'feature_request', 'bug_report', 'general']);
export const supportPriorityEnum = pgEnum('support_priority', ['low', 'medium', 'high', 'urgent']);
export const supportStatusEnum = pgEnum('support_status', ['open', 'in_progress', 'waiting_response', 'resolved', 'closed']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'processing', 'completed', 'failed', 'refunded']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  role: userRoleEnum('role').default('user'),
  planId: text('plan_id').default('starter').notNull(),
  tokensUsed: bigint('tokens_used', { mode: 'number' }).default(0),
  tokensLimit: bigint('tokens_limit', { mode: 'number' }).default(500000),
  stripeCustomerId: text('stripe_customer_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Plans table
export const plans = pgTable('plans', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  tokensIncluded: bigint('tokens_included', { mode: 'number' }).notNull(),
  overagePrice: numeric('overage_price', { precision: 10, scale: 2 }).notNull(),
  stripePriceId: text('stripe_price_id'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Categories table
export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  color: text('color').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Prompts table
export const prompts = pgTable('prompts', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  title: text('title').notNull(),
  contentEs: text('content_es').notNull(),
  contentEn: text('content_en').notNull(),
  category: text('category').notNull().references(() => categories.id),
  tags: text('tags').array().default(sql`'{}'::text[]`),
  type: promptTypeEnum('type').default('user'),
  userId: uuid('user_id').references(() => users.id),
  isFavorite: boolean('is_favorite').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Prompt stats table
export const promptStats = pgTable('prompt_stats', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  promptId: uuid('prompt_id').unique().notNull().references(() => prompts.id, { onDelete: 'cascade' }),
  charactersEs: integer('characters_es').default(0),
  charactersEn: integer('characters_en').default(0),
  tokensEs: integer('tokens_es').default(0),
  tokensEn: integer('tokens_en').default(0),
  visits: integer('visits').default(0),
  copies: integer('copies').default(0),
  improvements: integer('improvements').default(0),
  translations: integer('translations').default(0),
  lastExecution: timestamp('last_execution'),
  ctr: numeric('ctr', { precision: 5, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Prompt versions table
export const promptVersions = pgTable('prompt_versions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  promptId: uuid('prompt_id').notNull().references(() => prompts.id, { onDelete: 'cascade' }),
  version: integer('version').notNull(),
  contentEs: text('content_es').notNull(),
  contentEn: text('content_en').notNull(),
  improvementReason: text('improvement_reason'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Providers table
export const providers = pgTable('providers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  enabled: boolean('enabled').default(true),
  baseUrl: text('base_url').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Models table
export const models = pgTable('models', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  providerId: text('provider_id').notNull().references(() => providers.id),
  inputCost: numeric('input_cost', { precision: 10, scale: 6 }).notNull(),
  outputCost: numeric('output_cost', { precision: 10, scale: 6 }).notNull(),
  maxTokens: integer('max_tokens').notNull(),
  supportsTemperature: boolean('supports_temperature').default(true),
  supportsTopP: boolean('supports_top_p').default(true),
  enabled: boolean('enabled').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Executions table
export const executions = pgTable('executions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  promptId: uuid('prompt_id').notNull().references(() => prompts.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  provider: text('provider').notNull(),
  model: text('model').notNull(),
  inputTokens: integer('input_tokens').notNull(),
  outputTokens: integer('output_tokens').notNull(),
  totalTokens: integer('total_tokens').notNull(),
  cost: numeric('cost', { precision: 10, scale: 6 }).notNull(),
  latency: integer('latency').notNull(),
  result: text('result').notNull(),
  parameters: jsonb('parameters').default(sql`'{}'::jsonb`),
  createdAt: timestamp('created_at').defaultNow(),
});

// Token prices table
export const tokenPrices = pgTable('token_prices', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  model: text('model').unique().notNull(),
  inputCostBase: numeric('input_cost_base', { precision: 10, scale: 6 }).notNull(),
  outputCostBase: numeric('output_cost_base', { precision: 10, scale: 6 }).notNull(),
  inputMarginPercent: numeric('input_margin_percent', { precision: 5, scale: 2 }).default('50.0'),
  outputMarginPercent: numeric('output_margin_percent', { precision: 5, scale: 2 }).default('50.0'),
  currency: text('currency').default('USD'),
  fxRate: numeric('fx_rate', { precision: 10, scale: 4 }).default('1.0'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Coupons table
export const coupons = pgTable('coupons', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  code: text('code').unique().notNull(),
  type: couponTypeEnum('type').notNull(),
  value: numeric('value', { precision: 10, scale: 2 }).notNull(),
  maxUses: integer('max_uses'),
  usedCount: integer('used_count').default(0),
  expiresAt: timestamp('expires_at'),
  scope: couponScopeEnum('scope').default('global'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Affiliates table
export const affiliates = pgTable('affiliates', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').unique().notNull().references(() => users.id),
  refCode: text('ref_code').unique().notNull(),
  commissionPercent: numeric('commission_percent', { precision: 5, scale: 2 }).default('20.0'),
  totalReferrals: integer('total_referrals').default(0),
  totalEarnings: numeric('total_earnings', { precision: 10, scale: 2 }).default('0'),
  payoutMethod: text('payout_method'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Organizations table
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  ownerId: uuid('owner_id').notNull().references(() => users.id),
  planId: text('plan_id').notNull(),
  teamSize: integer('team_size').notNull(),
  monthlyCost: numeric('monthly_cost', { precision: 10, scale: 2 }).notNull(),
  tokensIncluded: bigint('tokens_included', { mode: 'number' }).notNull(),
  stripeSubscriptionId: text('stripe_subscription_id'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Organization members table
export const organizationMembers = pgTable('organization_members', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id),
  role: organizationMemberRoleEnum('role').default('member'),
  joinedAt: timestamp('joined_at').defaultNow(),
});

// Audit logs table
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').references(() => users.id),
  action: text('action').notNull(),
  resourceType: text('resource_type').notNull(),
  resourceId: text('resource_id'),
  details: jsonb('details').default(sql`'{}'::jsonb`),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Orders table (ecommerce)
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull().references(() => users.id),
  status: orderStatusEnum('status').default('pending').notNull(),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
  discount: numeric('discount', { precision: 10, scale: 2 }).default('0'),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  stripeSessionId: text('stripe_session_id'),
  paymentMethod: text('payment_method'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Order items table
export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  promptId: uuid('prompt_id').notNull().references(() => prompts.id),
  quantity: integer('quantity').default(1).notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  discount: numeric('discount', { precision: 10, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Downloads table (secure download links)
export const downloads = pgTable('downloads', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull().references(() => users.id),
  promptId: uuid('prompt_id').notNull().references(() => prompts.id),
  orderId: uuid('order_id').references(() => orders.id),
  downloadToken: text('download_token').unique().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  downloadCount: integer('download_count').default(0),
  maxDownloads: integer('max_downloads').default(5),
  createdAt: timestamp('created_at').defaultNow(),
});