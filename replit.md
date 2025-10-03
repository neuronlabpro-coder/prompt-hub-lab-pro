# Overview

PromptHub v2 is an advanced AI prompt management platform that enables users to create, test, optimize, and manage prompts across multiple AI models. The platform features a comprehensive prompt library, multi-model testing playground, analytics dashboard, and billing system based on token usage. It includes both user-facing features and a complete admin panel for managing users, plans, providers, and system settings.

## Admin Configurable Features

All system configurations can be edited from the Admin Panel without code changes:

**Plan Management** (Admin → Planes)
- Plan name, price, tokens included, overage price
- Storage limits per plan (MB)
- Plan activation/deactivation status

**Video Compression Settings** (Admin → Configuración del Sistema → Video)
- Video codec (libvpx-vp9 default)
- Audio codec (libopus default)
- Bitrate configuration
- CRF (quality factor: 0-63)
- Maximum preview duration (seconds)

**Multitenant Discounts** (Admin → Configuración del Sistema → Descuentos)
- Tier 1: 2-19 users → 10% discount (configurable)
- Tier 2: 20+ users → 20% discount (configurable)
- User thresholds per tier

**API & Provider Settings** (Admin → Configuración del Sistema → APIs)
- OpenAI, Anthropic, Replicate API keys
- Rate limits and token limits

**User Impersonation**
- Admin can access as any user with "Acceder como usuario" button
- Banner shows current impersonation status
- Useful for debugging and user support

## User Profile Management

All users (including admins and superadmins) have access to a complete profile page at `/profile`:

**Personal Information**
- Name editing with Supabase integration
- Avatar display with user initials fallback

**Security Settings**
- Password change functionality with confirmation
- Email change (with verification required)
- Two-factor authentication (2FA) setup using TOTP
  - QR code generation for authenticator apps
  - Secret key backup display
  - Verification and removal options

**Account Information**
- Current subscription plan display
- Token usage tracking (used/total)
- Token usage progress bar
- Plan-specific storage limits visibility

**Navigation**
- Accessible from Header user menu
- Clean close button to return to main app
- Dedicated route at `/profile`

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework & Build Tools**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Tailwind CSS for utility-first styling with dark mode support
- Custom routing implementation without external router dependencies

**UI Component System**
- Radix UI primitives for accessible components (Dialog, Dropdown, Select, Switch, Tabs, Toast)
- Class Variance Authority (CVA) for component variant management
- Lucide React for consistent iconography
- Custom design system with reusable Card, Button, Input, Badge, and Select components

**State Management**
- React hooks for local component state
- Custom hooks for data fetching and business logic (useSupabase, useAdminData, useToast)
- Context-based routing system via RouterContext
- AuthProvider context for authentication state

**Key Features Architecture**
- Prompt management with versioning support
- Multi-language support (Spanish/English) with simultaneous translation
- Token estimation and cost calculation utilities
- Analytics dashboard with comprehensive metrics
- Playground for testing prompts across different AI providers

## Backend Architecture

**Database Layer**
- Supabase as Backend-as-a-Service (BaaS) for database, authentication, and storage
- PostgreSQL database with Row Level Security (RLS)
- Drizzle ORM for type-safe database queries
- Neon serverless database support for scalability

**API Server**
- Express.js REST API server (Node.js/ES modules)
- Route-based organization: prompts, auth, execute, improve, translate, email
- CORS and Helmet middleware for security
- JSON body parsing with 10MB limit for media support

**Authentication & Authorization**
- Dual auth setup: Supabase Auth for main flow, Clerk integration available
- Role-based access control (superadmin, admin, editor, viewer, user)
- Session-based authentication with user context in requests
- Two-factor authentication support (TOTP)

**Business Logic**
- Token usage tracking and billing calculations
- Prompt improvement engine using AI models
- Automatic translation service between ES/EN
- Execution tracking with cost and latency metrics
- Audit logging for all administrative actions

## Data Schema Design

**Core Tables**
- `users`: User accounts with role, plan, token limits, and Stripe customer ID
- `prompts`: Prompt content (bilingual), categorization, metadata, and media support
- `prompt_stats`: Analytics metrics (visits, copies, tokens, CTR, improvements)
- `prompt_versions`: Version history for prompt iterations
- `categories`: Prompt categorization with icons and colors
- `plans`: Subscription plans with token allocations and pricing
- `providers`: AI provider configuration (OpenAI, Anthropic, etc.)
- `models`: Model-specific settings and pricing
- `token_prices`: Token cost per model for billing

**Billing & Commerce**
- `executions`: API execution logs with token counts and costs
- `coupons`: Discount codes with scope and usage limits
- `affiliates`: Referral program tracking and commission calculation
- `token_promotions`: Special offers and promotions for token purchases
- `organization_plans`: Team/enterprise pricing structures

**Admin & Support**
- `audit_logs`: System activity tracking with IP and user agent
- `support_tickets`: Customer support with priority and category
- `support_responses`: Ticket response threading
- `email_templates`: Customizable email templates with variables
- `smtp_config`: Email delivery configuration

**Enums for Type Safety**
- User roles, prompt types, coupon types/scopes
- Organization member roles, referral status
- Popup triggers, email template types
- Support categories, priorities, and statuses

## External Dependencies

**AI Model Providers**
- OpenAI API for GPT models (GPT-5, GPT-5 Mini)
- Anthropic API for Claude models
- Google Gemini integration
- DeepSeek API support
- Azure OpenAI compatibility
- Replicate for open-source models
- Ollama for local model support

**Payment & Billing**
- Stripe for payment processing and subscription management
- Stripe customer portal integration
- Token-based billing with overage charges

**Database & Storage**
- Supabase (PostgreSQL) as primary database
- Neon Database for serverless PostgreSQL option
- Drizzle ORM for database operations
- WebSocket support for real-time features

**Development & Infrastructure**
- TypeScript for type safety across the stack
- ESLint with React hooks and TypeScript plugins
- Dotenv for environment configuration
- CORS and Helmet for API security
- Fluent-FFmpeg for video compression (media prompts)

**Utilities & Libraries**
- js-tiktoken for accurate token counting
- UUID for unique identifier generation
- Zod for runtime schema validation
- React Hook Form with resolvers for form management
- Class Variance Authority for component styling

**Authentication Services**
- Clerk for advanced authentication (optional, configured but not primary)
- Supabase Auth Helpers for React integration
- GitHub and Google OAuth support

**Email & Communication**
- SMTP configuration for transactional emails
- Custom email template system with variable interpolation
- Support ticket system with response threading