# PromptHub v2 - Project Info

## Overview

PromptHub v2 is a comprehensive platform designed for managing, sharing, and monetizing AI prompts. It features a professional landing page, robust authentication, a user dashboard for prompt management, a categorized marketplace for selling prompts, and an integrated support system. The project aims to provide a streamlined experience for prompt engineers and AI enthusiasts to discover, utilize, and trade valuable prompts. It includes a simple e-commerce solution with Stripe integration for direct purchases and a self-hosting guide for easy deployment.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application runs on a simplified architecture using Express.js as a single server for both frontend and backend. The frontend is a React application compiled into static files served by Express. Supabase is used as the primary database, managing user data, prompts, categories, and marketplace information with applied migrations. The system supports full authentication via OAuth (Google/GitHub) and email/password, with role-based access for an admin panel. A key architectural decision was to simplify the e-commerce flow to direct purchase (no shopping cart) with Stripe integration, moving away from external solutions like Shopify. The project is designed for self-hosting with Docker Compose and Dockerfiles.

**Key Features:**

*   **Professional Landing Page:** Designed for high conversion with trust badges and analytics previews.
*   **Comprehensive Authentication:** Supports OAuth (Google/GitHub) and email/password via Supabase. AuthProvider exposes getToken() for secure API authentication.
*   **User Dashboard:** Displays prompt statistics, favorites, visits, copies, CTR, token usage, and top lists.
*   **Advanced Prompt Management:** 
    - Multi-type prompts: Text, Image, and Video with conditional UI
    - File upload system with preview (images max 10MB, videos max 500MB)
    - Automatic video compression via ffmpeg integration
    - Dynamic variables system: Define reusable variables (text/number/select/textarea) that users can fill
    - System prompts: Admin-flagged prompts available to all users regardless of ownership
    - Subcategories: Hierarchical organization with parent category relationships
    - Full categorization and provider management integrated with Supabase
*   **Marketplace:** Catalog of prompts for sale with direct purchase functionality.
*   **Admin Panel:** 
    - Enhanced Dashboard: Real-time stats, top prompts by CTR, recent activity feed, growth trends
    - Variables Management: CRUD for dynamic prompt variables with type validation
    - Subcategory Management: Hierarchical category structure with cascading organization
    - System Prompt Flags: Mark prompts as system-wide available
    - Protected routes for managing products, users, plans, coupons, affiliates, and system settings
*   **Support System:** Integrated ticket management with session-based authentication (fixed bug).
*   **Token Usage Monitoring:** Complete token management system with:
    - TokenUsageModal: Shows usage stats, 7-day history chart, purchase options with promotional bonuses, and plan upgrades
    - TokenWarningModal: Automatic popup at 75%+ usage threshold with configurable frequency, links to purchase/upgrade
    - Admin-configurable token promotions with percentage bonuses (10%/15%/20%)
*   **Playground:** Disabled from navigation (reserved for future agents feature)
*   **Self-Hosting:** Dockerized setup for easy deployment.

## External Dependencies

*   **Supabase:** Database, authentication, and real-time functionalities.
*   **Stripe:** Payment processing for the e-commerce marketplace (Stripe Elements for checkout, Payment Intents API, Webhooks).
*   **OpenAI, Anthropic, OpenRouter:** (Optional) APIs for AI model interactions, used in the playground.
*   **ffmpeg:** Video compression and processing for uploaded media files.
*   **multer:** Node.js middleware for handling multipart/form-data file uploads.
*   **lucide-react:** Icon library for UI elements.

## Recent Updates (Oct 2025)

### Multi-Type Prompt System
- Added support for Text, Image, and Video prompts with type selector
- Implemented file upload UI with image preview and video preview placeholders
- Created `/api/upload` endpoint with automatic video compression (ffmpeg)
- Files stored in `public/uploads` directory served statically

### Dynamic Variables System
- Admin can define reusable variables: name, label, type (text/number/select/textarea), options, defaults
- Variables available in prompt creation with `{variable_name}` syntax
- VariableManagement component for CRUD operations in admin panel

### System Prompts
- New `is_system_prompt` flag allows admins to mark prompts available to all users
- System prompts bypass ownership checks and appear in all user libraries
- Checkbox in PromptManagement for easy toggling

### Subcategory Hierarchy
- SubcategoryManagement component for organizing prompts within categories
- Parent-child relationship between categories and subcategories
- Cascading organization and filtering support

### Enhanced Admin Dashboard
- Real-time statistics: total users, prompts, revenue, active users, views, copies, CTR
- Top 5 prompts ranked by performance metrics
- Recent activity feed showing user interactions
- Growth trend indicators with percentage changes
- Placeholder for future Chart.js integration