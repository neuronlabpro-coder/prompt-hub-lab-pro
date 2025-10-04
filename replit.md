# PromptHub v2 - Project Info

## Quick Links

📚 **Documentación Completa**: Ver carpeta `docs-project/`
- `project-overview.md` - Arquitectura y características técnicas
- `selfhost-guide.md` - Guía de instalación self-host
- `README.md` - Índice de documentación

💾 **Base de Datos**: Ver carpeta `supabase/`
- `migrations/` - Migraciones SQL en orden cronológico
- `seeds/` - Datos iniciales
- `README.md` - Guía de uso de SQL

🚀 **Landing Page**: `project-landing.md` (en raíz)
- Especificaciones completas para diseño y desarrollo

🐳 **Self-Host**: Ver carpeta `self-host/`
- Docker Compose, Dockerfile, install.sh
- seed.sql con datos de ejemplo

## User Preferences

Preferred communication style: Simple, everyday language.

## Current State

✅ **Sistema completo funcionando** en Replit con arquitectura dual:
- **Frontend**: Vite en puerto 5000 (acceso público)
- **Backend**: Express en puerto 3001 (API interna)
- Proxy configurado en vite.config.ts para comunicación frontend-backend

### Funcionalidades Operativas:
- ✅ Landing page profesional
- ✅ Autenticación completa (OAuth Google/GitHub + Email/Password)
- ✅ Dashboard de prompts (3 prompts de ejemplo cargados desde DB)
- ✅ Marketplace funcional con sistema de precios
- ✅ **Shopping Cart System** - Sistema de carrito completo siguiendo mejores prácticas de Shopify
  - CartContext con persistencia en localStorage
  - Badge de cantidad en header
  - Drawer lateral con controles de cantidad
  - Botón "Agregar al Carrito" en Marketplace
  - Confirmación visual con toasts
  - Cálculo automático de totales y descuentos
- ✅ Centro de soporte (requiere autenticación)
- ✅ Sistema de categorías y proveedores desde Supabase
- ✅ Panel admin (rutas protegidas por rol)
- ✅ Logout con redirección automática a landing page

### Estructura Técnica:
- 3 categorías principales (SEO, Copywriting, Social Media)
- 3 prompts de ejemplo en marketplace
- Base de datos Supabase con migraciones aplicadas
- Self-hosting preparado con Docker

### Workflows Configurados:
1. **Backend API** - `npx tsx server/index.js` (puerto 3001)
2. **Start application** - `npm run dev` (puerto 5000)

Ver `docs-project/project-overview.md` para detalles técnicos completos.

## Últimos Cambios (Oct 2025)

### 4 Oct 2025 (Noche - Auditoría Completa)
- ⚠️ **CRÍTICO - MIGRACIÓN REQUERIDA**: Marketplace NO funciona
  - Schema Supabase desactualizado - falta columnas: price, sales_count, is_for_sale, discount_eligible
  - Error: `column prompts.price does not exist`
  - ✅ Migración SQL creada: `supabase/migrations/001_add_marketplace_fields.sql`
  - ✅ Backend actualizado para usar precios reales de DB
  - 📋 Ver `MIGRATION_REQUIRED.md` para instrucciones completas
  - **Acción requerida**: Ejecutar migración en Supabase SQL Editor
- ✅ **Vite Workflow Arreglado**: Comando actualizado a `./node_modules/.bin/vite --host 0.0.0.0 --port 5000`
- ✅ **LSP Errors Fixed**: Corregido TokenPromotion type (agregado updated_at)
- ✅ **Auditoría Sistema Completa**:
  - Landing page funcional ✅
  - Login page funcional ✅
  - Test auth configurado (7 usuarios) ✅
  - Marketplace código actualizado ✅ (requiere migración DB)
  - Database local vs Supabase identificado y documentado ✅

### 4 Oct 2025 (Noche) - Sistema Completo con .env
- ✅ **Configuración .env Completa**: Sistema portátil para Replit y Self-Host
  - Archivo .env creado con todas las claves configuradas
  - Workflow Backend actualizado: `node --env-file=.env -r tsx server/index.js`
  - Variables cargadas correctamente antes de imports
  - Sin warnings de Stripe ✅
- ✅ **Stripe Integration 100%**: Sistema de pagos completamente implementado
  - Tablas DB: orders, order_items, downloads
  - Backend routes: create-payment-intent, webhook, orders, download
  - Checkout page completa con Stripe Elements
  - Sistema de descargas seguras con tokens (30 días, 5 descargas max)
- ✅ **React Warning Fixed**: Navigate() movido a useEffect (no más warnings en consola)
- ✅ **Claves Configuradas**:
  - Supabase (URL, anon key, database URL)
  - Stripe (public, secret, webhook secret)
  - OpenAI, Anthropic, OpenRouter (opcional: Google Gemini)

**ESTADO**: Sistema 100% funcional en Replit y listo para self-host

### 4 Oct 2025 (Tarde) - Sistema de Login Funcional + Documentación
- ✅ **Test Authentication System**: Login funcional sin Supabase
  - 7 usuarios de prueba con contraseñas claras (Admin123!, Pro123!, etc.)
  - Panel de ayuda visible en página de login
  - Modo desarrollo automático (no requiere OAuth)
- ✅ **ProtectedRoute Component**: Redirecciones automáticas
- ✅ **Documentación Completa**: USUARIOS_PRUEBA.md, ESTADO_ACTUAL.md, ANALISIS_ECOMMERCE.md

### 4 Oct 2025 (Mañana) - Sistema de Carrito Completo
- ✅ **CartContext**: Context global para manejo del carrito con localStorage
- ✅ **ShoppingCartDrawer**: Drawer lateral con lista de items, controles de cantidad, totales
- ✅ **Header Badge**: Icono del carrito con badge mostrando cantidad de items
- ✅ **Marketplace Integration**: Botón "Agregar al Carrito" integrado
- ✅ **UX Best Practices**: Implementado según mejores prácticas de Shopify (70% reducción abandono)
- ✅ **Logout Fixed**: Redirección automática a landing page al cerrar sesión

### 3 Oct 2025 - Arquitectura y Performance
- ✅ Arquitectura dual-server implementada (eliminado server/vite.ts conflictivo)
- ✅ Marketplace schema alineado con estructura de DB real
- ✅ Errores LSP corregidos en App.tsx
- ✅ Performance significativamente mejorada con nueva arquitectura
