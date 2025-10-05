-- Arreglar políticas RLS para usuarios
-- Ejecutar en Supabase SQL Editor

-- Eliminar todas las políticas existentes de users
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;

-- Crear políticas simples sin recursión
-- Permitir SELECT a todos los usuarios autenticados
CREATE POLICY "Allow SELECT for authenticated users"
ON users FOR SELECT
TO authenticated
USING (true);

-- Permitir UPDATE solo al propio usuario
CREATE POLICY "Allow UPDATE own data"
ON users FOR UPDATE
TO authenticated
USING (auth.uid()::text = id);

-- Permitir INSERT al propio usuario (para registro)
CREATE POLICY "Allow INSERT own data"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = id);

-- Comentario: Las políticas ahora son simples y sin recursión
-- Todos los usuarios autenticados pueden ver todos los usuarios
-- Solo pueden actualizar sus propios datos