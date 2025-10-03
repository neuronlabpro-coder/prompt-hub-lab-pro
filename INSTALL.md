# PromptHub v2 - Guía de Instalación y Despliegue

Esta guía completa te ayudará a instalar, configurar, hacer backup y desplegar PromptHub v2 en cualquier servidor.

## 📋 Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Instalación Local](#instalación-local)
- [Configuración de Base de Datos](#configuración-de-base-de-datos)
- [Variables de Entorno](#variables-de-entorno)
- [Backup y Restauración](#backup-y-restauración)
- [Despliegue en Producción](#despliegue-en-producción)
- [Docker](#docker)
- [Migración desde Otro Servidor](#migración-desde-otro-servidor)
- [Troubleshooting](#troubleshooting)

## 🔧 Requisitos Previos

### Software Necesario

- **Node.js**: v18+ o v20+ (recomendado)
- **npm**: v9+ o **pnpm** v8+ (más rápido)
- **PostgreSQL**: v14+ (o cuenta de Supabase)
- **Git**: Para clonar el repositorio

### Cuentas Necesarias

- **Supabase** (gratuito): Para auth y base de datos
- **OpenAI** (opcional): Para funcionalidades de IA
- **Stripe** (opcional): Para pagos
- **Replit** (opcional): Para despliegue rápido

## 🚀 Instalación Local

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/prompthub-v2.git
cd prompthub-v2
```

### 2. Instalar Dependencias

```bash
# Con npm
npm install

# O con pnpm (más rápido)
pnpm install
```

### 3. Configurar Variables de Entorno

Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales (ver sección [Variables de Entorno](#variables-de-entorno)).

### 4. Iniciar la Aplicación

```bash
# Modo desarrollo
npm run dev

# La aplicación estará disponible en:
# http://localhost:5000
```

## 🗄️ Configuración de Base de Datos

### Opción A: Supabase (Recomendado)

#### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Click en "New Project"
3. Completa:
   - **Name**: prompthub-v2
   - **Database Password**: (genera una segura)
   - **Region**: Más cercana a tus usuarios
4. Espera ~2 minutos mientras se crea

#### 2. Obtener Credenciales

En tu proyecto Supabase:
- Settings → API
- Copia:
  - `Project URL` → `VITE_SUPABASE_URL`
  - `anon public` → `VITE_SUPABASE_ANON_KEY`

#### 3. Ejecutar Migraciones

```bash
cd supabase

# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link a tu proyecto
supabase link --project-ref tu-project-ref

# Ejecutar migraciones
supabase db push

# Configurar secrets para functions
supabase secrets set OPENAI_API_KEY=tu-key
supabase secrets set OPENROUTER_API_KEY=tu-key
```

### Opción B: PostgreSQL Local

#### 1. Instalar PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS con Homebrew
brew install postgresql@14
brew services start postgresql@14

# Windows
# Descarga desde https://www.postgresql.org/download/windows/
```

#### 2. Crear Base de Datos

```bash
# Conectar a PostgreSQL
psql postgres

# Crear base de datos
CREATE DATABASE prompthub;

# Crear usuario
CREATE USER prompthub_user WITH ENCRYPTED PASSWORD 'tu_password_segura';

# Otorgar privilegios
GRANT ALL PRIVILEGES ON DATABASE prompthub TO prompthub_user;

# Salir
\q
```

#### 3. Ejecutar Migraciones

```bash
# Configurar DATABASE_URL en .env
DATABASE_URL=postgresql://prompthub_user:tu_password@localhost:5432/prompthub

# Ejecutar migraciones SQL
psql -U prompthub_user -d prompthub -f supabase/migrations/*.sql
```

## 🔐 Variables de Entorno

### Archivo `.env` Completo

```bash
# ===================
# DATABASE
# ===================
DATABASE_URL=postgresql://user:password@host:5432/database
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-publica

# ===================
# API KEYS (Backend only - NUNCA exponer)
# ===================
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=sk-or-...
REPLICATE_API_KEY=r8_...

# ===================
# STRIPE (Opcional)
# ===================
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ===================
# APPLICATION
# ===================
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5000

# ===================
# SUPABASE SERVICE ROLE (Solo para admin scripts)
# ===================
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### Obtener API Keys

#### OpenAI
1. [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. "Create new secret key"
3. Copia y guarda

#### Anthropic (Claude)
1. [console.anthropic.com](https://console.anthropic.com)
2. "API Keys" → "Create Key"

#### OpenRouter
1. [openrouter.ai/keys](https://openrouter.ai/keys)
2. "Create API Key"

#### Stripe
1. [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
2. Copia "Publishable key" y "Secret key"

## 💾 Backup y Restauración

### Backup Automático (Recomendado)

#### Script de Backup

Crea `scripts/backup.sh`:

```bash
#!/bin/bash

# Configuración
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="prompthub"

# Crear directorio de backups
mkdir -p $BACKUP_DIR

# Backup de Base de Datos
echo "🗄️  Haciendo backup de base de datos..."
pg_dump $DATABASE_URL > "$BACKUP_DIR/db_$DATE.sql"

# Backup de Archivos
echo "📁 Haciendo backup de archivos..."
tar -czf "$BACKUP_DIR/files_$DATE.tar.gz" \
  .env \
  attached_assets/ \
  docs/ \
  --exclude=node_modules

# Limpiar backups antiguos (mantener últimos 30 días)
find $BACKUP_DIR -type f -mtime +30 -delete

echo "✅ Backup completado: $BACKUP_DIR"
echo "   - Base de datos: db_$DATE.sql"
echo "   - Archivos: files_$DATE.tar.gz"
```

Hacer ejecutable:

```bash
chmod +x scripts/backup.sh
```

Ejecutar:

```bash
./scripts/backup.sh
```

#### Configurar Cron (Backup Diario)

```bash
# Editar crontab
crontab -e

# Agregar backup diario a las 2 AM
0 2 * * * cd /ruta/a/prompthub-v2 && ./scripts/backup.sh
```

### Backup Manual

#### Base de Datos

```bash
# Supabase (usando CLI)
supabase db dump -f backup.sql

# PostgreSQL local
pg_dump -U prompthub_user prompthub > backup_$(date +%Y%m%d).sql

# Con compresión
pg_dump -U prompthub_user prompthub | gzip > backup_$(date +%Y%m%d).sql.gz
```

#### Archivos

```bash
# Backup completo
tar -czf backup_full_$(date +%Y%m%d).tar.gz \
  . \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=dist

# Solo archivos esenciales
tar -czf backup_essential_$(date +%Y%m%d).tar.gz \
  .env \
  attached_assets/ \
  docs/ \
  supabase/
```

### Restauración

#### Base de Datos

```bash
# Desde SQL dump
psql -U prompthub_user prompthub < backup.sql

# Desde SQL comprimido
gunzip -c backup.sql.gz | psql -U prompthub_user prompthub

# Supabase
supabase db reset
psql $DATABASE_URL < backup.sql
```

#### Archivos

```bash
# Extraer backup
tar -xzf backup_full_20240115.tar.gz

# Restaurar solo archivos específicos
tar -xzf backup.tar.gz attached_assets/
```

## 🚀 Despliegue en Producción

### Opción 1: Replit (Más Fácil)

1. **Fork el Repl** o importa desde GitHub
2. **Configura Secrets**:
   - Secrets tab → Add each variable
3. **Run**:
   - Click "Run" button
4. **Dominio**:
   - Gratis: `tu-repl.replit.app`
   - Custom: Configura en "Webview" tab

### Opción 2: Vercel + Supabase

#### 1. Preparar para Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login
```

#### 2. Configurar `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ]
}
```

#### 3. Desplegar

```bash
# Primera vez
vercel

# Producción
vercel --prod
```

#### 4. Configurar Variables de Entorno

```bash
# O en el dashboard de Vercel
vercel env add OPENAI_API_KEY
vercel env add DATABASE_URL
# ... etc
```

### Opción 3: VPS (DigitalOcean, AWS, etc.)

#### 1. Preparar Servidor

```bash
# Conectar por SSH
ssh root@tu-servidor.com

# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2 (gestor de procesos)
sudo npm install -g pm2

# Instalar Nginx (proxy reverso)
sudo apt install -y nginx

# Instalar PostgreSQL (opcional, si no usas Supabase)
sudo apt install -y postgresql postgresql-contrib
```

#### 2. Clonar y Configurar

```bash
# Crear usuario para la app
sudo adduser prompthub
sudo su - prompthub

# Clonar repositorio
git clone https://github.com/tu-usuario/prompthub-v2.git
cd prompthub-v2

# Instalar dependencias
npm install --production

# Configurar .env
nano .env
# (pega tus variables de entorno)

# Build
npm run build
```

#### 3. Configurar PM2

```bash
# Iniciar aplicación
pm2 start server/index.js --name prompthub

# Auto-start en reinicio del servidor
pm2 startup
pm2 save

# Ver logs
pm2 logs prompthub

# Monitorear
pm2 monit
```

#### 4. Configurar Nginx

```bash
# Editar configuración
sudo nano /etc/nginx/sites-available/prompthub

# Agregar:
```

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Activar sitio
sudo ln -s /etc/nginx/sites-available/prompthub /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

#### 5. Configurar HTTPS con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Auto-renovación (ya configurado automáticamente)
```

### Opción 4: Docker

#### Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Build frontend
RUN npm run build

# Exponer puerto
EXPOSE 5000

# Comando de inicio
CMD ["node", "server/index.js"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=prompthub
      - POSTGRES_USER=prompthub
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

#### Comandos Docker

```bash
# Build
docker-compose build

# Iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down

# Backup de base de datos
docker-compose exec db pg_dump -U prompthub prompthub > backup.sql

# Restaurar
docker-compose exec -T db psql -U prompthub prompthub < backup.sql
```

## 🔄 Migración desde Otro Servidor

### 1. Backup del Servidor Antiguo

```bash
# En servidor antiguo
./scripts/backup.sh

# Descargar backups
scp user@old-server:/path/to/backups/*.gz ./migration/
```

### 2. Configurar Nuevo Servidor

Sigue las instrucciones de [Despliegue en Producción](#despliegue-en-producción).

### 3. Restaurar Datos

```bash
# Extraer archivos
cd migration
tar -xzf files_*.tar.gz

# Restaurar base de datos
gunzip -c db_*.sql.gz | psql $DATABASE_URL

# Copiar archivos
cp -r attached_assets/ /ruta/al/nuevo/servidor/
cp .env /ruta/al/nuevo/servidor/
```

### 4. Verificar y Probar

```bash
# Iniciar aplicación
npm run dev

# Verificar:
# - Usuarios pueden login
# - Prompts se cargan correctamente
# - Assets se ven bien
# - APIs funcionan
```

### 5. Actualizar DNS

```bash
# Cambiar registro A de tu dominio
# De: old-server-ip
# A: new-server-ip

# Esperar propagación DNS (hasta 48h)
```

## 🐛 Troubleshooting

### Error: "Cannot connect to database"

```bash
# Verificar que PostgreSQL está corriendo
sudo systemctl status postgresql

# Verificar credenciales
psql $DATABASE_URL

# Ver logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Error: "Port 5000 already in use"

```bash
# Ver qué proceso usa el puerto
lsof -i :5000

# Matar proceso
kill -9 PID

# O cambiar puerto en .env
PORT=5001
```

### Error: "Module not found"

```bash
# Limpiar e instalar
rm -rf node_modules package-lock.json
npm install
```

### Error: "Build failed"

```bash
# Limpiar cache
rm -rf dist .vite

# Build de nuevo
npm run build
```

### Performance Issues

```bash
# Verificar memoria
free -h

# Ver uso de CPU
top

# Logs de PM2
pm2 logs --lines 100

# Restart app
pm2 restart prompthub
```

## 📚 Recursos Adicionales

- [Documentación oficial](/docs)
- [API Reference](/docs/api/overview)
- [Supabase Docs](https://supabase.com/docs)
- [Deployment Guides](https://docs.replit.com/hosting/deployments)

## 💬 Soporte

¿Problemas con la instalación?

- 📧 Email: [support@prompthub.com](mailto:support@prompthub.com)
- 💬 Discord: [Comunidad PromptHub](https://discord.gg/prompthub)
- 📖 Docs: [prompthub.com/docs](/docs)

---

**¡Felicidades!** 🎉 Tu instalación de PromptHub v2 está completa.

Próximos pasos:
1. [Crear usuario superadmin](/docs/CREATE_SUPERADMIN.md)
2. [Configurar planes y precios](/docs/admin/overview)
3. [Invitar a tu equipo](/docs/guides/team-collaboration)