---
slug: mejores-practicas-api-keys
title: Seguridad de API Keys - Guía Completa para Desarrolladores
authors: [prompthub]
tags: [api, seguridad, desarrollo, mejores-prácticas]
---

# Seguridad de API Keys: Guía Completa

Si estás integrando PromptHub (o cualquier API) en tu aplicación, la seguridad de tus API keys debe ser tu prioridad #1.

Hoy compartimos las mejores prácticas que todo desarrollador debe seguir.

<!-- truncate -->

## 🔐 ¿Por qué es Crítico?

Una API key comprometida puede resultar en:

- 💸 **Costos inesperados**: Alguien usa tu key y TÚ pagas la factura
- 🔓 **Acceso a datos**: Pueden leer/modificar tus prompts y datos
- ⚠️ **Abuso del servicio**: Rate limiting, baneos, daño a tu reputación
- 📉 **Pérdida de cliente**: Si tu key se filtra en producción, pierdes confianza

**Caso real:** Una startup dejó su key en GitHub. En 48 horas acumularon $4,200 en cargos fraudulentos.

## ❌ Errores Comunes (NO HAGAS ESTO)

### 1. Hardcodear API Keys

```javascript
// 🚨 ¡PELIGRO! Nunca hagas esto
const API_KEY = 'ph_1234567890abcdef...';

fetch('https://api.prompthub.com/v1/prompts', {
  headers: { 'Authorization': `Bearer ${API_KEY}` }
});
```

**Problema:** Si subes este código a GitHub, tu key es pública. Los bots escanean repos buscando keys cada minuto.

### 2. Exponer Keys en el Frontend

```javascript
// 🚨 ¡NUNCA! Esta key está visible en el navegador
const response = await fetch('https://api.prompthub.com/v1/execute', {
  headers: {
    'Authorization': 'Bearer ph_123...' // Cualquiera puede ver esto
  }
});
```

**Problema:** Todo lo que envías al navegador es público. Inspecciona → Network → Headers → boom, tu key está ahí.

### 3. Commitear .env al Repo

```bash
# 🚨 ¡NO! Nunca agregues .env a git
git add .env
git commit -m "Added config"
```

**Problema:** Aunque luego lo borres, quedará en el historial de Git para siempre.

## ✅ Mejores Prácticas

### 1. Variables de Entorno

```javascript
// ✅ CORRECTO: Usa variables de entorno
const API_KEY = process.env.PROMPTHUB_API_KEY;

if (!API_KEY) {
  throw new Error('PROMPTHUB_API_KEY no configurada');
}
```

### 2. Backend como Proxy

Arquitectura correcta:

```
Frontend (Navegador)
    ↓
Tu Backend (Node.js/Python/PHP)
    ↓ (API Key aquí)
PromptHub API
```

```javascript
// Frontend: Sin API key
const response = await fetch('/api/prompts'); // Tu backend

// Backend: Con API key
app.get('/api/prompts', async (req, res) => {
  const API_KEY = process.env.PROMPTHUB_API_KEY;
  
  const response = await fetch('https://api.prompthub.com/v1/prompts', {
    headers: { 'Authorization': `Bearer ${API_KEY}` }
  });
  
  res.json(await response.json());
});
```

### 3. .gitignore

Siempre:

```bash
# .gitignore
.env
.env.local
.env.production
.env.*.local
```

### 4. Keys Diferentes por Entorno

```bash
# .env.development
PROMPTHUB_API_KEY=ph_dev_123...

# .env.production (NUNCA en git)
PROMPTHUB_API_KEY=ph_prod_456...
```

### 5. Rotación Regular

Genera nuevas keys cada 3-6 meses:

```bash
# Paso 1: Genera nueva key en PromptHub
# Paso 2: Actualiza en producción
export PROMPTHUB_API_KEY=ph_new_key...

# Paso 3: Verifica que funciona
# Paso 4: Revoca la key antigua
```

## 🛡️ Configuración por Plataforma

### Vercel

```bash
# Terminal
vercel env add PROMPTHUB_API_KEY

# O en el dashboard:
Settings → Environment Variables → Add
```

### Netlify

```bash
# netlify.toml
[build.environment]
  # NO pongas keys aquí, usa el dashboard

# Dashboard:
Site settings → Build & deploy → Environment
```

### Heroku

```bash
heroku config:set PROMPTHUB_API_KEY=ph_123...
```

### Replit

```
Secrets tab → Add new secret
Key: PROMPTHUB_API_KEY
Value: ph_123...
```

### Docker

```dockerfile
# docker-compose.yml
services:
  app:
    environment:
      - PROMPTHUB_API_KEY=${PROMPTHUB_API_KEY}
```

```bash
# .env (no committear)
PROMPTHUB_API_KEY=ph_123...
```

## 🚨 Key Comprometida - Protocolo de Respuesta

Si sospechas que tu key se filtró:

### 1. Revoca Inmediatamente
1. Login → Perfil → API Keys
2. Click en "Revocar" en la key comprometida
3. Genera una nueva key

### 2. Revisa el Uso
Dashboard → Analytics → Activity Log
- ¿Requests desde IPs desconocidas?
- ¿Patrones de uso anormales?
- ¿Picos de consumo?

### 3. Actualiza en Producción
```bash
# Actualiza la nueva key en tu servidor
# Reinicia la aplicación
# Verifica que funciona
```

### 4. Investiga
- ¿Dónde se filtró la key?
- ¿Código en GitHub?
- ¿Logs públicos?
- ¿Browser DevTools screenshot?

### 5. Prevén Futuras Filtraciones
- Audita tu código
- Revisa .gitignore
- Educa al equipo
- Implementa code review

## 🔍 Detectar Keys Filtradas

### GitHub Secret Scanning

GitHub te alertará si detecta keys en tu código. Actívalo:

```
Settings → Security → Secret scanning → Enable
```

### Herramientas

```bash
# gitleaks - Escanea tu repo
brew install gitleaks
gitleaks detect

# truffleHog - Busca secrets en historial
trufflehog filesystem /path/to/repo
```

## 📊 Monitoreo de API Keys

En PromptHub Dashboard puedes ver:

- **Last used**: Última vez que se usó
- **Requests today**: Actividad del día
- **Top endpoints**: Qué está usando la key
- **Geographic location**: Desde dónde se usa
- **Error rate**: Si hay problemas

Si ves actividad sospechosa, revoca la key inmediatamente.

## ✅ Checklist de Seguridad

Antes de desplegar a producción:

- [ ] API keys en variables de entorno
- [ ] .env en .gitignore
- [ ] Keys NUNCA en código frontend
- [ ] Backend como proxy para APIs
- [ ] Keys diferentes: dev vs producción
- [ ] Secretos configurados en plataforma (Vercel/Netlify/etc)
- [ ] Code review realizado
- [ ] git log revisado (no hay keys en historial)
- [ ] Monitoreo configurado
- [ ] Plan de respuesta a incidentes documentado

## 🎓 Recursos

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [12-Factor App - Config](https://12factor.net/config)
- [PromptHub Security Docs](/docs/api/authentication)

## 💬 ¿Preguntas?

¿Tienes dudas sobre seguridad de API keys? Contáctanos:

- 📧 security@prompthub.com
- 💬 [Discord Community](https://discord.gg/prompthub)
- 📖 [Documentación completa](/docs/api/authentication)

---

**Recuerda:** Una key comprometida puede costar miles. Invierte 30 minutos ahora en hacerlo bien.

Stay safe! 🔐

**El equipo de PromptHub**