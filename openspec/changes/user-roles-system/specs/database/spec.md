# Spec: Migración de Base de Datos - Sistema de Roles

## Overview
Migración de Supabase para cambiar de `is_admin: boolean` a `role: varchar` en la tabla `user`.

## Database Schema

### Tabla Actual: `user`

```sql
CREATE TABLE user (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  telephone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  is_admin BOOLEAN DEFAULT FALSE,  -- ❌ A reemplazar
  nick VARCHAR(100),
  url_photo TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla Modificada: `user`

```sql
CREATE TABLE user (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  telephone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  role VARCHAR(20) DEFAULT 'cliente' NOT NULL,  -- ✅ Reemplaza is_admin
  nick VARCHAR(100),
  url_photo TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraint para valores válidos
  CONSTRAINT valid_role CHECK (role IN ('admin', 'cliente', 'partner'))
);
```

## Migration Steps

### Step 1: Agregar columna `role`

```sql
-- Agregar nueva columna
ALTER TABLE "user" 
ADD COLUMN role VARCHAR(20) DEFAULT 'cliente' NOT NULL;

-- Agregar constraint
ALTER TABLE "user"
ADD CONSTRAINT valid_role CHECK (role IN ('admin', 'cliente', 'partner'));

-- Agregar índice para mejorar queries por rol
CREATE INDEX idx_user_role ON "user"(role);
```

### Step 2: Migrar datos existentes

```sql
-- Convertir is_admin a role
UPDATE "user"
SET role = CASE 
  WHEN is_admin = TRUE THEN 'admin'
  ELSE 'cliente'
END;
```

### Step 3: Verificación

```sql
-- Verificar que todos tienen un rol válido
SELECT role, COUNT(*) 
FROM "user" 
GROUP BY role;

-- Verificar consistencia
SELECT 
  id,
  email,
  is_admin,
  role,
  CASE 
    WHEN is_admin = TRUE AND role = 'admin' THEN '✓ OK'
    WHEN is_admin = FALSE AND role = 'cliente' THEN '✓ OK'
    ELSE '❌ INCONSISTENTE'
  END as status
FROM "user"
WHERE NOT (
  (is_admin = TRUE AND role = 'admin') OR
  (is_admin = FALSE AND role IN ('cliente', 'partner'))
);
```

### Step 4: Eliminar `is_admin`

```sql
-- Eliminar constraint si existe
ALTER TABLE "user" DROP CONSTRAINT IF EXISTS user_is_admin_check;

-- Eliminar columna
ALTER TABLE "user" DROP COLUMN is_admin CASCADE;
```

## Rollback Plan

⚠️ **Solo posible si se detecta el problema DURANTE la ejecución del script**

Si algo sale mal durante la migración:

```sql
BEGIN;

-- Recrear columna is_admin
ALTER TABLE "user" 
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Restaurar is_admin desde role
UPDATE "user"
SET is_admin = CASE 
  WHEN role = 'admin' THEN TRUE
  ELSE FALSE
END;

-- Eliminar columna role
ALTER TABLE "user" DROP CONSTRAINT IF EXISTS valid_role;
DROP INDEX IF EXISTS idx_user_role;
ALTER TABLE "user" DROP COLUMN role;

COMMIT;
```

**Importante:** Si la migración ya se completó y committeó, necesitarás restaurar desde backup.

   ```

2. **Usuario cliente existente**
   ```sql
   -- Antes: is_admin = false
   -- Después: role = 'cliente'
   -- Antes: is_admin = true
   -- Después: role = 'admin', is_admin = true
   ```

2. **Usuario cliente existente**
   ```sql
   -- Antes: is_admin = false
   -- Después: role = 'cliente', is_admin = false
   ```

3. **Inserción de nuevo usuario**
   ```sql
   INSERT INTO "user" (email, first_name, last_name, role)
   VALUES ('nuevo@test.com', 'Nuevo', 'Usuario', 'cliente');
   -- Debe tener role = 'cliente' por defecto
   ```

4. **Inserción con rol inválido**
   ```sql
   INSERT INTO "user" (email, first_name, role)
   VALUES ('invalido@test.com', 'Invalido', 'superadmin');
   -- Debe FALLAR por constraint
   ```

### Verification Queries

```sql
-- Contar usuarios por rol
SELECT role, COUNT(*) as total
FROM "user"
GROUP BY role
ORDER BY total DESC;

-- Listar admins
SELECT id, email, first_name, last_name, role
FROM "user"
WHERE role = 'admin';

-- Verificar que no hay valores NULL
SELECT COUNT(*) as users_with_null_role
FROM "user"
WHERE role IS NULL;
-- Debe retornar 0
```

## Notes

- El campo `is_admin` se elimina completamente en esta migración (reemplazo total)
- El índice en `role` mejora performance en queries como "obtener usuarios por rol"
- El constraint asegura integridad de datos a nivel de base de datos
- Después de esta migración, todo el código debe usar `role` en lugar de `is_admin`

## File Output

Esta spec genera el archivo:
- `/sql/migration_add_user_roles.sql` - Migración completa (incluye eliminación de is_admin)
