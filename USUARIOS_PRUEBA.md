# Usuarios de Prueba - PromptHub

## 🔑 Credenciales de Acceso

### Superadmin
- **Email**: superadmin@prompthub.com
- **Rol**: Superadmin
- **Plan**: Enterprise
- **Tokens**: 0 / 5,000,000

### Usuarios con Planes Diferentes

#### Usuario Plan Starter
- **Email**: usuario.free@test.com
- **Rol**: User
- **Plan**: Starter
- **Tokens**: 5,000 / 50,000

#### Usuario Plan Pro
- **Email**: usuario.pro@test.com
- **Rol**: User
- **Plan**: Pro
- **Tokens**: 25,000 / 200,000

#### Usuario Plan Enterprise
- **Email**: usuario.enterprise@test.com
- **Rol**: User
- **Plan**: Enterprise
- **Tokens**: 150,000 / 1,000,000

### Usuarios Multitenant / Empresa

#### Empresa 1
- **Email**: empresa1@corp.com
- **Rol**: Admin
- **Plan**: Enterprise
- **Tokens**: 100,000 / 2,000,000

#### Empresa 2
- **Email**: empresa2@corp.com
- **Rol**: Admin
- **Plan**: Enterprise
- **Tokens**: 200,000 / 2,000,000

#### Empresa 3
- **Email**: empresa3@corp.com
- **Rol**: Admin
- **Plan**: Enterprise
- **Tokens**: 50,000 / 2,000,000

## 📝 Nota sobre autenticación

Estos usuarios están creados en la tabla `users` de la base de datos local.

Para autenticarse con Supabase Auth, necesitas crear las cuentas en Supabase:
1. Ir a `/register` o `/login`
2. Crear cuenta con Google/GitHub OAuth
3. O usar Email/Password si está configurado

Los datos de la tabla `users` se vincularán automáticamente cuando te autentiques con el mismo email.
