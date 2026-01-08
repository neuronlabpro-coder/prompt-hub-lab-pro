import { sql } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  bigint,
  numeric,
  integer,
  boolean,
  jsonb,
  inet,
  pgEnum,
} from 'drizzle-orm/pg-core';

// Custom types/enums
export const userRoleEnum = pgEnum('user_role', [
  'superadmin',
  'admin',
  'editor',
  'viewer',
  'user',
]);
export const promptTypeEnum = pgEnum('prompt_type', ['system', 'user']);
export const promptContentTypeEnum = pgEnum('prompt_content_type', [
  'text',
  'image',
  'video',
]);
export const mediaTypeEnum = pgEnum('media_type', ['image', 'video']);
export const couponTypeEnum = pgEnum('coupon_type', ['percentage', 'fixed']);
export const couponScopeEnum = pgEnum('coupon_scope', ['plan', 'addon', 'global']);
export const organizationMemberRoleEnum = pgEnum('organization_member_role', [
  'owner',
  'admin',
  'member',
]);
export const referralStatusEnum = pgEnum('referral_status', [
  'pending',
  'confirmed',
  'paid',
]);
export const popupTriggerEnum = pgEnum('popup_trigger', [
  'always',
  'usage_threshold',
  'time_based',
]);
export const emailTemplateTypeEnum = pgEnum('email_template_type', [
  'welcome',
  'payment_confirmation',
  'access_granted',
  'support_response',
  'custom',
]);
export const supportCategoryEnum = pgEnum('support_category', [
  'billing',
  'technical',
  'feature_request',
  'bug_report',
  'general',
]);
export const supportPriorityEnum = pgEnum('support_priority', [
  'low',
  'medium',
  'high',
  'urgent',
]);
export const supportStatusEnum = pgEnum('support_status', [
  'open',
  'in_progress',
  'waiting_response',
  'resolved',
  'closed',
]);
export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
]);

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

// Subcategories table
export const subcategories = pgTable('subcategories', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  description: text('description'),
  categoryId: text('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Prompts table
export const prompts = pgTable('prompts', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  title: text('title').notNull(),
  contentEs: text('content_es').notNull(),
  contentEn: text('content_en').notNull(),
  category: text('category').notNull().references(() => categories.id),
  subcategoryId: uuid('subcategory_id').references(() => subcategories.id),
  tags: text('tags').array().default(sql`'{}'::text[]`),
  type: promptTypeEnum('type').default('user'),
  contentType: promptContentTypeEnum('content_type').default('text'),
  mediaUrl: text('media_url'),
  mediaType: mediaTypeEnum('media_type'),
  variables: jsonb('variables').default(sql`'[]'::jsonb`),
  isSystemPrompt: boolean('is_system_prompt').default(false),
  preferredModelId: text('preferred_model_id').references(() => models.id),
  userId: uuid('user_id').references(() => users.id),
  isFavorite: boolean('is_favorite').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Prompt stats table
export const promptStats = pgTable('prompt_stats', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  promptId: uuid('prompt_id')
    .unique()
    .notNull()
    .references(() => prompts.id, { onDelete: 'cascade' }),
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
  promptId: uuid('prompt_id')
    .notNull()
    .references(() => prompts.id, { onDelete: 'cascade' }),
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
  inputMarginPercent: numeric('input_margin_percent', { precision: 5, scale: 2 }).default(
    '50.0',
  ),
  outputMarginPercent: numeric('output_margin_percent', { precision: 5, scale: 2 }).default(
    '50.0',
  ),
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
  commissionPercent: numeric('commission_percent', {
    precision: 5,
    scale: 2,
  }).default('20.0'),
  totalReferrals: integer('total_referrals').default(0),
  totalEarnings: numeric('total_earnings', { precision: 10, scale: 2 }).default(
    '0',
  ),
  payoutMethod: text('payout_method'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Organizations table
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  ownerId: uuid('owner_id').notNull().references(() => users.id),
  planId: text('plan_id').notNull().references(() => plans.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// Organization members table
export const organizationMembers = pgTable('organization_members', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  role: organizationMemberRoleEnum('role').default('member'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Organization plans table
export const organizationPlans = pgTable('organization_plans', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  planId: text('plan_id').notNull().references(() => plans.id),
  seats: integer('seats').default(1),
  createdAt: timestamp('created_at').defaultNow(),
});

// Referral programs table
export const referralPrograms = pgTable('referral_programs', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  description: text('description'),
  rewardTokens: integer('reward_tokens').default(0),
  rewardDiscountPercent: numeric('reward_discount_percent', {
    precision: 5,
    scale: 2,
  }).default('0'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Referrals table
export const referrals = pgTable('referrals', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  referrerId: uuid('referrer_id').notNull().references(() => users.id),
  referredId: uuid('referred_id').references(() => users.id),
  status: referralStatusEnum('status').default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Support tickets table
export const supportTickets = pgTable('support_tickets', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull().references(() => users.id),
  subject: text('subject').notNull(),
  category: supportCategoryEnum('category').default('general'),
  priority: supportPriorityEnum('priority').default('low'),
  status: supportStatusEnum('status').default('open'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Support responses table
export const supportResponses = pgTable('support_responses', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  ticketId: uuid('ticket_id')
    .notNull()
    .references(() => supportTickets.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id),
  message: text('message').notNull(),
  isStaffResponse: boolean('is_staff_response').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Email templates table
export const emailTemplates = pgTable('email_templates', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  type: emailTemplateTypeEnum('type').default('custom'),
  createdAt: timestamp('created_at').defaultNow(),
});

// SMTP config table
export const smtpConfig = pgTable('smtp_config', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  host: text('host').notNull(),
  port: integer('port').notNull(),
  username: text('username'),
  password: text('password'),
  fromEmail: text('from_email').notNull(),
  fromName: text('from_name'),
  secure: boolean('secure').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Orders table
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull().references(() => users.id),
  planId: text('plan_id').notNull().references(() => plans.id),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('USD'),
  status: orderStatusEnum('status').default('pending'),
  stripeSessionId: text('stripe_session_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Newsletter subscribers table
export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  email: text('email').unique().notNull(),
  name: text('name'),
  source: text('source'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Popup config table
export const popupConfig = pgTable('popup_config', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  title: text('title').notNull(),
  description: text('description').notNull(),
  trigger: popupTriggerEnum('trigger').default('always'),
  showDelaySeconds: integer('show_delay_seconds').default(0),
  maxShows: integer('max_shows').default(1),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// IP whitelist table
export const ipWhitelist = pgTable('ip_whitelist', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  ipAddress: inet('ip_address').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Audit logs table
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').references(() => users.id),
  action: text('action').notNull(),
  target: text('target'),
  details: jsonb('details'),
  ipAddress: inet('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
});

// API keys table
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  lastUsed: timestamp('last_used'),
  createdAt: timestamp('created_at').defaultNow(),
});
