-- ============================================
-- PromptHub v2 - Datos de Ejemplo
-- ============================================
-- Este archivo contiene datos de ejemplo para
-- probar la aplicación después de la instalación
-- ============================================

-- ============================================
-- USUARIOS DE EJEMPLO
-- ============================================
-- Password para todos: 1234abcd
-- IMPORTANTE: Cambiar contraseñas en producción

INSERT INTO users (id, email, name, role, plan, tokens_included, tokens_used) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@prompthub.com', 'Admin PromptHub', 'superadmin', 'plus', 1000000, 5000),
  ('550e8400-e29b-41d4-a716-446655440002', 'demo@prompthub.com', 'Usuario Demo', 'user', 'pro', 100000, 12500),
  ('550e8400-e29b-41d4-a716-446655440003', 'editor@prompthub.com', 'Editor Demo', 'editor', 'business', 250000, 8000)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- CATEGORÍAS
-- ============================================
INSERT INTO categories (id, name_es, name_en, slug, icon, color, description_es, description_en) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'Marketing', 'Marketing', 'marketing', 'Megaphone', '#FF6B6B', 'Prompts para campañas y contenido de marketing', 'Prompts for marketing campaigns and content'),
  ('650e8400-e29b-41d4-a716-446655440002', 'Desarrollo', 'Development', 'development', 'Code', '#4ECDC4', 'Prompts para programación y desarrollo de software', 'Prompts for programming and software development'),
  ('650e8400-e29b-41d4-a716-446655440003', 'Contenido', 'Content', 'content', 'FileText', '#95E1D3', 'Prompts para creación de contenido y copywriting', 'Prompts for content creation and copywriting'),
  ('650e8400-e29b-41d4-a716-446655440004', 'Análisis', 'Analysis', 'analysis', 'BarChart', '#F38181', 'Prompts para análisis de datos y reportes', 'Prompts for data analysis and reporting'),
  ('650e8400-e29b-41d4-a716-446655440005', 'Educación', 'Education', 'education', 'GraduationCap', '#AA96DA', 'Prompts para aprendizaje y enseñanza', 'Prompts for learning and teaching')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PROMPTS DE EJEMPLO
-- ============================================
INSERT INTO prompts (id, user_id, category_id, title, content_es, content_en, type, tags, is_public, is_featured) VALUES
  (
    '750e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    '650e8400-e29b-41d4-a716-446655440001',
    'Generador de Descripciones de Producto',
    'Actúa como un experto en copywriting de ecommerce con 10 años de experiencia.

Producto: {producto}
Características: {caracteristicas}
Público objetivo: {publico}

Genera una descripción persuasiva que:
1. Destaque los beneficios principales (no solo características)
2. Use lenguaje emocional y orientado a acción
3. Incluya social proof si es relevante
4. Termine con un call-to-action claro
5. Sea concisa (100-150 palabras)

Formato: Párrafo único, tono conversacional.',
    'Act as an expert ecommerce copywriter with 10 years of experience.

Product: {product}
Features: {features}
Target audience: {audience}

Generate a persuasive description that:
1. Highlights main benefits (not just features)
2. Uses emotional and action-oriented language
3. Includes social proof if relevant
4. Ends with a clear call-to-action
5. Is concise (100-150 words)

Format: Single paragraph, conversational tone.',
    'text',
    ARRAY['marketing', 'ecommerce', 'copywriting'],
    true,
    true
  ),
  (
    '750e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440002',
    '650e8400-e29b-41d4-a716-446655440002',
    'Revisor de Código Python',
    'Eres un senior developer especializado en Python con experiencia en code review.

Código a revisar:
```python
{codigo}
```

Analiza el código y proporciona:

1. **Errores críticos**: Bugs, problemas de seguridad, memory leaks
2. **Mejores prácticas**: Código no pythonic, patrones anti-pattern
3. **Performance**: Optimizaciones posibles
4. **Legibilidad**: Sugerencias para mejorar claridad
5. **Testing**: Casos de prueba que deberían agregarse

Para cada punto, proporciona:
- El problema específico
- Por qué es un problema
- Cómo solucionarlo (con código ejemplo)

Formato: Markdown con bloques de código.',
    'You are a senior developer specialized in Python with code review experience.

Code to review:
```python
{code}
```

Analyze the code and provide:

1. **Critical errors**: Bugs, security issues, memory leaks
2. **Best practices**: Non-pythonic code, anti-patterns
3. **Performance**: Possible optimizations
4. **Readability**: Suggestions to improve clarity
5. **Testing**: Test cases that should be added

For each point, provide:
- The specific problem
- Why it is a problem
- How to fix it (with code example)

Format: Markdown with code blocks.',
    'text',
    ARRAY['development', 'python', 'code-review'],
    true,
    true
  ),
  (
    '750e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440001',
    '650e8400-e29b-41d4-a716-446655440003',
    'Creador de Posts para LinkedIn',
    'Actúa como un experto en LinkedIn marketing y creación de contenido viral.

Tema: {tema}
Tono: {tono} (profesional, inspirador, educativo, controversia)
Público: {publico}

Crea un post de LinkedIn que:

1. **Hook potente** (primera línea que atrapa atención)
2. **Storytelling**: Usa narrativa personal o caso real
3. **Valor concreto**: Insights accionables, no fluff
4. **Formato visual**: 
   - Líneas cortas
   - Espaciado generoso
   - Emojis estratégicos (máximo 3)
5. **CTA sutil**: Invita a comentar/compartir

Estructura:
- Línea 1: Hook impactante
- Desarrollo: 4-6 líneas con historia/contexto
- Lista: 3-5 puntos clave
- Cierre: Reflexión + pregunta

Longitud: 150-200 palabras
IMPORTANTE: No uses hashtags en el cuerpo, solo al final (máximo 3).',
    'Act as a LinkedIn marketing expert and viral content creator.

Topic: {topic}
Tone: {tone} (professional, inspiring, educational, controversial)
Audience: {audience}

Create a LinkedIn post that:

1. **Powerful hook** (first line that grabs attention)
2. **Storytelling**: Use personal narrative or real case
3. **Concrete value**: Actionable insights, no fluff
4. **Visual format**:
   - Short lines
   - Generous spacing
   - Strategic emojis (max 3)
5. **Subtle CTA**: Invite to comment/share

Structure:
- Line 1: Impactful hook
- Development: 4-6 lines with story/context
- List: 3-5 key points
- Closing: Reflection + question

Length: 150-200 words
IMPORTANT: No hashtags in body, only at end (max 3).',
    'text',
    ARRAY['marketing', 'linkedin', 'social-media'],
    true,
    true
  ),
  (
    '750e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440002',
    '650e8400-e29b-41d4-a716-446655440004',
    'Análisis de Datos con Insights',
    'Eres un data scientist senior especializado en análisis exploratorio y visualización.

Dataset: {descripcion_dataset}
Objetivo: {objetivo_analisis}

Realiza un análisis completo:

1. **Resumen ejecutivo**
   - 3-5 insights clave
   - Recomendaciones de alto nivel

2. **Análisis descriptivo**
   - Estadísticas principales
   - Distribuciones y patrones
   - Outliers y anomalías

3. **Análisis correlacional**
   - Variables relacionadas
   - Fuerza de relaciones
   - Causalidad vs correlación

4. **Segmentación**
   - Clusters identificados
   - Características de cada segmento

5. **Visualizaciones recomendadas**
   - Tipo de gráfico
   - Variables a usar
   - Mensaje clave

6. **Próximos pasos**
   - Análisis adicionales sugeridos
   - Datos que faltan
   - Hipótesis a validar

Formato: Markdown con tablas y listas.',
    'You are a senior data scientist specialized in exploratory analysis and visualization.

Dataset: {dataset_description}
Objective: {analysis_objective}

Perform a complete analysis:

1. **Executive summary**
   - 3-5 key insights
   - High-level recommendations

2. **Descriptive analysis**
   - Main statistics
   - Distributions and patterns
   - Outliers and anomalies

3. **Correlation analysis**
   - Related variables
   - Strength of relationships
   - Causation vs correlation

4. **Segmentation**
   - Identified clusters
   - Characteristics of each segment

5. **Recommended visualizations**
   - Chart type
   - Variables to use
   - Key message

6. **Next steps**
   - Suggested additional analysis
   - Missing data
   - Hypotheses to validate

Format: Markdown with tables and lists.',
    'text',
    ARRAY['analysis', 'data-science', 'insights'],
    true,
    false
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ESTADÍSTICAS DE PROMPTS
-- ============================================
INSERT INTO prompt_stats (prompt_id, views, copies, favorites, executions, tokens_used) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', 1250, 89, 156, 234, 45600),
  ('750e8400-e29b-41d4-a716-446655440002', 890, 67, 123, 178, 38900),
  ('750e8400-e29b-41d4-a716-446655440003', 2100, 145, 289, 456, 78400),
  ('750e8400-e29b-41d4-a716-446655440004', 650, 45, 98, 112, 28700)
ON CONFLICT (prompt_id) DO NOTHING;

-- ============================================
-- PROVEEDORES DE IA
-- ============================================
INSERT INTO providers (id, name, display_name, is_active) VALUES
  ('850e8400-e29b-41d4-a716-446655440001', 'openai', 'OpenAI', true),
  ('850e8400-e29b-41d4-a716-446655440002', 'anthropic', 'Anthropic', true),
  ('850e8400-e29b-41d4-a716-446655440003', 'google', 'Google', true),
  ('850e8400-e29b-41d4-a716-446655440004', 'openrouter', 'OpenRouter', true)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- MODELOS
-- ============================================
INSERT INTO models (id, provider_id, name, display_name, model_id, context_window, max_tokens) VALUES
  ('950e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', 'gpt-4', 'GPT-4', 'gpt-4', 8192, 4096),
  ('950e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440001', 'gpt-3.5-turbo', 'GPT-3.5 Turbo', 'gpt-3.5-turbo', 4096, 2048),
  ('950e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440002', 'claude-3-opus', 'Claude 3 Opus', 'claude-3-opus-20240229', 200000, 4096),
  ('950e8400-e29b-41d4-a716-446655440004', '850e8400-e29b-41d4-a716-446655440003', 'gemini-pro', 'Gemini Pro', 'gemini-pro', 32768, 2048)
ON CONFLICT (provider_id, model_id) DO NOTHING;

-- ============================================
-- PRECIOS DE TOKENS
-- ============================================
INSERT INTO token_prices (model_id, input_price_per_1k, output_price_per_1k) VALUES
  ('950e8400-e29b-41d4-a716-446655440001', 0.03, 0.06),
  ('950e8400-e29b-41d4-a716-446655440002', 0.0015, 0.002),
  ('950e8400-e29b-41d4-a716-446655440003', 0.015, 0.075),
  ('950e8400-e29b-41d4-a716-446655440004', 0.00025, 0.0005)
ON CONFLICT DO NOTHING;

-- ============================================
-- PLANES
-- ============================================
INSERT INTO plans (id, name, display_name, price, tokens_included, storage_mb, max_team_members) VALUES
  ('a50e8400-e29b-41d4-a716-446655440001', 'free', 'Free', 0, 10000, 50, 1),
  ('a50e8400-e29b-41d4-a716-446655440002', 'pro', 'PRO', 19, 100000, 500, 1),
  ('a50e8400-e29b-41d4-a716-446655440003', 'business', 'Business', 49, 250000, 2000, 5),
  ('a50e8400-e29b-41d4-a716-446655440004', 'plus', 'Plus', 99, 1000000, 10000, 20)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- NEWSLETTER (algunos suscriptores de ejemplo)
-- ============================================
INSERT INTO newsletter_subscribers (email, name, source) VALUES
  ('subscriber1@example.com', 'María García', 'landing'),
  ('subscriber2@example.com', 'Juan Pérez', 'blog'),
  ('subscriber3@example.com', 'Ana Martínez', 'landing')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- FIN DE DATOS DE EJEMPLO
-- ============================================

-- NOTA: Recuerda configurar las contraseñas de usuarios en Supabase Auth
-- Los emails de ejemplo son:
-- - admin@prompthub.com (superadmin)
-- - demo@prompthub.com (user PRO)
-- - editor@prompthub.com (editor Business)
-- Password para todos: 1234abcd
