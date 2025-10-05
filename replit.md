# PromptHub v2 - Project Info

## Overview

PromptHub v2 is a comprehensive platform designed for managing, sharing, and monetizing AI prompts. It features a professional landing page, robust authentication, a user dashboard for prompt management, a categorized marketplace for selling prompts, and an integrated support system. The project aims to provide a streamlined experience for prompt engineers and AI enthusiasts to discover, utilize, and trade valuable prompts. It includes a simple e-commerce solution with Stripe integration for direct purchases and a self-hosting guide for easy deployment.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application runs on a simplified architecture using Express.js as a single server for both frontend and backend. The frontend is a React application compiled into static files served by Express. Supabase is used as the primary database, managing user data, prompts, categories, and marketplace information with applied migrations. The system supports full authentication via OAuth (Google/GitHub) and email/password, with role-based access for an admin panel. A key architectural decision was to simplify the e-commerce flow to direct purchase (no shopping cart) with Stripe integration, moving away from external solutions like Shopify. The project is designed for self-hosting with Docker Compose and Dockerfiles.

**Key Features:**

*   **Professional Landing Page:** Designed for high conversion with trust badges and analytics previews.
*   **Comprehensive Authentication:** Supports OAuth (Google/GitHub) and email/password.
*   **User Dashboard:** Displays prompt statistics, favorites, visits, copies, CTR, token usage, and top lists.
*   **Prompt Management:** Categorization and provider management integrated with Supabase.
*   **Marketplace:** Catalog of prompts for sale with direct purchase functionality.
*   **Admin Panel:** Protected routes for managing products, users, and system settings.
*   **Support System:** Integrated ticket management.
*   **Token Usage Monitoring:** Modal for tracking token stats, history, and purchase options.
*   **Self-Hosting:** Dockerized setup for easy deployment.

## External Dependencies

*   **Supabase:** Database, authentication, and real-time functionalities.
*   **Stripe:** Payment processing for the e-commerce marketplace (Stripe Elements for checkout, Payment Intents API, Webhooks).
*   **OpenAI, Anthropic, OpenRouter:** (Optional) APIs for AI model interactions, used in the playground.
*   **lucide-react:** Icon library for UI elements.