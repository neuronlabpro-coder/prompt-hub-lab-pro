# Seguridad y Protección de Datos en PromptHub v2

## 📋 Resumen

Este documento describe las medidas de seguridad implementadas en PromptHub v2 para proteger las claves API, secretos y datos sensibles de los usuarios.

## 🔐 Protección de API Keys y Secretos

### 1. Variables de Entorno (Backend)

**Implementación:**
- Todas las API keys se almacenan como variables de entorno en el servidor
- Las claves NUNCA se envían al navegador del cliente
- Las claves se acceden mediante `process.env.VARIABLE_NAME` solo en el backend

**Claves protegidas:**
```
OPENAI_API_KEY
ANTHROPIC_API_KEY
OPENROUTER_API_KEY
REPLICATE_API_KEY
DATABASE_URL
```

**Ubicación en el código:**
- `server/routes/execute.js` - Uso de OpenAI y OpenRouter API keys
- `server/routes/improve.js` - Uso de OpenAI API key
- `server/routes/translate.js` - Uso de OpenAI API key
- `server/db.ts` - Uso de DATABASE_URL

### 2. Variables de Entorno (Frontend)

**Solo se exponen al frontend variables públicas prefijadas con `VITE_`:**
```
VITE_SUPABASE_URL          (público por diseño de Supabase)
VITE_SUPABASE_ANON_KEY     (público por diseño de Supabase)
```

**Nota:** La `anon key` de Supabase está diseñada para ser pública y está protegida por Row Level Security (RLS) en el servidor.

### 3. Panel de Administración

**Seguridad en la UI:**
- Todos los campos de API keys utilizan `type="password"` para ocultar visualmente los valores
- Los valores por defecto se muestran enmascarados: `••••••••••••••••`
- Se incluye `autoComplete="off"` para prevenir autocompletado del navegador
- Banner de advertencia visible explicando que las claves nunca se exponen al cliente

**Archivo:** `src/components/admin/SystemSettings.tsx`

**Características:**
```typescript
<Input
  type="password"
  placeholder="••••••••••••••••••••••••••••••••••••••••"
  autoComplete="off"
  data-testid="input-openai-key"
/>
```

### 4. Manejo de Errores Seguro

**Implementación en `server/index.js`:**
```javascript
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  // Sanitizar mensajes de error para prevenir exposición de claves
  const sanitizedMessage = process.env.NODE_ENV === 'development' 
    ? err.message.replace(/api[_-]?key|token|secret|password/gi, '***REDACTED***')
    : 'Something went wrong';
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: sanitizedMessage
  });
});
```

**Beneficios:**
- Los errores nunca exponen claves API o secretos
- En desarrollo, los valores sensibles se reemplazan por `***REDACTED***`
- En producción, se devuelven mensajes genéricos

## 🛡️ Autenticación y Autorización

### 1. Autenticación de Usuarios

**Sistema:** Supabase Authentication
- Manejo seguro de contraseñas con hashing bcrypt
- Autenticación de dos factores (2FA) con TOTP
- Verificación de email obligatoria
- Tokens de sesión seguros con expiración

### 2. Control de Acceso Basado en Roles

**Roles implementados:**
- `superadmin` - Acceso completo al sistema
- `admin` - Acceso al panel de administración
- `editor` - Puede crear y editar prompts
- `viewer` - Solo lectura
- `user` - Acceso estándar

**Protección del Panel de Admin:**
```typescript
// Solo usuarios autenticados con rol admin/superadmin pueden acceder
if (!user || (user.role !== 'superadmin' && user.role !== 'admin')) {
  return <Navigate to="/" />;
}
```

### 3. Row Level Security (RLS)

**Implementación en Supabase:**
- Políticas RLS activas en todas las tablas
- Los usuarios solo pueden acceder a sus propios datos
- Los admins tienen permisos elevados mediante políticas específicas

## 🔒 Seguridad de Contraseñas

### 1. Cambio de Contraseña

**Componente:** `src/components/UserProfile.tsx`

**Características:**
- Requiere contraseña actual para verificación
- Confirmación de nueva contraseña
- Validación de fortaleza (mínimo 6 caracteres)
- Los campos usan `type="password"` y `autoComplete="off"`

### 2. Autenticación de Dos Factores (2FA)

**Componente:** `src/components/TwoFactorAuth.tsx`

**Implementación:**
- TOTP (Time-based One-Time Password)
- Código QR para apps de autenticación (Google Authenticator, Authy, etc.)
- Clave secreta para backup
- Verificación requerida antes de activar

**Nota:** El "secret" mostrado durante la configuración inicial es temporal y solo visible una vez para que el usuario lo copie a su app de autenticación.

## 📊 Logging y Auditoría

### 1. Logging Seguro

**Prohibido:**
- ❌ `console.log(apiKey)`
- ❌ `console.log(password)`
- ❌ `console.log(token)`
- ❌ `console.log(secret)`

**Permitido:**
- ✅ `console.log('API call successful')`
- ✅ `console.log('User authenticated:', userId)`
- ✅ `console.error('Error code:', errorCode)`

### 2. Auditoría de Acciones Administrativas

**Tabla:** `audit_logs`

**Registros:**
- Cambios en configuración del sistema
- Acciones de admin sobre usuarios
- Modificaciones de planes y precios
- Impersonación de usuarios

## 🌐 Seguridad de Red

### 1. CORS (Cross-Origin Resource Sharing)

**Configuración en `server/index.js`:**
```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
```

### 2. Helmet.js

**Middleware de seguridad HTTP:**
```javascript
app.use(helmet());
```

**Protecciones incluidas:**
- XSS Protection
- Content Security Policy
- DNS Prefetch Control
- Frameguard
- Hide Powered-By
- HSTS
- IE No Open
- No Sniff
- Referrer Policy

## 🔧 Configuración en Producción

### Replit Secrets

**Cómo configurar:**
1. Ve a la pestaña "Secrets" en tu Repl
2. Agrega cada variable de entorno por separado:
   ```
   OPENAI_API_KEY=sk-...
   ANTHROPIC_API_KEY=sk-ant-...
   OPENROUTER_API_KEY=sk-or-...
   DATABASE_URL=postgresql://...
   ```
3. Nunca uses el archivo `.env` en producción

### Supabase Secrets

**Para Supabase Functions:**
```bash
supabase secrets set OPENAI_API_KEY=tu-clave-aqui
supabase secrets set OPENROUTER_API_KEY=tu-clave-aqui
```

## ✅ Checklist de Seguridad

### Desarrollo
- [x] API keys en variables de entorno
- [x] No hacer commit de archivos `.env`
- [x] Usar `type="password"` para campos sensibles
- [x] Sanitizar mensajes de error
- [x] No hacer `console.log` de información sensible

### Producción
- [ ] Configurar todas las API keys en Replit Secrets
- [ ] Habilitar HTTPS (automático en Replit)
- [ ] Verificar políticas RLS en Supabase
- [ ] Revisar logs de auditoría regularmente
- [ ] Activar 2FA para cuentas de admin

### Revisiones Periódicas
- [ ] Rotar API keys cada 3-6 meses
- [ ] Revisar permisos de usuarios
- [ ] Auditar logs de acceso
- [ ] Actualizar dependencias de seguridad
- [ ] Verificar que no haya exposición de secretos en código

## 🚨 Qué Hacer en Caso de Exposición de Clave

1. **Revocar inmediatamente** la clave expuesta en el proveedor (OpenAI, Anthropic, etc.)
2. **Generar una nueva clave** en el panel del proveedor
3. **Actualizar** la clave en Replit Secrets
4. **Revisar logs** para detectar uso no autorizado
5. **Documentar el incidente** en los logs de auditoría

## 📚 Referencias

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/security-best-practices)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Replit Secrets Documentation](https://docs.replit.com/programming-ide/workspace-features/secrets)

## 📧 Contacto de Seguridad

Si encuentras alguna vulnerabilidad de seguridad, por favor repórtala de inmediato al equipo de desarrollo.

---

**Última actualización:** Octubre 2025
**Versión del documento:** 1.0
