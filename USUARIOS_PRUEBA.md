# Usuarios de Prueba - PromptHub

## 🔑 CREDENCIALES DE ACCESO (MODO PRUEBA)

### 🔴 IMPORTANTE: Sistema de Prueba Activado
El sistema está en **modo de prueba** y NO requiere Supabase. Usa estas credenciales directamente:

---

### 👑 Superadmin
- **Email**: `superadmin@prompthub.com`
- **Password**: `Admin123!`
- **Rol**: Superadmin
- **Plan**: Enterprise
- **Acceso**: Panel admin completo

---

### 👤 Usuarios con Planes Diferentes

#### 🆓 Usuario Plan Starter
- **Email**: `usuario.free@test.com`
- **Password**: `Starter123!`
- **Rol**: User
- **Plan**: Starter
- **Descuento**: 0%

#### 💼 Usuario Plan Pro
- **Email**: `usuario.pro@test.com`
- **Password**: `Pro123!`
- **Rol**: User
- **Plan**: Pro
- **Descuento**: 10%

#### 🚀 Usuario Plan Enterprise
- **Email**: `usuario.enterprise@test.com`
- **Password**: `Enterprise123!`
- **Rol**: User
- **Plan**: Enterprise
- **Descuento**: 20%

---

### 🏢 Usuarios Multitenant / Empresa

#### Empresa 1
- **Email**: `empresa1@corp.com`
- **Password**: `Empresa123!`
- **Rol**: Admin
- **Plan**: Enterprise

#### Empresa 2
- **Email**: `empresa2@corp.com`
- **Password**: `Empresa123!`
- **Rol**: Admin
- **Plan**: Enterprise

#### Empresa 3
- **Email**: `empresa3@corp.com`
- **Password**: `Empresa123!`
- **Rol**: Admin
- **Plan**: Enterprise

---

## 📝 Instrucciones de Login

### Opción 1: Login Rápido (Modo Prueba) ✅ RECOMENDADO

1. Ve a la página de login
2. Introduce el **email** de cualquier usuario de arriba
3. Introduce la **password** correspondiente
4. Click en "Iniciar sesión"
5. ¡Listo! Ya estás dentro

### Opción 2: OAuth (Google/GitHub)

- Requiere configurar OAuth en Supabase
- No disponible en modo prueba

---

## 🔧 Cómo Funciona

- **Modo Desarrollo**: Autenticación local simulada (NO requiere Supabase)
- **Modo Producción**: Autenticación real con Supabase Auth
- **Cambiar modo**: En desarrollo siempre usa autenticación local

---

## 🎯 Testing Rápido

**Caso 1: Probar como usuario normal**
```
Email: usuario.pro@test.com
Password: Pro123!
```

**Caso 2: Probar panel admin**
```
Email: superadmin@prompthub.com
Password: Admin123!
```

**Caso 3: Probar descuentos**
- Starter (0%): `usuario.free@test.com` / `Starter123!`
- Pro (10%): `usuario.pro@test.com` / `Pro123!`
- Enterprise (20%): `usuario.enterprise@test.com` / `Enterprise123!`

---

## ⚠️ Notas Importantes

- **Todas las contraseñas terminan en `123!`** (fácil de recordar)
- **Modo prueba** solo funciona en desarrollo (puerto 5000)
- **Sesión persiste** en localStorage hasta que cierres sesión
- **No requiere verificación** de email
