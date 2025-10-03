# Supabase Database Files

Este directorio contiene todos los archivos SQL para la base de datos de PromptHub v2.

## 📁 Estructura

### `/migrations/`
Archivos de migración de base de datos en orden cronológico:

1. **001_initial_schema.sql** - Schema completo base
   - Todas las tablas principales
   - Índices y constraints
   - Triggers y funciones
   - Para instalaciones nuevas

2. **002_categories_models.sql** - Sistema de categorías y modelos
   - Tabla de subcategorías
   - Proveedores de IA (Google Gemini, DeepSeek)
   - 10 modelos LLM configurados
   - 20 subcategorías especializadas

3. **003_marketplace_support.sql** - Marketplace y soporte
   - Sistema de compra/venta de prompts
   - Descuentos por plan
   - Sistema de tickets de soporte
   - Triggers automáticos

### `/seeds/`
Datos iniciales para la base de datos:

1. **001_initial_data.sql** - Datos esenciales
   - 3 categorías principales (Texto, Imagen, Vídeo)
   - 20 subcategorías
   - 5 proveedores de IA
   - 10 modelos LLM con precios
   - 4 planes de suscripción

## 🚀 Uso

### Instalación Nueva
Para una instalación completamente nueva:

```bash
# 1. Crear base de datos
psql -U postgres -c "CREATE DATABASE prompthub;"

# 2. Ejecutar migraciones en orden
psql -U postgres -d prompthub -f migrations/001_initial_schema.sql

# 3. Insertar datos iniciales
psql -U postgres -d prompthub -f seeds/001_initial_data.sql
```

### Migración desde Versión Anterior
Si ya tienes PromptHub instalado:

```bash
# Aplicar solo las migraciones que necesites
psql -U prompthub prompthub -f migrations/002_categories_models.sql
psql -U prompthub prompthub -f migrations/003_marketplace_support.sql
```

## ⚠️ Importante

- Los archivos de migración deben ejecutarse en orden
- Usa transacciones para poder revertir en caso de error
- Haz backup antes de aplicar migraciones en producción
- Los archivos de seeds son opcionales y pueden ejecutarse múltiples veces (usan `ON CONFLICT`)

## 🔗 Más Información

Ver la guía completa de instalación en `docs-project/selfhost-guide.md`
