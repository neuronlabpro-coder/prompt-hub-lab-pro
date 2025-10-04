# ⚠️ MIGRACIÓN REQUERIDA - Marketplace No Funcional

## 🚨 Problema Detectado

El **Marketplace NO funciona** porque el schema de Supabase está desactualizado.

### Error:
```
column prompts.price does not exist
```

### Causa:
La tabla `prompts` en Supabase **NO tiene** las columnas necesarias para el marketplace:
- ❌ `price` (precio del prompt)
- ❌ `sales_count` (ventas totales)
- ❌ `is_for_sale` (disponible para venta)
- ❌ `discount_eligible` (elegible para descuentos)
- ❌ `preferred_model_id` (modelo LLM preferido)
- ❌ `subcategory_id` (subcategoría)

## ✅ Solución: Ejecutar Migración

### Paso 1: Abrir Supabase SQL Editor
1. Ve a tu proyecto en https://supabase.com
2. Click en **SQL Editor** (menú izquierdo)
3. Click en **New Query**

### Paso 2: Ejecutar Migración
Copia y pega el contenido de:
```
supabase/migrations/001_add_marketplace_fields.sql
```

### Paso 3: Click "Run" (Ejecutar)

### Paso 4: Verificar
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'prompts' 
ORDER BY ordinal_position;
```

Deberías ver las nuevas columnas: `price`, `sales_count`, `is_for_sale`, etc.

## 📝 Después de la Migración

### Cargar Prompts de Ejemplo
Ejecuta en Supabase SQL Editor:

```sql
-- Crear categorías
INSERT INTO categories (id, name, description, icon, color) VALUES
('seo', 'SEO', 'Optimización para motores de búsqueda', 'Search', '#10b981'),
('copywriting', 'Copywriting', 'Textos persuasivos y ventas', 'FileText', '#3b82f6'),
('social-media', 'Social Media', 'Contenido para redes sociales', 'Share2', '#8b5cf6')
ON CONFLICT (id) DO NOTHING;

-- Crear prompts de ejemplo
INSERT INTO prompts (id, title, content_es, content_en, category, tags, type, is_for_sale, price, discount_eligible) VALUES
('750e8400-e29b-41d4-a716-446655440001', 'Generador de Títulos SEO', 
 'Genera 5 títulos SEO optimizados para un artículo sobre [TEMA]. Los títulos deben ser atractivos, incluir la palabra clave principal y tener menos de 60 caracteres.', 
 'Generate 5 SEO-optimized titles for an article about [TOPIC]. Titles must be engaging, include the main keyword, and be under 60 characters.', 
 'seo', ARRAY['seo', 'titles', 'optimization'], 'user', true, 4.99, true),

('750e8400-e29b-41d4-a716-446655440002', 'Descripción de Producto E-commerce', 
 'Escribe una descripción persuasiva de producto para [PRODUCTO]. Incluye beneficios clave, características únicas y un llamado a la acción. Tono: profesional pero accesible.', 
 'Write a persuasive product description for [PRODUCT]. Include key benefits, unique features, and a call to action. Tone: professional but accessible.', 
 'copywriting', ARRAY['ecommerce', 'product', 'sales'], 'user', true, 5.99, true),

('750e8400-e29b-41d4-a716-446655440003', 'Post para LinkedIn Profesional', 
 'Crea un post profesional para LinkedIn sobre [TEMA]. El tono debe ser profesional pero accesible. Incluye un gancho inicial, 3-5 puntos clave y una pregunta final para engagement.', 
 'Create a professional LinkedIn post about [TOPIC]. Tone should be professional but accessible. Include an opening hook, 3-5 key points, and a final question for engagement.', 
 'social-media', ARRAY['linkedin', 'professional', 'engagement'], 'user', true, 3.99, true)
ON CONFLICT (id) DO NOTHING;
```

## 🔄 Reiniciar Backend
Después de ejecutar la migración:

1. En Replit, reinicia el workflow **"Backend API"**
2. Recarga la página del Marketplace
3. ✅ Deberías ver los 3 prompts con sus precios

## 📊 Estado Actual

- ✅ **Frontend**: Funcionando correctamente
- ✅ **Backend**: Código actualizado para usar precios reales
- ❌ **Database**: Schema desactualizado (ejecutar migración)
- ✅ **Migración**: Creada en `supabase/migrations/001_add_marketplace_fields.sql`

---

## ⏭️ Próximos Pasos

1. ✅ Ejecutar migración SQL en Supabase
2. ✅ Cargar prompts de ejemplo
3. ✅ Reiniciar backend
4. ✅ Verificar marketplace funcional
5. ✅ Continuar con integración Stripe

---

**Fecha:** 4 Oct 2025  
**Issue:** Marketplace mostrando 0,00 € - Schema Supabase desactualizado  
**Fix:** Migración SQL creada y lista para ejecutar
