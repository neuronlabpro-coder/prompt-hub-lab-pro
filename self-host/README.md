# PromptHub v2 - Self-Host

Instalación completa de PromptHub v2 para despliegue self-hosted en tu propio servidor.

## 📋 Contenido

Este directorio contiene todo lo necesario para instalar PromptHub v2:

- **schema.sql**: Schema completo de base de datos
- **seed.sql**: Datos de ejemplo (usuarios, prompts, categorías)
- **install.sh**: Script automatizado de instalación
- **docker-compose.yml**: Configuración para Docker
- **Dockerfile**: Imagen de Docker optimizada
- **README.md**: Este archivo

## 🚀 Instalación Rápida

### Opción 1: Script Automatizado (Recomendado)

```bash
cd self-host
chmod +x install.sh
./install.sh
```

El script te guiará paso a paso y configurará todo automáticamente.

### Opción 2: Docker Compose

```bash
cd self-host

# Crear archivo .env
cp ../.env.example .env
# Editar .env con tus credenciales

# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# La aplicación estará en:
# http://localhost:5000
```

### Opción 3: Manual

```bash
cd self-host

# 1. Crear base de datos
psql -U postgres -c "CREATE DATABASE prompthub;"

# 2. Ejecutar migraciones
psql -U postgres -d prompthub -f schema.sql
psql -U postgres -d prompthub -f seed.sql

# 3. Volver al directorio principal
cd ..

# 4. Instalar dependencias
npm install

# 5. Configurar .env
cp .env.example .env
nano .env  # Editar con tus credenciales

# 6. Build y ejecutar
npm run build
npm start
```

## 🐳 Despliegue en Coolify

[Coolify](https://coolify.io) es una alternativa self-hosted a Vercel/Netlify.

### 1. Configurar Repositorio

Coolify puede desplegar desde:
- Git repository (GitHub, GitLab, Bitbucket)
- Docker Compose
- Dockerfile

### 2. Método A: Docker Compose

1. **Crear nuevo recurso** en Coolify
2. Seleccionar **"Docker Compose"**
3. Pegar el contenido de `docker-compose.yml`
4. Configurar **variables de entorno**:

```bash
POSTGRES_DB=prompthub
POSTGRES_USER=prompthub
POSTGRES_PASSWORD=tu-password-segura
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=sk-or-...
STRIPE_SECRET_KEY=sk_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_...
```

5. **Deploy** → Coolify descargará imágenes y ejecutará

### 3. Método B: Desde Git Repository

1. **Crear nuevo recurso** → **Git Repository**
2. Conectar tu repositorio
3. Configurar:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node server/index.js`
   - **Port**: `5000`
4. Agregar variables de entorno (igual que arriba)
5. En **Deployment**:
   - Habilitar **"Run migrations"**
   - Comando: `cd self-host && ./install.sh`
6. **Deploy**

### 4. Configurar Base de Datos en Coolify

Si no usas Supabase:

1. **Resources** → **New PostgreSQL**
2. Configurar:
   - Nombre: `prompthub-db`
   - Username: `prompthub`
   - Password: (generada automáticamente)
   - Database: `prompthub`
3. Copiar la **Connection String**
4. En tu aplicación, agregar variable:
   ```
   DATABASE_URL=postgresql://prompthub:password@prompthub-db:5432/prompthub
   ```
5. Ejecutar migraciones:
   - SSH a tu servidor
   - `docker exec -i coolify-prompthub-db psql -U prompthub prompthub < schema.sql`
   - `docker exec -i coolify-prompthub-db psql -U prompthub prompthub < seed.sql`

### 5. Configurar Dominio

1. En Coolify → **Domains**
2. Agregar tu dominio: `prompthub.tudominio.com`
3. Coolify configurará SSL automáticamente con Let's Encrypt
4. En tu DNS, apunta un registro A a la IP de tu servidor Coolify

### 6. Backup Automático en Coolify

1. **Settings** → **Backups**
2. Habilitar backups automáticos
3. Configurar:
   - **Frequency**: Diario
   - **Time**: 02:00 AM
   - **Retention**: 30 días
4. Backup destinations:
   - Local
   - S3 compatible (Backblaze, DigitalOcean Spaces)

## 📊 Datos de Ejemplo

Después de ejecutar `seed.sql`, tendrás:

### Usuarios

| Email | Password | Role | Plan |
|-------|----------|------|------|
| admin@prompthub.com | 1234abcd | superadmin | Plus |
| demo@prompthub.com | 1234abcd | user | PRO |
| editor@prompthub.com | 1234abcd | editor | Business |

⚠️ **IMPORTANTE**: Cambia estas contraseñas en producción.

### Prompts

- **4 prompts de ejemplo** en diferentes categorías
- **5 categorías**: Marketing, Desarrollo, Contenido, Análisis, Educación
- **Estadísticas iniciales** para testing

### Proveedores y Modelos

- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude 3)
- Google (Gemini Pro)
- OpenRouter
- Precios configurados

## ⚙️ Configuración Avanzada

### Variables de Entorno

```bash
# Base de Datos
DATABASE_URL=postgresql://user:pass@host:5432/db
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-key

# API Keys (Backend only)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=sk-or-...

# Stripe
STRIPE_SECRET_KEY=sk_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://tu-dominio.com
```

### Backup Manual

```bash
# Base de datos
docker-compose exec db pg_dump -U prompthub prompthub > backup.sql

# O si usas PostgreSQL local:
pg_dump -U prompthub prompthub > backup_$(date +%Y%m%d).sql

# Archivos
tar -czf backup_files.tar.gz attached_assets/ .env
```

### Restaurar Backup

```bash
# Base de datos
docker-compose exec -T db psql -U prompthub prompthub < backup.sql

# O local:
psql -U prompthub prompthub < backup.sql

# Archivos
tar -xzf backup_files.tar.gz
```

### Monitoreo

Con PM2:
```bash
pm2 start server/index.js --name prompthub
pm2 monit
pm2 logs prompthub
```

Con Docker:
```bash
docker-compose logs -f
docker stats prompthub-app
```

### Actualizar

```bash
# Con Git
git pull origin main
npm install
npm run build
pm2 restart prompthub

# Con Docker
docker-compose pull
docker-compose up -d --build
```

## 🔒 Seguridad

### 1. Cambiar Contraseñas por Defecto

```sql
-- En Supabase Auth o tu base de datos de usuarios
-- Cambia las contraseñas de los usuarios de ejemplo
```

### 2. Configurar Firewall

```bash
# UFW en Ubuntu
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw enable
```

### 3. SSL/TLS

Con Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

Con Coolify, SSL se configura automáticamente.

### 4. Variables de Entorno Seguras

Nunca commites el archivo `.env`. Usa:
- Secrets manager de tu plataforma
- Variables de entorno del sistema
- Vault para secrets (HashiCorp Vault, etc.)

## 🐛 Troubleshooting

### Error: "Cannot connect to database"

```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps
# O
sudo systemctl status postgresql

# Ver logs
docker-compose logs db
```

### Error: "Port 5000 already in use"

```bash
# Ver qué usa el puerto
lsof -i :5000

# Matar proceso
kill -9 PID

# O cambiar puerto en .env
PORT=5001
```

### Error: "Module not found"

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Performance Issues

```bash
# Ver uso de recursos
docker stats

# Reiniciar servicios
docker-compose restart

# Ver logs para errores
docker-compose logs -f
```

## 📚 Recursos

- [Documentación completa](../INSTALL.md)
- [Guía de seguridad](../docs/SECURITY.md)
- [Crear superadmin](../docs/CREATE_SUPERADMIN.md)
- [Coolify Docs](https://coolify.io/docs)

## 💬 Soporte

- 📧 Email: support@prompthub.com
- 💬 WhatsApp: +34623979013
- 📖 Docs: [Ver documentación](../docs)

## 📝 Checklist de Instalación

- [ ] Base de datos creada y migraciones ejecutadas
- [ ] Variables de entorno configuradas
- [ ] Dependencias instaladas
- [ ] Build compilado exitosamente
- [ ] Aplicación corriendo en el puerto configurado
- [ ] Usuarios de ejemplo pueden hacer login
- [ ] API keys configuradas (OpenAI, etc.)
- [ ] Stripe configurado (si aplica)
- [ ] SSL/TLS configurado
- [ ] Backup automático configurado
- [ ] Monitoreo activo
- [ ] Contraseñas por defecto cambiadas

---

**¡Felicidades!** 🎉 Tu instalación self-hosted de PromptHub v2 está lista.

¿Problemas? Contacta a soporte o revisa la documentación completa en `../INSTALL.md`