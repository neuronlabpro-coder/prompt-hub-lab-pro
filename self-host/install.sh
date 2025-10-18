#!/bin/bash

# ============================================
# PromptHub v2 - Script de Instalación
# ============================================
# Este script automatiza la instalación completa
# de PromptHub v2 en un servidor limpio
# ============================================

set -e  # Salir si hay errores

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

# Banner
echo ""
echo "╔═══════════════════════════════════════╗"
echo "║   PromptHub v2 - Instalación Self-Host   ║"
echo "╚═══════════════════════════════════════╝"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "schema.sql" ] || [ ! -f "seed.sql" ]; then
    error "Por favor ejecuta este script desde el directorio self-host/"
fi

# Verificar si es root
if [ "$EUID" -eq 0 ]; then 
    warning "No se recomienda ejecutar como root. Considera crear un usuario específico."
    read -p "¿Continuar de todas formas? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 1. Verificar requisitos previos
info "Verificando requisitos previos..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    error "Node.js no está instalado. Instala Node.js 18+ primero: https://nodejs.org"
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    error "Node.js versión 18+ requerida. Versión actual: $(node -v)"
fi
success "Node.js $(node -v) detectado"

# Verificar npm
if ! command -v npm &> /dev/null; then
    error "npm no está instalado"
fi
success "npm $(npm -v) detectado"

# Verificar PostgreSQL
if ! command -v psql &> /dev/null; then
    warning "psql no detectado. ¿Usarás Supabase o PostgreSQL remoto?"
    read -p "Continuar sin PostgreSQL local? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Instala PostgreSQL o configura Supabase primero"
    fi
else
    success "PostgreSQL detectado"
fi

# 2. Crear directorio de instalación
info "Configurando directorios..."

INSTALL_DIR="${INSTALL_DIR:-$HOME/prompthub-v2}"
info "Directorio de instalación: $INSTALL_DIR"

if [ -d "$INSTALL_DIR" ]; then
    warning "El directorio $INSTALL_DIR ya existe"
    read -p "¿Sobrescribir? ESTO ELIMINARÁ TODOS LOS DATOS (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$INSTALL_DIR"
        success "Directorio eliminado"
    else
        error "Instalación cancelada"
    fi
fi

mkdir -p "$INSTALL_DIR"
cd ..
cp -r . "$INSTALL_DIR/"
cd "$INSTALL_DIR"
success "Archivos copiados a $INSTALL_DIR"

# 3. Configurar base de datos
info "Configurando base de datos..."
echo ""
echo "Opciones de base de datos:"
echo "1) Supabase (recomendado, incluye auth)"
echo "2) PostgreSQL local"
echo "3) PostgreSQL remoto"
echo "4) Ya tengo configurada la base de datos (skip)"
echo ""
read -p "Selecciona una opción (1-4): " DB_OPTION

case $DB_OPTION in
    1)
        info "Configuración de Supabase"
        echo "1. Crea un proyecto en https://supabase.com"
        echo "2. Ve a Project Settings → Database"
        read -p "URL de conexión (postgresql://...): " DATABASE_URL
        read -p "Supabase URL (https://xxx.supabase.co): " SUPABASE_URL
        read -p "Supabase Anon Key: " SUPABASE_ANON_KEY
        
        # Ejecutar migraciones
        info "Ejecutando migraciones..."
        PGPASSWORD="${DATABASE_URL#*:*:}" psql "$DATABASE_URL" < self-host/schema.sql || error "Error al crear schema"
        success "Schema creado"
        
        read -p "¿Cargar datos de ejemplo? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            psql "$DATABASE_URL" < self-host/seed.sql || error "Error al cargar datos"
            success "Datos de ejemplo cargados"
        fi
        ;;
    
    2)
        info "Configuración de PostgreSQL local"
        read -p "Nombre de base de datos [prompthub]: " DB_NAME
        DB_NAME=${DB_NAME:-prompthub}
        read -p "Usuario de base de datos [prompthub]: " DB_USER
        DB_USER=${DB_USER:-prompthub}
        read -sp "Contraseña: " DB_PASS
        echo
        
        # Crear base de datos
        info "Creando base de datos..."
        sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" || warning "Base de datos ya existe"
        sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS';" || warning "Usuario ya existe"
        sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
        
        DATABASE_URL="postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME"
        
        # Ejecutar migraciones
        PGPASSWORD="$DB_PASS" psql -U "$DB_USER" -d "$DB_NAME" < self-host/schema.sql || error "Error al crear schema"
        success "Schema creado"
        
        read -p "¿Cargar datos de ejemplo? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            PGPASSWORD="$DB_PASS" psql -U "$DB_USER" -d "$DB_NAME" < self-host/seed.sql
            success "Datos de ejemplo cargados"
        fi
        ;;
    
    3)
        info "Configuración de PostgreSQL remoto"
        read -p "URL de conexión (postgresql://...): " DATABASE_URL
        
        # Ejecutar migraciones
        psql "$DATABASE_URL" < self-host/schema.sql || error "Error al crear schema"
        success "Schema creado"
        
        read -p "¿Cargar datos de ejemplo? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            psql "$DATABASE_URL" < self-host/seed.sql
            success "Datos de ejemplo cargados"
        fi
        ;;
    
    4)
        info "Skipping database setup"
        read -p "DATABASE_URL: " DATABASE_URL
        ;;
    
    *)
        error "Opción inválida"
        ;;
esac

# 4. Configurar variables de entorno
info "Configurando variables de entorno..."

cat > .env << EOF
# ============================================
# DATABASE
# ============================================
DATABASE_URL=$DATABASE_URL
VITE_SUPABASE_URL=${SUPABASE_URL:-https://your-project.supabase.co}
VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY:-your-anon-key}

# ============================================
# API KEYS (BACKEND ONLY)
# ============================================
OPENAI_API_KEY=your-openai-key-here
ANTHROPIC_API_KEY=your-anthropic-key-here
OPENROUTER_API_KEY=your-openrouter-key-here

# ============================================
# STRIPE (Opcional)
# ============================================
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-key
STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-secret

# ============================================
# APPLICATION
# ============================================
NODE_ENV=production
PORT=5000
FRONTEND_URL=http://localhost:5000

# ============================================
# ADMIN
# ============================================
ADMIN_EMAIL=admin@prompthub.com
EOF

success "Archivo .env creado"
warning "¡IMPORTANTE! Edita el archivo .env y configura tus API keys"

# 5. Instalar dependencias
info "Instalando dependencias de Node.js..."
npm install --production || error "Error al instalar dependencias"
success "Dependencias instaladas"

# 6. Build de la aplicación
info "Compilando aplicación..."
npm run build || error "Error al compilar"
success "Aplicación compilada"

# 7. Configurar PM2 (opcional)
if command -v pm2 &> /dev/null; then
    info "PM2 detectado. ¿Configurar PM2 para auto-start?"
    read -p "(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        pm2 start server/index.js --name prompthub
        pm2 save
        success "PM2 configurado"
        info "Comandos útiles de PM2:"
        echo "  pm2 logs prompthub    - Ver logs"
        echo "  pm2 restart prompthub - Reiniciar"
        echo "  pm2 stop prompthub    - Detener"
    fi
else
    warning "PM2 no detectado. Instálalo para gestión de procesos:"
    echo "  npm install -g pm2"
fi

# 8. Crear script de backup
info "Creando script de backup..."
mkdir -p scripts

cat > scripts/backup.sh << 'EOFBACKUP'
#!/bin/bash
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

echo "🗄️  Backing up database..."
pg_dump $DATABASE_URL > "$BACKUP_DIR/db_$DATE.sql"

echo "📁 Backing up files..."
tar -czf "$BACKUP_DIR/files_$DATE.tar.gz" \
  .env attached_assets/ --exclude=node_modules

find $BACKUP_DIR -type f -mtime +30 -delete
echo "✅ Backup completed: $BACKUP_DIR"
EOFBACKUP

chmod +x scripts/backup.sh
success "Script de backup creado en scripts/backup.sh"

# 9. Resumen final
echo ""
echo "╔═══════════════════════════════════════╗"
echo "║     ✨ Instalación Completada ✨     ║"
echo "╚═══════════════════════════════════════╝"
echo ""
success "PromptHub v2 instalado en: $INSTALL_DIR"
echo ""
info "Próximos pasos:"
echo ""
echo "1. Edita el archivo .env con tus API keys:"
echo "   nano .env"
echo ""
echo "2. Inicia la aplicación:"
echo "   npm run dev          # Modo desarrollo"
echo "   npm start            # Modo producción"
echo "   pm2 start server/index.js --name prompthub  # Con PM2"
echo ""
echo "3. Accede a la aplicación:"
echo "   http://localhost:5000"
echo ""
echo "4. Usuarios de ejemplo (password: 1234abcd):"
echo "   - admin@prompthub.com (superadmin)"
echo "   - demo@prompthub.com (PRO user)"
echo "   - editor@prompthub.com (editor)"
echo ""
echo "5. Configura backup automático:"
echo "   crontab -e"
echo "   0 2 * * * cd $INSTALL_DIR && ./scripts/backup.sh"
echo ""
info "Documentación completa: $INSTALL_DIR/INSTALL.md"
info "Soporte: support@prompthub.com"
echo ""
success "¡Disfruta PromptHub v2! 🚀"
echo ""
