# PromptHub v2 - Especificaciones Completas para Landing Page

## 🎯 Visión General del Producto

**PromptHub v2** es una plataforma SaaS completa de gestión, optimización y monetización de prompts de IA. Diseñada para empresas, equipos y creadores que trabajan con múltiples modelos de lenguaje (LLMs) y necesitan centralizar, optimizar y escalar su uso de inteligencia artificial.

### Propuesta de Valor Principal
- **Centralización Multi-Modelo**: Trabaja con OpenAI, Anthropic, Google Gemini, DeepSeek y Replicate desde una única interfaz
- **Optimización Inteligente**: Motor de IA que mejora automáticamente tus prompts
- **Monetización**: Marketplace integrado para vender y comprar prompts profesionales
- **Control de Costos**: Seguimiento detallado de tokens y costos por modelo
- **Colaboración Empresarial**: Gestión de equipos con roles y permisos

---

## 📋 CARACTERÍSTICAS PRINCIPALES

### 1. GESTIÓN AVANZADA DE PROMPTS

#### 1.1 Editor Multilenguaje
- **Español e Inglés simultáneos**: Escribe prompts en ambos idiomas con traducción automática
- **Versionado automático**: Historial completo de cambios con rollback
- **Vista previa en tiempo real**: Estimación de tokens antes de ejecutar
- **Syntax highlighting**: Editor inteligente con sugerencias

#### 1.2 Sistema de Categorización Avanzado
**3 Tipos Principales de Prompts:**
- 📝 **Texto**: Generación de contenido escrito
- 🖼️ **Imagen**: Generación de imágenes con IA
- 🎥 **Vídeo**: Generación de contenido audiovisual

**20 Subcategorías Especializadas:**

**Para Texto:**
- Marketing: Campañas publicitarias, copywriting, email marketing
- Redes Sociales: Posts, threads de Twitter, captions de Instagram
- Negocios: Reportes, emails corporativos, presentaciones
- Creativo: Historias, poemas, guiones
- Educación: Material didáctico, cursos, tutoriales
- Programación: Código, documentación técnica, debugging

**Para Imagen:**
- Marketing: Banners, ads, material publicitario
- Redes Sociales: Posts visuales, stories, reels
- Animales: Fotografía de mascotas, fauna salvaje
- Naturaleza: Paisajes, elementos naturales
- Personas: Retratos, fotografía de personas
- Arte Digital: Ilustraciones, diseño conceptual
- Productos: Fotografía de producto, e-commerce

**Para Vídeo:**
- Marketing: Ads, vídeos promocionales
- Redes Sociales: Shorts, TikToks, Reels
- ASMR: Contenido de relajación
- Animales: Vídeos de mascotas
- Educación: Tutoriales, cursos
- Vlogs: Contenido de lifestyle
- Música: Videoclips, contenido musical

#### 1.3 Organización y Búsqueda
- **Tags personalizables**: Etiqueta tus prompts con palabras clave
- **Filtros avanzados**: Por categoría, tipo, favoritos, públicos/privados
- **Búsqueda inteligente**: Busca por título, contenido o tags
- **Favoritos**: Marca prompts importantes para acceso rápido
- **Prompts públicos/privados**: Control de visibilidad

#### 1.4 Soporte Multimedia
- **Prompts de texto**: Hasta 100,000 caracteres
- **Prompts de imagen**: Subida y gestión de imágenes de referencia
- **Prompts de vídeo**: 
  - Subida de vídeos hasta 500MB
  - Compresión automática optimizada
  - Generación de previews automáticos
  - Configuración de codec y bitrate
  - Máxima duración configurable

---

### 2. MOTOR DE IA MULTI-MODELO

#### 2.1 Proveedores Soportados

**OpenAI (3 modelos)**
- GPT-5: Modelo más avanzado, 128K tokens contexto
- GPT-5 Mini: Versión rápida y económica, 128K tokens
- GPT-4o: Modelo optimizado, 128K tokens

**Anthropic (1 modelo)**
- Claude 3.5 Sonnet: 200K tokens contexto, análisis profundo

**Google Gemini (3 modelos)**
- Gemini 2.0 Flash: 1M tokens contexto, velocidad extrema
- Gemini 1.5 Pro: 2M tokens contexto, análisis extenso
- Gemini 1.5 Flash: 1M tokens contexto, equilibrado

**DeepSeek (2 modelos)**
- DeepSeek Chat: 64K tokens, conversación natural
- DeepSeek Coder: 64K tokens, especializado en código

**Replicate (1 modelo)**
- Llama 2 70B Chat: Modelo open-source, 4K tokens

#### 2.2 Playground de Pruebas
- **Ejecución en tiempo real**: Prueba prompts con cualquier modelo
- **Comparación lado a lado**: Compara resultados de múltiples modelos
- **Streaming de respuestas**: Ve la generación en tiempo real
- **Historial de ejecuciones**: Guarda y revisa todas las pruebas
- **Parámetros configurables**: 
  - Temperatura (creatividad)
  - Max tokens (longitud)
  - Top-p (diversidad)
  - Frequency penalty
  - Presence penalty

#### 2.3 Motor de Mejora Automática
- **IA que mejora IA**: Sistema que optimiza tus prompts automáticamente
- **Sugerencias contextuales**: Mejoras específicas según el tipo de prompt
- **A/B Testing**: Compara versión original vs mejorada
- **Métricas de calidad**: Evalúa claridad, especificidad y efectividad
- **Aprendizaje continuo**: El sistema aprende de tus preferencias

#### 2.4 Traducción Automática
- **Español ⟷ Inglés**: Traducción bidireccional instantánea
- **Preserva formato**: Mantiene estructura y formato del prompt
- **Contexto específico**: Traducciones optimizadas para IA
- **Revisión manual**: Edita traducciones si es necesario

#### 2.5 Asignación de Modelo Preferido
- **Modelo recomendado**: Cada prompt puede tener un modelo LLM preferido
- **Optimización automática**: El sistema sugiere el mejor modelo
- **Ejecución rápida**: Un clic para ejecutar con modelo preferido
- **Flexibilidad**: Cambia de modelo cuando quieras

---

### 3. ANALYTICS Y TRACKING

#### 3.1 Dashboard de Métricas
**Métricas Generales:**
- Total de prompts creados
- Tokens consumidos (por modelo)
- Costos totales y por modelo
- Prompts más usados
- Tendencias de uso

**Métricas por Prompt:**
- Número de visualizaciones
- Copias realizadas
- Ejecuciones totales
- Tokens consumidos
- Costo promedio por ejecución
- Latencia promedio
- Última vez usado

#### 3.2 Estadísticas Detalladas
- **Gráficos temporales**: Uso por día/semana/mes
- **Comparativa de modelos**: Rendimiento y costo por modelo
- **Análisis de eficiencia**: ROI de cada prompt
- **Exportación de datos**: CSV/Excel con todas las métricas
- **Reportes automáticos**: Informes semanales/mensuales por email

#### 3.3 Control de Costos
- **Límites de tokens**: Define límites por usuario/equipo
- **Alertas de consumo**: Notificaciones cuando alcanzas umbrales
- **Proyección de costos**: Estima costos futuros basado en uso
- **Optimización de gastos**: Sugerencias para reducir costos
- **Facturación detallada**: Desglose completo de gastos

---

### 4. MARKETPLACE DE PROMPTS

#### 4.1 Compra y Venta
**Para Vendedores:**
- Publica prompts para vender
- Establece tu precio (desde $1)
- Dashboard de ventas con estadísticas
- Pagos automáticos vía Stripe
- Comisión de plataforma: 20%

**Para Compradores:**
- Explora miles de prompts profesionales
- Vista previa antes de comprar
- Descuentos por suscripción:
  - Free: 0% descuento
  - Starter: 10% descuento
  - PRO: 15% descuento
  - Business/Plus: 20% descuento
- Historial de compras
- Acceso inmediato después de pagar

#### 4.2 Sistema de Descubrimiento
- **Trending**: Prompts más vendidos
- **Recientes**: Últimos prompts publicados
- **Por categoría**: Navega por subcategorías
- **Búsqueda avanzada**: Encuentra exactamente lo que necesitas
- **Recomendaciones**: IA sugiere prompts relevantes
- **Ratings y reviews**: Valoraciones de usuarios

#### 4.3 Protección y Calidad
- **Verificación de vendedores**: Sistema de reputación
- **Calidad garantizada**: Moderación de contenido
- **Política de reembolso**: Protección al comprador
- **Licencia de uso**: Clara definición de derechos
- **Soporte integrado**: Ayuda con cada compra

---

### 5. GESTIÓN DE EQUIPOS Y COLABORACIÓN

#### 5.1 Roles y Permisos
**5 Niveles de Acceso:**

**Superadmin**
- Control total del sistema
- Gestión de todos los usuarios
- Configuración de plataforma
- Acceso a analytics global
- Gestión de facturación

**Admin**
- Gestión de usuarios de su organización
- Configuración de equipo
- Acceso a analytics del equipo
- Gestión de prompts compartidos
- Control de límites de tokens

**Editor**
- Crear y editar prompts
- Compartir con el equipo
- Ejecutar prompts
- Acceso a analytics propios
- Colaboración activa

**Viewer**
- Ver prompts compartidos
- Copiar prompts para uso personal
- Acceso limitado a analytics
- Sin capacidad de edición

**User**
- Gestión de prompts propios
- Acceso a marketplace
- Analytics personales
- Uso individual

#### 5.2 Colaboración en Tiempo Real
- **Prompts compartidos**: Biblioteca de equipo
- **Comentarios**: Discute y mejora prompts en equipo
- **Notificaciones**: Alertas de cambios importantes
- **Control de versiones**: Quién cambió qué y cuándo
- **Aprobaciones**: Workflow de revisión antes de publicar

#### 5.3 Gestión de Organización
- **Múltiples equipos**: Crea departamentos o proyectos
- **Límites por equipo**: Tokens y presupuesto por grupo
- **Facturación consolidada**: Un pago para toda la org
- **Reportes por equipo**: Métricas separadas por grupo
- **Descuentos por volumen**:
  - 2-19 usuarios: 10% descuento
  - 20+ usuarios: 20% descuento

---

### 6. PLANES Y PRECIOS

#### 6.1 Plan Free
**$0/mes**
- 10,000 tokens incluidos
- 1 usuario
- 100MB almacenamiento
- Prompts ilimitados (privados)
- Acceso a marketplace (0% descuento)
- Soporte por email
- Analytics básicos

#### 6.2 Plan Starter
**$19/mes**
- 100,000 tokens incluidos
- 1 usuario
- 500MB almacenamiento
- Prompts ilimitados
- Marketplace (10% descuento)
- Generación de API keys
- Soporte prioritario
- Analytics avanzados
- Versionado extendido (50 versiones)

#### 6.3 Plan PRO
**$29/mes** (Más Popular)
- 500,000 tokens incluidos
- 3 usuarios
- 1GB almacenamiento
- Prompts ilimitados
- Marketplace (15% descuento)
- API keys ilimitadas
- Soporte prioritario 24/7
- Analytics avanzados + exportación
- Versionado ilimitado
- Integración con Slack/Discord
- Webhooks
- White-label disponible

#### 6.4 Plan Business
**$99/mes**
- 2,000,000 tokens incluidos
- 10 usuarios
- 5GB almacenamiento
- Todo de PRO +
- Marketplace (20% descuento)
- SSO (Single Sign-On)
- Onboarding dedicado
- Account manager
- SLA garantizado
- Auditoría y compliance
- Backup automático
- Integración con herramientas empresariales

#### 6.5 Plan Enterprise
**Precio Personalizado**
- Tokens ilimitados
- Usuarios ilimitados
- Almacenamiento ilimitado
- Todo de Business +
- Marketplace (20% descuento)
- Self-hosted disponible
- Soporte dedicado 24/7
- Customización completa
- Integración personalizada
- Training y consultoría
- Contratos anuales con descuento

#### 6.6 Tokens Extra (Overage)
**Todos los planes**
- $0.02 por cada 1,000 tokens adicionales
- Facturación automática mensual
- Sin límite de compra
- Descuentos por volumen en Enterprise

---

### 7. AUTENTICACIÓN Y SEGURIDAD

#### 7.1 Métodos de Autenticación
- **Email/Password**: Autenticación tradicional
- **OAuth Google**: Login con Google
- **OAuth GitHub**: Login con GitHub
- **Magic Links**: Login sin contraseña por email
- **SSO Empresarial**: SAML 2.0 para empresas

#### 7.2 Seguridad Avanzada
- **2FA (Autenticación de Dos Factores)**:
  - TOTP (Google Authenticator, Authy)
  - Códigos de respaldo
  - Configuración desde perfil de usuario
- **Encriptación**: AES-256 para datos sensibles
- **API Keys seguras**: Hash con bcrypt
- **Rate limiting**: Protección contra ataques
- **Auditoría completa**: Log de todas las acciones
- **Cumplimiento**: GDPR, SOC 2, ISO 27001

#### 7.3 Gestión de Usuarios
- **Perfil personalizable**:
  - Nombre, email, avatar
  - Cambio de contraseña
  - Cambio de email (con verificación)
  - Configuración de 2FA
- **Información de cuenta**:
  - Plan actual
  - Tokens usados/disponibles
  - Almacenamiento usado
  - Historial de facturación

---

### 8. INTEGRACIONES Y API

#### 8.1 API RESTful Completa
**Documentación OpenAPI 3.0**
- Autenticación con API keys
- Rate limits por plan
- Webhooks para eventos
- SDKs oficiales:
  - JavaScript/TypeScript
  - Python
  - Go
  - PHP

**Endpoints Principales:**
- `/api/prompts` - Gestión de prompts
- `/api/execute` - Ejecutar prompts
- `/api/improve` - Mejorar prompts
- `/api/translate` - Traducir prompts
- `/api/analytics` - Obtener métricas
- `/api/marketplace` - Comprar/vender prompts

#### 8.2 Webhooks
**Eventos Disponibles:**
- prompt.created
- prompt.executed
- prompt.improved
- user.token_limit_reached
- marketplace.purchase_completed
- team.member_added

#### 8.3 Integraciones Nativas
**Productividad:**
- Slack: Notificaciones y comandos
- Discord: Bots y webhooks
- Microsoft Teams: Integraciones

**Desarrollo:**
- GitHub: Integración con repos
- GitLab: CI/CD pipelines
- VS Code: Extensión oficial

**No-Code:**
- Zapier: Automatizaciones
- Make (Integromat): Workflows
- n8n: Self-hosted automation

---

### 9. SISTEMA DE SOPORTE

#### 9.1 Centro de Soporte Integrado
**Tickets de Soporte:**
- Formulario desde la aplicación
- 5 Categorías:
  - Soporte Técnico
  - General
  - Ventas
  - Técnico/Bugs
  - Facturación
- 4 Niveles de Prioridad:
  - Baja (respuesta en 48h)
  - Media (respuesta en 24h)
  - Alta (respuesta en 4h)
  - Urgente (respuesta en 1h)

**Estados de Tickets:**
- Abierto: Ticket nuevo
- En Progreso: Siendo atendido
- Esperando Respuesta: Necesita info del usuario
- Resuelto: Problema solucionado
- Cerrado: Ticket finalizado

#### 9.2 Conversación en Hilos
- Respuestas directas en el ticket
- Historial completo de conversación
- Adjuntar imágenes y archivos
- Notificaciones por email
- Respuestas de admins destacadas

#### 9.3 Base de Conocimiento
- Artículos de ayuda
- Tutoriales en vídeo
- FAQs por categoría
- Guías de inicio rápido
- Casos de uso

#### 9.4 Tiempos de Respuesta por Plan
- **Free**: 48 horas (solo email)
- **Starter**: 24 horas
- **PRO**: 4 horas (24/7)
- **Business**: 1 hora (24/7)
- **Enterprise**: Inmediato (soporte dedicado)

---

### 10. CONFIGURACIÓN DEL SISTEMA (Admin Panel)

#### 10.1 Gestión de Planes
**Configurable sin código:**
- Nombre y precio del plan
- Tokens incluidos
- Precio de overage (tokens extra)
- Límites de almacenamiento
- Número máximo de usuarios
- Features habilitadas
- Activar/desactivar planes

#### 10.2 Configuración de Vídeo
**Compresión y Procesamiento:**
- Codec de vídeo (libvpx-vp9 por defecto)
- Codec de audio (libopus por defecto)
- Bitrate (kbps)
- CRF (factor de calidad: 0-63)
- Duración máxima de preview (segundos)
- Tamaño máximo de archivo

#### 10.3 Descuentos Multitenant
**Por Número de Usuarios:**
- Tier 1 (2-19 usuarios): 10% descuento
- Tier 2 (20+ usuarios): 20% descuento
- Umbrales configurables
- Aplicación automática

#### 10.4 Gestión de API Keys
**Proveedores de IA:**
- OpenAI API Key
- Anthropic API Key
- Google Gemini API Key
- DeepSeek API Key
- Replicate API Key
- Rate limits por proveedor
- Fallbacks automáticos
- ⚠️ **Seguridad**: Keys nunca expuestas al cliente

#### 10.5 Configuración de Email (SMTP)
- Host y puerto SMTP
- Usuario y contraseña
- TLS/SSL
- From name y email
- Templates de email personalizables:
  - Bienvenida
  - Recuperación de contraseña
  - Alertas de tokens
  - Confirmación de compra
  - Resumen semanal

#### 10.6 Impersonación de Usuarios
**Función de Admin:**
- "Acceder como usuario" desde panel admin
- Banner visible durante impersonación
- Útil para soporte y debugging
- Log de auditoría de todas las impersonaciones
- Salir de impersonación con un clic

---

### 11. NEWSLETTER Y MARKETING

#### 11.1 Sistema de Newsletter
**Suscripción:**
- Formulario en landing page
- Pop-up inteligente (tiempo/scroll)
- API para integraciones
- Doble opt-in

**Gestión:**
- Dashboard de suscriptores
- Segmentación por interés
- Envío masivo de emails
- Métricas de apertura y clicks
- Unsuscribe con un clic

#### 11.2 Marketing Features
- **Pop-ups configurables**:
  - Trigger por tiempo en página
  - Trigger por scroll
  - Trigger por intención de salida
  - A/B testing de mensajes
- **Promociones de tokens**:
  - Ofertas especiales
  - Descuentos por tiempo limitado
  - Bundles de tokens

---

### 12. SELF-HOSTING

#### 12.1 Despliegue Propio
**Opciones de Instalación:**
- Docker Compose (recomendado)
- Manual con PostgreSQL
- Script automatizado
- Coolify (alternativa a Vercel)

#### 12.2 Archivos Incluidos
- `schema.sql`: Schema completo de base de datos
- `seed-data.sql`: Datos iniciales
- `categories-models-update.sql`: Migración de categorías
- `marketplace-support-update.sql`: Migración de marketplace
- `docker-compose.yml`: Configuración Docker
- `README.md`: Guía de instalación completa

#### 12.3 Requisitos
- PostgreSQL 13+
- Node.js 18+
- 2GB RAM mínimo
- 10GB almacenamiento
- Dominio propio (opcional)

#### 12.4 Ventajas Self-Hosted
- Control total de datos
- Sin límites de usuarios
- Personalización completa
- Integración con infraestructura existente
- Cumplimiento de normativas locales
- Sin cargos de suscripción (solo infraestructura)

---

### 13. CARACTERÍSTICAS TÉCNICAS

#### 13.1 Stack Tecnológico
**Frontend:**
- React 18 con TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- Radix UI (componentes accesibles)
- Lucide Icons

**Backend:**
- Node.js + Express
- PostgreSQL (Supabase)
- Drizzle ORM
- Supabase Auth
- Stripe (pagos)

**Infrastructure:**
- Replit (hosting)
- Supabase (BaaS)
- Cloudflare (CDN)
- AWS S3 (almacenamiento)

#### 13.2 Performance
- **Carga inicial**: < 2 segundos
- **Time to interactive**: < 3 segundos
- **Lighthouse Score**: 90+
- **API Response Time**: < 200ms (p95)
- **Uptime**: 99.9% SLA

#### 13.3 Escalabilidad
- **Usuarios concurrentes**: 10,000+
- **Requests por segundo**: 1,000+
- **Database**: Auto-scaling con Supabase
- **Storage**: Ilimitado con S3
- **CDN**: Global con Cloudflare

---

### 14. ROADMAP Y FUTURO

#### 14.1 En Desarrollo
- **Q1 2025**:
  - Integración con más modelos (Mistral, Cohere)
  - Editor colaborativo en tiempo real
  - Plantillas de prompts por industria
  - Mobile app (iOS/Android)

#### 14.2 Próximamente
- **Q2 2025**:
  - Fine-tuning de modelos custom
  - Análisis de sentimiento en prompts
  - Marketplace de plugins
  - Integración con CRM (Salesforce, HubSpot)

#### 14.3 Visión a Largo Plazo
- Convertirse en el estándar de gestión de prompts empresarial
- Comunidad de 100,000+ usuarios activos
- Marketplace con $1M+ en transacciones mensuales
- Certificación oficial de Prompt Engineering

---

### 15. CASOS DE USO

#### 15.1 Marketing y Contenido
- Generación de copys publicitarios
- Creación de contenido para redes sociales
- Email marketing personalizado
- Blogs y artículos SEO
- Descripciones de productos

#### 15.2 Desarrollo y Tech
- Generación de código
- Documentación técnica
- Tests automatizados
- Code reviews con IA
- Debugging asistido

#### 15.3 Atención al Cliente
- Respuestas automáticas
- Chatbots inteligentes
- Clasificación de tickets
- Análisis de feedback
- FAQs dinámicas

#### 15.4 Educación
- Creación de material didáctico
- Evaluaciones personalizadas
- Tutorías con IA
- Traducciones de contenido
- Resúmenes de textos

#### 15.5 E-commerce
- Descripciones de productos
- Generación de imágenes de productos
- Recomendaciones personalizadas
- Análisis de reviews
- Contenido para landing pages

---

## 🎨 ELEMENTOS VISUALES SUGERIDOS PARA LANDING

### Hero Section
- Screenshot del dashboard principal
- Vídeo demo de 30 segundos
- Logos de empresas que usan la plataforma
- Badges de seguridad y compliance

### Features Section
- GIFs animados de cada feature principal
- Comparativa antes/después con el motor de mejora
- Comparación de costos vs usar APIs directamente
- Dashboard de analytics con datos reales (anonymizados)

### Social Proof
- Testimonios con fotos reales
- Casos de éxito con métricas
- Reviews de G2, Capterra, ProductHunt
- Video testimonios de usuarios

### Pricing Section
- Calculadora de ROI
- Comparativa de planes side-by-side
- FAQs de precios
- Guarantee/refund badge

### CTAs
- "Empezar gratis - Sin tarjeta"
- "Ver demo en vivo"
- "Hablar con ventas"
- "Descargar guía PDF"

---

## 📊 DATOS Y MÉTRICAS PARA DESTACAR

### Métricas de Producto
- 10 modelos LLM soportados
- 20 subcategorías de prompts
- 99.9% uptime garantizado
- <200ms tiempo de respuesta API
- 50+ integraciones disponibles

### Métricas de Negocio
- X empresas confían en PromptHub
- X prompts ejecutados al mes
- X$ ahorrados en costos de API
- X horas ahorradas en gestión de prompts
- X usuarios activos

### Diferenciadores
- Único con marketplace integrado
- Único con soporte para vídeo prompts
- Único con motor de mejora con IA
- Único con descuentos por suscripción en marketplace
- Único con self-hosting incluido

---

## 🔍 SEO Y PALABRAS CLAVE

### Keywords Principales
- prompt management
- AI prompt library
- LLM management platform
- prompt engineering tool
- AI prompt marketplace
- multi-model AI platform
- ChatGPT alternative
- prompt optimization
- AI cost management
- enterprise prompt platform

### Long-tail Keywords
- how to manage AI prompts for teams
- best prompt engineering tools for business
- compare multiple AI models side by side
- reduce AI API costs for startups
- sell AI prompts online marketplace
- self-hosted prompt management
- GDPR compliant AI platform
- AI prompt version control
- ChatGPT for enterprise teams
- optimize OpenAI API usage

---

## 💡 MENSAJES CLAVE PARA LA LANDING

### Headline Principal
"La Plataforma Definitiva para Gestionar, Optimizar y Monetizar tus Prompts de IA"

### Sub-headlines
- "Centraliza todos tus modelos de IA en un solo lugar"
- "Ahorra hasta un 60% en costos de API con nuestra optimización inteligente"
- "De prompts simples a revenue: vende tus mejores prompts en nuestro marketplace"
- "Trusted by 1,000+ companies to power their AI workflows"

### Beneficios vs Features
- ❌ "Soporte para 10 modelos" 
- ✅ "Cambia de modelo sin reescribir prompts - ahorra semanas de trabajo"

- ❌ "Dashboard de analytics"
- ✅ "Descubre qué prompts generan más ROI y duplica tu eficiencia"

- ❌ "Sistema de versionado"
- ✅ "Nunca pierdas un prompt que funcionó - rollback en un clic"

---

Este documento contiene todas las especificaciones detalladas del sistema para crear una landing page completa y efectiva. Cada sección puede expandirse en la landing con imágenes, demos interactivas y pruebas sociales.
