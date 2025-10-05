# PromptHub v2 - Características del Panel

## 🎯 Resumen Ejecutivo
PromptHub v2 es una plataforma completa de gestión de prompts con IA, marketplace integrado, sistema de soporte y panel administrativo avanzado.

---

## 👥 CARACTERÍSTICAS PARA USUARIOS

### Autenticación y Seguridad
- Login con Email/Password
- OAuth con Google y GitHub
- Autenticación de 2 factores (2FA con TOTP)
- Gestión de sesiones seguras
- Reset de contraseña

### Dashboard Personal
- Estadísticas de uso de tokens (usados/límite)
- Biblioteca de prompts personales
- Historial de ejecuciones
- Métricas de rendimiento

### Gestión de Prompts
- Crear y editar prompts personalizados
- Organizar por categorías
- Sistema de etiquetas (tags)
- Favoritos y búsqueda avanzada
- Copiar prompts con un click

### Playground
- Probar prompts en tiempo real
- Múltiples proveedores de IA (OpenAI, Anthropic, Google, OpenRouter)
- Selector de modelos
- Visualización de resultados
- Historial de ejecuciones

### Marketplace
- Catálogo de prompts premium en venta
- Vista detallada de productos con imágenes/videos
- Compra directa (sin carrito)
- Descuentos según plan (10%, 15%, 20%)
- Biblioteca de prompts comprados con scroll y copiar

### Centro de Soporte
- Crear tickets de soporte
- Seguimiento de tickets
- Sistema de mensajes
- Categorización de problemas

### Mi Perfil
- Actualizar datos personales
- Gestión de API Keys
- Cambiar plan de suscripción
- Ver historial de facturación

---

## 🔧 CARACTERÍSTICAS ADMIN (SUPERADMIN)

### Dashboard Administrativo
**Métricas principales:**
- Total de usuarios y usuarios activos (últimos 30 días)
- Total de prompts (sistema/usuario)
- Ejecuciones totales
- Tokens consumidos
- Ingresos totales y por usuario
- Distribución por planes
- Actividad reciente (7 días)

### Gestión de Usuarios
- Ver todos los usuarios con filtros (rol, plan, búsqueda)
- Cambiar roles (superadmin, admin, editor, viewer, user)
- Banear/Desbanear usuarios
- Impersonar usuario ("Acceder como")
- Ver estadísticas por usuario
- Editar datos de usuario
- Eliminar usuarios

### Gestión de Prompts
- CRUD completo de prompts
- Filtros: tipo (sistema/usuario), categoría, tags
- Estadísticas: visitas, copias, CTR, mejoras, traducciones
- Prompts destacados (featured)
- Búsqueda avanzada
- Acciones en lote

### Productos (Marketplace)
- Crear productos para vender
- Configurar precio, categoría, subcategoría
- Subir imagen/video preview
- Activar/desactivar venta
- Asignar prompt al producto
- Gestión de descuentos por plan

### Categorías
- Crear/Editar/Eliminar categorías
- Iconos personalizados (8 opciones)
- Colores personalizados (8 opciones)
- Estadísticas por categoría (prompts, visitas, copias, CTR)

### Planes de Suscripción
- CRUD de planes
- Configurar precio, tokens incluidos, límite de almacenamiento
- Precio por exceso de tokens (overage)
- Activar/Desactivar planes
- Ver estadísticas: usuarios, ingresos, tokens por plan

### Proveedores de IA
- Gestionar proveedores (OpenAI, Anthropic, Google, OpenRouter)
- Configurar modelos disponibles
- API Keys por proveedor
- Activar/Desactivar proveedores

### Precios de Tokens
- Configurar costo base por modelo (input/output)
- Margen de ganancia por modelo
- Conversión de moneda (USD, EUR, GBP)
- Tipo de cambio (FX rate)
- Cálculo automático de precio final

### Cupones y Descuentos
- Crear códigos de descuento
- Configurar porcentaje o monto fijo
- Límite de usos
- Fecha de expiración
- Planes aplicables

### Afiliados
- Gestión de programa de afiliados
- Comisión por referido
- Tracking de referidos
- Ganancias totales
- Estadísticas de afiliados activos

### Promociones de Tokens
- Crear popups promocionales
- Configurar descuento en paquetes de tokens
- Fecha inicio/fin de promoción
- Activar/Desactivar

### Planes de Organización (Multitenant)
- Planes para equipos
- Descuentos por volumen (2-19 usuarios: 10%, 20+: 20%)
- Límites de usuarios por plan
- Gestión de equipos

### Configuración de Referidos
- Comisión por referido
- Límite de referidos por usuario
- Bonus por milestone
- Reglas de validación

### Plantillas de Email
- Crear plantillas HTML
- Variables dinámicas
- Preview de emails
- Emails transaccionales (bienvenida, reset, notificaciones)

### Configuración SMTP
- Servidor SMTP personalizado
- Configurar host, puerto, usuario, password
- TLS/SSL
- Email de remitente

### Tickets de Soporte
- Ver todos los tickets
- Filtrar por estado, prioridad, categoría
- Responder tickets
- Asignar a staff
- Cerrar/Reabrir tickets

### Reportes y Facturación
- Ingresos por período
- Ingresos por plan
- Top usuarios por ingresos
- Uso por modelo de IA
- Exportar reportes

### Logs de Auditoría
- Registro de todas las acciones
- Filtrar por usuario, acción, fecha
- Detalles completos de cada evento
- Búsqueda de logs

### Configuración del Sistema
**General:**
- Nombre de la aplicación
- Logo y favicon
- Zona horaria
- Idioma predeterminado

**API:**
- Rate limiting
- CORS configuration
- Webhooks

**Video:**
- Proveedores de video (YouTube, Vimeo)
- Configuración de streaming

**Seguridad:**
- Políticas de contraseñas
- Sesiones y timeouts
- IP whitelisting

**Notificaciones:**
- Email notifications
- Push notifications
- Slack/Discord webhooks

---

## 🛒 SISTEMA ECOMMERCE

### Características
- Compra directa (sin carrito)
- Integración con Stripe
- Descuentos automáticos por plan
- Sistema de órdenes
- Descargas seguras con tokens (30 días, 5 descargas max)
- Historial de compras

### Flujo de Compra
1. Usuario ve producto en Marketplace
2. Click en "Comprar" → Validación de login
3. Página de producto con detalles
4. Stripe Checkout
5. Webhook procesa pago
6. Prompt agregado a biblioteca del usuario

---

## 📊 ESTADÍSTICAS Y MÉTRICAS

### Para Usuarios
- Tokens usados/disponibles
- Porcentaje de uso
- Días estimados restantes
- Total de prompts
- Ejecuciones realizadas

### Para Admins
- KPIs generales (usuarios, prompts, ingresos)
- Gráficos de actividad
- Distribución por planes
- Performance por modelo de IA
- Tasa de conversión del marketplace

---

## 🔌 INTEGRACIONES

### Proveedores de IA
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Google (Gemini)
- OpenRouter (múltiples modelos)

### Pagos
- Stripe (Checkout, Webhooks)

### Base de Datos
- Supabase PostgreSQL
- Autenticación Supabase

### Storage
- Imágenes y videos de productos
- Archivos adjuntos de soporte

---

## 🎨 UI/UX

### Temas
- Modo oscuro por defecto
- Diseño responsive
- Componentes shadcn/ui
- Iconos Lucide React

### Navegación
- Sidebar colapsable (Admin)
- Header con acceso rápido
- Breadcrumbs
- Búsqueda global

---

## 🚀 FUNCIONALIDADES TÉCNICAS

### API
- REST API completa
- Autenticación con tokens
- Rate limiting
- Validación con Zod

### Seguridad
- RLS (Row Level Security) en Supabase
- Encriptación de contraseñas
- API Keys cifradas
- 2FA opcional
- CORS configurado

### Performance
- Caching de queries
- Paginación en listados
- Lazy loading de imágenes
- Optimización de builds

---

## 📱 RESPONSIVE

- Desktop (1920px+)
- Laptop (1280px - 1919px)
- Tablet (768px - 1279px)
- Mobile (320px - 767px)

---

## 🔄 PRÓXIMAS CARACTERÍSTICAS (Roadmap)

- Multi-idioma completo (i18n)
- Workspace colaborativo
- Versionado de prompts
- A/B testing de prompts
- Marketplace de plantillas
- Integraciones adicionales (Slack, Discord, Zapier)
