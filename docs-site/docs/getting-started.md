---
sidebar_position: 2
---

# Guía de Inicio Rápido

Comienza a usar PromptHub v2 en menos de 5 minutos.

## 1. Crear tu Cuenta

1. Ve a [prompthub.com](/)
2. Haz clic en **"Empezar Gratis - 14 Días"**
3. Ingresa tu email y contraseña
4. Verifica tu email

¡Listo! Tienes 14 días de prueba con todas las funcionalidades PRO.

## 2. Crear tu Primer Prompt

### Desde la Interfaz

1. Click en **"+ Nuevo Prompt"** en el header
2. Completa la información:
   - **Título**: Nombre descriptivo de tu prompt
   - **Categoría**: Clasifica tu prompt (Marketing, Desarrollo, etc.)
   - **Tipo**: Texto, Imagen o Video
   - **Contenido**: Escribe tu prompt en español o inglés

```markdown
Ejemplo de prompt:

**Título**: Generador de Descripciones de Producto
**Categoría**: Marketing
**Tipo**: Texto
**Contenido**: 
Actúa como un experto en copywriting. Genera una descripción 
persuasiva para un producto de ecommerce. El producto es: {producto}

Características principales: {características}

La descripción debe:
- Ser persuasiva y orientada a conversión
- Resaltar beneficios sobre características
- Incluir call-to-action
- Máximo 150 palabras
```

3. Click en **"Guardar"**

## 3. Probar tu Prompt en el Playground

1. Selecciona tu prompt de la biblioteca
2. Click en **"Probar en Playground"**
3. Selecciona el modelo de IA:
   - GPT-4 (Mejor calidad)
   - GPT-3.5 (Más rápido y económico)
   - Claude 3 (Excelente para análisis)
   - Gemini Pro (Bueno para contenido largo)

4. Completa las variables (si las hay):
   ```
   {producto}: "Zapatillas deportivas Nike Air Max"
   {características}: "Amortiguación Air, suela de goma, diseño moderno"
   ```

5. Click en **"Ejecutar"**

### Resultado

```
¡Eleva tu entrenamiento al siguiente nivel! Las Nike Air Max 
combinan tecnología de amortiguación avanzada con un diseño 
moderno que no pasa desapercibido. Su suela de goma proporciona
tracción superior mientras que el sistema Air absorbe cada impacto.

No son solo zapatillas, son tu ventaja competitiva.
¿Listo para sentir la diferencia? Consíguelas ahora →
```

## 4. Optimizar tu Prompt

PromptHub puede mejorar automáticamente tus prompts:

1. Click en el botón **"Mejorar con IA"** (icono de estrella)
2. El sistema analiza y optimiza tu prompt
3. Revisa las sugerencias
4. Guarda la versión mejorada

### Antes vs Después

**Antes:**
```
Crea una descripción del producto {producto}
```

**Después (Optimizado):**
```
Actúa como un experto en copywriting de ecommerce con 10 años de experiencia.

Producto: {producto}
Características: {características}
Público objetivo: {publico}

Genera una descripción persuasiva que:
1. Destaque los beneficios principales (no solo características)
2. Use lenguaje emocional y orientado a acción
3. Incluya social proof si es relevante
4. Termine con un call-to-action claro
5. Sea concisa (100-150 palabras)

Formato: Párrafo único, tono conversacional.
```

## 5. Usar la API (Usuarios PRO)

### Obtener tu API Key

1. Ve a tu **Perfil** (esquina superior derecha)
2. Sección **"API Keys"**
3. Click en **"Generar Nueva API Key"**
4. Copia y guarda tu clave de forma segura

### Ejecutar un Prompt

```javascript
const response = await fetch('https://api.prompthub.com/v1/execute', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt_id: 'tu-prompt-id',
    variables: {
      producto: 'Zapatillas Nike Air Max',
      características: 'Amortiguación Air, suela de goma'
    },
    model: 'gpt-4',
    provider: 'openai'
  })
});

const data = await response.json();
console.log(data.result);
```

Ver [Documentación completa de API](/docs/api/overview) →

## 6. Gestionar Tokens

### Ver tu Uso

En el **Dashboard** puedes ver:
- Tokens usados hoy
- Tokens restantes en tu plan
- Gráfico de uso histórico
- Costo estimado

### Comprar Tokens Adicionales

Si necesitas más tokens:

1. Ve a **"Tokens"** en el menú
2. Selecciona un paquete:
   - 100K tokens → $10
   - 500K tokens → $45 (10% descuento)
   - 1M tokens → $80 (20% descuento)
3. Paga con tarjeta (Stripe)
4. Tokens disponibles inmediatamente

## 7. Colaborar en Equipo (Business/Plus)

### Invitar Miembros

1. Ve a **"Equipo"** en configuración
2. Click en **"Invitar Miembro"**
3. Ingresa el email
4. Selecciona el rol:
   - **Admin**: Control total
   - **Editor**: Crear/editar prompts
   - **Viewer**: Solo lectura

### Descuentos Multi-tenant

- 2-19 usuarios: **10% descuento**
- 20+ usuarios: **20% descuento**

¡Los descuentos se aplican automáticamente!

## 8. Mejores Prácticas

✅ **Sé específico**: Cuanto más detallado sea tu prompt, mejores resultados
✅ **Usa variables**: Reutiliza prompts con diferentes inputs
✅ **Versiona**: Guarda versiones cuando hagas cambios importantes
✅ **Prueba modelos**: Diferentes modelos para diferentes tareas
✅ **Revisa analytics**: Aprende qué prompts funcionan mejor

## 🎯 Próximos Pasos

- [Ver todas las guías](/docs/category/guías)
- [Explorar características avanzadas](/docs/category/características)
- [Leer mejores prácticas](/docs/best-practices)
- [Configurar integraciones](/docs/api/overview)

## 💬 ¿Necesitas Ayuda?

- 📖 [Centro de ayuda](/docs/intro)
- 📧 [Soporte: support@prompthub.com](mailto:support@prompthub.com)
- 💬 Chat en vivo (disponible en la app)