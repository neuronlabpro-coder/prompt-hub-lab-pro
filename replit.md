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
- ✅ Centro de soporte (requiere autenticación)
- ✅ Sistema de categorías y proveedores desde Supabase
- ✅ Panel admin (rutas protegidas por rol)

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
- ✅ Arquitectura dual-server implementada (eliminado server/vite.ts conflictivo)
- ✅ Marketplace schema alineado con estructura de DB real
- ✅ Errores LSP corregidos en App.tsx
- ✅ Performance significativamente mejorada con nueva arquitectura
