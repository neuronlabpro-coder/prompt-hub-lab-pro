---
sidebar_position: 2
---

# Autenticación

Aprende cómo autenticar tus peticiones a la API de PromptHub.

## 🔑 API Keys

PromptHub utiliza **API Keys** para autenticar las peticiones. Solo los usuarios con plan PRO o superior pueden generar API Keys.

### Generar una API Key

1. Inicia sesión en [PromptHub](/)
2. Ve a tu **Perfil** (esquina superior derecha)
3. Selecciona la sección **"API Keys"**
4. Click en **"Generar Nueva API Key"**
5. Copia tu API Key

:::danger Importante
La API Key solo se muestra una vez. Guárdala de forma segura. Si la pierdes, deberás generar una nueva.
:::

## 🔐 Usar la API Key

Incluye tu API Key en el header `Authorization` como un Bearer Token:

```http
GET /v1/prompts HTTP/1.1
Host: api.prompthub.com
Authorization: Bearer ph_1234567890abcdef...
Content-Type: application/json
```

### Ejemplos por Lenguaje

#### JavaScript / Node.js

```javascript
const API_KEY = process.env.PROMPTHUB_API_KEY;

const response = await fetch('https://api.prompthub.com/v1/prompts', {
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

#### Python

```python
import os
import requests

API_KEY = os.getenv('PROMPTHUB_API_KEY')

headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://api.prompthub.com/v1/prompts',
    headers=headers
)

data = response.json()
```

#### PHP

```php
<?php
$apiKey = getenv('PROMPTHUB_API_KEY');

$headers = [
    'Authorization: Bearer ' . $apiKey,
    'Content-Type: application/json'
];

$ch = curl_init('https://api.prompthub.com/v1/prompts');
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$data = json_decode($response, true);
?>
```

#### cURL

```bash
curl -X GET https://api.prompthub.com/v1/prompts \
  -H "Authorization: Bearer ph_1234567890abcdef..." \
  -H "Content-Type: application/json"
```

## 🔒 Mejores Prácticas de Seguridad

### 1. Nunca Expongas tu API Key

❌ **NO HAGAS ESTO:**
```javascript
// ¡MAL! Nunca hardcodees la API key
const API_KEY = 'ph_1234567890abcdef...';
```

✅ **HAZ ESTO:**
```javascript
// ✅ BIEN: Usa variables de entorno
const API_KEY = process.env.PROMPTHUB_API_KEY;
```

### 2. No la Incluyas en tu Frontend

Las API Keys deben usarse **solo en el backend**. Nunca las expongas en código del navegador.

❌ **NO:**
```javascript
// ¡PELIGRO! Esto expone tu key al público
fetch('https://api.prompthub.com/v1/prompts', {
  headers: { 'Authorization': `Bearer ph_123...` }
});
```

✅ **SÍ:**
```javascript
// ✅ Llama a tu propio backend que tiene la key
fetch('/api/prompts'); // Tu backend usa la API key de forma segura
```

### 3. Usa Diferentes Keys por Entorno

Genera keys separadas para:
- **Desarrollo**: Para pruebas locales
- **Staging**: Para ambiente de pruebas
- **Producción**: Para tu aplicación en vivo

### 4. Rota tus Keys Regularmente

Genera nuevas API Keys cada 3-6 meses o si sospechas que una key fue comprometida.

### 5. Configura Restricciones

En el futuro podrás configurar:
- Dominios permitidos
- IPs permitidas
- Endpoints específicos
- Rate limits personalizados

## ❌ Errores de Autenticación

### 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "API Key no proporcionada o inválida"
  }
}
```

**Causas comunes:**
- No incluiste el header `Authorization`
- La API Key es incorrecta
- La API Key expiró o fue revocada

### 403 Forbidden

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "No tienes permisos para este recurso"
  }
}
```

**Causas comunes:**
- Intentas acceder a un prompt que no te pertenece
- Tu plan no incluye acceso a este endpoint
- La API Key no tiene los permisos necesarios

## 🔄 Gestionar API Keys

### Listar tus Keys

```bash
GET /v1/api-keys
```

```json
{
  "success": true,
  "data": [
    {
      "id": "key-123",
      "name": "Production Key",
      "prefix": "ph_prod",
      "created_at": "2024-01-15T10:30:00Z",
      "last_used": "2024-01-20T14:22:00Z",
      "expires_at": null
    }
  ]
}
```

### Revocar una Key

```bash
DELETE /v1/api-keys/:id
```

```json
{
  "success": true,
  "message": "API Key revocada exitosamente"
}
```

## 📊 Monitoreo de Uso

Ve el uso de tus API Keys en el Dashboard:
- Requests por día
- Tokens consumidos
- Endpoints más usados
- Errores y latencia

## 🆘 ¿Problemas?

Si tienes problemas de autenticación:

1. Verifica que la API Key sea correcta
2. Asegúrate de incluir el prefijo `Bearer`
3. Revisa que tu plan incluya acceso a la API
4. Contacta a soporte: [api@prompthub.com](mailto:api@prompthub.com)