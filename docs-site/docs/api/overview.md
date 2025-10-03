---
sidebar_position: 1
---

# API de PromptHub v2

La API de PromptHub te permite integrar la gestión de prompts de IA directamente en tus aplicaciones.

## 📋 Descripción General

La API REST de PromptHub proporciona acceso programático a:

- ✅ **Ejecutar prompts** con diferentes modelos de IA
- ✅ **Crear y gestionar prompts** en tu biblioteca
- ✅ **Obtener analytics** y métricas de uso
- ✅ **Optimizar prompts** automáticamente
- ✅ **Traducir prompts** entre idiomas
- ✅ **Gestionar usuarios y equipos**

## 🔑 Requisitos

### Plan PRO o Superior

La API está disponible para usuarios con plan:
- ✅ **PRO** ($19/mes)
- ✅ **Business** ($49/mes)
- ✅ **Plus** ($99/mes)

### API Key

Necesitas una API Key válida. Obtén la tuya en:
1. **Perfil** → **API Keys** → **Generar Nueva Key**

:::warning Seguridad
Nunca compartas tu API Key. Guárdala de forma segura como una variable de entorno.
:::

## 🌐 Base URL

```
https://api.prompthub.com/v1
```

## 🔐 Autenticación

Todas las peticiones requieren autenticación mediante Bearer Token:

```bash
curl -H "Authorization: Bearer TU_API_KEY" \
  https://api.prompthub.com/v1/prompts
```

### Headers Requeridos

```http
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

## 🚀 Quick Start

### 1. Ejecutar un Prompt

```bash
curl -X POST https://api.prompthub.com/v1/execute \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt_id": "prompt-uuid",
    "variables": {
      "product": "Nike Air Max",
      "features": "Air cushioning, rubber sole"
    },
    "model": "gpt-4",
    "provider": "openai"
  }'
```

### Respuesta

```json
{
  "success": true,
  "data": {
    "result": "Elevate your training to the next level! Nike Air Max...",
    "tokens_used": 245,
    "cost": 0.00735,
    "latency": 1.8,
    "model": "gpt-4",
    "provider": "openai"
  }
}
```

### 2. Obtener Lista de Prompts

```bash
curl https://api.prompthub.com/v1/prompts \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Respuesta

```json
{
  "success": true,
  "data": [
    {
      "id": "prompt-uuid-1",
      "title": "Generador de Descripciones",
      "category": "Marketing",
      "type": "text",
      "content_es": "Actúa como experto en copywriting...",
      "content_en": "Act as a copywriting expert...",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

## 📚 Endpoints Disponibles

### Prompts

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/prompts` | Listar todos los prompts |
| GET | `/prompts/:id` | Obtener un prompt específico |
| POST | `/prompts` | Crear nuevo prompt |
| PUT | `/prompts/:id` | Actualizar prompt |
| DELETE | `/prompts/:id` | Eliminar prompt |

### Ejecución

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/execute` | Ejecutar un prompt |
| GET | `/executions` | Historial de ejecuciones |
| GET | `/executions/:id` | Detalles de una ejecución |

### Optimización

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/improve` | Mejorar un prompt con IA |
| POST | `/translate` | Traducir prompt |

### Analytics

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/analytics/usage` | Uso de tokens |
| GET | `/analytics/prompts` | Estadísticas de prompts |

Ver [Referencia completa de endpoints](/docs/api/endpoints/prompts) →

## ⚡ Rate Limits

### Límites por Plan

| Plan | Requests/min | Requests/día |
|------|-------------|--------------|
| PRO | 60 | 5,000 |
| Business | 120 | 15,000 |
| Plus | 300 | 50,000 |

### Headers de Rate Limit

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640000000
```

Ver [Documentación de Rate Limits](/docs/api/rate-limits) →

## ❌ Manejo de Errores

### Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

### Formato de Error

```json
{
  "success": false,
  "error": {
    "code": "INVALID_API_KEY",
    "message": "La API Key proporcionada no es válida",
    "details": {
      "field": "authorization",
      "reason": "token_expired"
    }
  }
}
```

Ver [Códigos de error completos](/docs/api/errors) →

## 🔔 Webhooks

Recibe notificaciones en tiempo real cuando:
- Se ejecuta un prompt
- Se alcanza un límite de tokens
- Se completa una optimización

Ver [Documentación de Webhooks](/docs/api/webhooks) →

## 📖 Ejemplos por Lenguaje

Consulta ejemplos completos en tu lenguaje favorito:

- [Node.js / JavaScript](/docs/api/examples/node)
- [Python](/docs/api/examples/python)
- [PHP](/docs/api/examples/php)
- [cURL](/docs/api/examples/curl)

## 💡 SDKs Oficiales

```bash
# JavaScript/TypeScript
npm install @prompthub/sdk

# Python
pip install prompthub

# PHP
composer require prompthub/sdk
```

## 🛠️ Herramientas

### Postman Collection

Importa nuestra colección de Postman para probar la API fácilmente:

[Descargar Collection](https://www.postman.com/prompthub/api) →

### API Playground

Prueba endpoints directamente desde tu navegador:

[Abrir Playground](https://prompthub.com/api/playground) →

## 📞 Soporte

¿Tienes preguntas sobre la API?

- 📧 Email: [api@prompthub.com](mailto:api@prompthub.com)
- 💬 Discord: [Únete a la comunidad](https://discord.gg/prompthub)
- 📖 Docs: Estás aquí

## 🗺️ Roadmap

Próximas características:

- ✅ WebSocket API para streaming
- ✅ GraphQL endpoint
- ✅ Batch execution
- ✅ Custom models support