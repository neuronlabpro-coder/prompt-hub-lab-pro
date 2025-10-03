# Crear Usuario Superadmin

## Método Rápido (30 segundos)

### Paso 1: Registrarse en la aplicación
1. Accede a la página de registro: `/login`
2. Haz clic en "¿No tienes cuenta? Regístrate"
3. Usa estos datos:
   - **Email:** `superadmin@prompthub.com`
   - **Contraseña:** `1234abcd`
4. Completa el registro

### Paso 2: Actualizar rol a superadmin

Ejecuta este SQL en Supabase SQL Editor:

```sql
-- Actualizar rol del usuario a superadmin
UPDATE users 
SET role = 'superadmin'
WHERE email = 'superadmin@prompthub.com';
```

### Verificar

```sql
-- Verificar que el usuario tiene rol superadmin
SELECT id, email, name, role 
FROM users 
WHERE email = 'superadmin@prompthub.com';
```

Deberías ver:
```
role: superadmin
```

## Método Alternativo: SQL Directo (Usando Supabase Service Role)

Si tienes acceso al Service Role Key de Supabase, puedes crear el usuario directamente con este script Node.js:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const { data, error } = await supabase.auth.admin.createUser({
  email: 'superadmin@prompthub.com',
  password: '1234abcd',
  email_confirm: true,
  user_metadata: {
    name: 'Super Admin'
  }
});

// Luego actualizar rol
await supabase
  .from('users')
  .update({ role: 'superadmin' })
  .eq('id', data.user.id);
```

## Acceso

Una vez creado:
- **URL:** `/login`
- **Email:** `superadmin@prompthub.com`
- **Contraseña:** `1234abcd`

El superadmin tendrá acceso completo a:
- Panel de Administración
- Gestión de usuarios
- Configuración del sistema
- Todos los prompts
- Analytics completo
