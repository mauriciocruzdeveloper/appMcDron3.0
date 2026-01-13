-- ============================================
-- MIGRATION: Sistema de Roles de Usuario (FASE 1 - Segura)
-- Date: 2026-01-13
-- Author: Mauricio Cruz
-- Description: Agrega columna role y migra datos desde is_admin
--              MANTIENE is_admin para no perder datos
-- 
-- IMPORTANTE: 
-- - Este script AGREGA role pero MANTIENE is_admin
-- - Es seguro: no se pierden datos
-- - Después de verificar, ejecutar migration_remove_is_admin.sql
-- - Hacer backup antes de ejecutar (por seguridad)
-- ============================================

BEGIN;

-- ============================================
-- STEP 1: Agregar columna role
-- ============================================

-- Agregar nueva columna con default 'cliente'
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'cliente' NOT NULL;

-- Agregar comentario descriptivo
COMMENT ON COLUMN "user".role IS 'Rol del usuario en el sistema: admin, cliente, partner';

-- ============================================
-- STEP 2: Agregar constraint para valores válidos
-- ============================================

ALTER TABLE "user"
ADD CONSTRAINT valid_role CHECK (role IN ('admin', 'cliente', 'partner'));

-- ============================================
-- STEP 3: Crear índice para mejorar performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_role ON "user"(role);

COMMENT ON INDEX idx_user_role IS 'Índice para queries filtradas por rol';

-- ============================================
-- STEP 4: Migrar datos existentes
-- ============================================

-- Convertir is_admin a role
UPDATE "user"
SET role = CASE 
  WHEN is_admin = TRUE THEN 'admin'
  ELSE 'cliente'
END
WHERE role = 'cliente'; -- Solo actualizar los que tienen el default

-- ============================================
-- STEP 5: Verificación de integridad
-- ============================================

-- Verificar que todos tienen un rol válido y consistente con is_admin
DO $$
DECLARE
  null_count INTEGER;
  inconsistent_count INTEGER;
  total_count INTEGER;
  admin_count INTEGER;
  cliente_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count FROM "user";
  SELECT COUNT(*) INTO null_count FROM "user" WHERE role IS NULL;
  SELECT COUNT(*) INTO admin_count FROM "user" WHERE role = 'admin';
  SELECT COUNT(*) INTO cliente_count FROM "user" WHERE role = 'cliente';
  
  -- Verificar que no hay NULL
  IF null_count > 0 THEN
    RAISE EXCEPTION 'ERROR: % usuarios tienen role NULL', null_count;
  END IF;
  
  -- Verificar consistencia entre is_admin y role
  SELECT COUNT(*) INTO inconsistent_count
  FROM "user"
  WHERE NOT (
    (is_admin = TRUE AND role = 'admin') OR
    (is_admin = FALSE AND role IN ('cliente', 'partner'))
  );
  
  IF inconsistent_count > 0 THEN
    RAISE EXCEPTION 'ERROR: % usuarios tienen is_admin y role inconsistentes', inconsistent_count;
  END IF;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✓ MIGRACIÓN COMPLETADA EXITOSAMENTE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total usuarios: %', total_count;
  RAISE NOTICE 'Administradores (role=admin): %', admin_count;
  RAISE NOTICE 'Clientes (role=cliente): %', cliente_count;
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANTE: is_admin se mantiene para seguridad';
  RAISE NOTICE '   Después de verificar que todo funciona:';
  RAISE NOTICE '   - Ejecutar migration_remove_is_admin.sql';
  RAISE NOTICE '';
END $$;

COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verificar que la columna se creó correctamente
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'user' 
  AND column_name = 'role';

-- Expected output:
-- role | character varying | NO | 'cliente'::character varying

-- Contar usuarios por rol
SELECT 
  role, 
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as porcentaje
FROM "user"
GROUP BY role
ORDER BY total DESC;

-- Verificar constraint
SELECT 
  constraint_name, 
  constraint_type (verificar consistencia)
SELECT 
  id,
  email,
  first_name,
  last_name,
  is_admin as "is_admin (legacy)",
  role as "role (nuevo)",
  CASE 
    WHEN is_admin = TRUE AND role = 'admin' THEN '✓ OK'
    WHEN is_admin = FALSE AND role IN ('cliente', 'partner') THEN '✓ OK'
    ELSE '❌ INCONSISTENTE'
  END as validacion
-- Verificar índice
SELECT 
  indexname, 
  indexdef
FROM pg_indexes
WHERE tablename = 'user'
  AND indexname = 'idx_user_role';

-- Listar primeros 10 usuarios con sus roles
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  created_at
FROM "user"
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- QUERIES ÚTILES POST-MIGRACIÓN
-- ============================================

-- Obtener todos los administradores
-- SELECT * FROM "user" WHERE role = 'admin';

-- Obtener todos los clientes
-- SELECT * FROM "user" WHERE role = 'cliente';

-- Obtener todos los partners
-- SELECT * FROM "user" WHERE role = 'partner';

-- Cambiar rol de un usuario específico
-- UPDATE "user" SET role = 'partner' WHERE email = 'usuario@ejemplo.com';

-- ============================================
-- ROLLBACK SCRIPT
-- ============================================

/*
-- SOLO ejecutar si hay problemas y se necesita revertir la migración

BEGIN;

-- Restaurar is_admin desde role (por si hubo cambios manuales en role)
UPD⚠️ ADVERTENCIA: Este rollback NO puede restaurar is_admin si ya se ejecutó la migración completa
-- Solo ejecutar si detectas el problema DURANTE la migración y no se completó el COMMIT

BEGIN;

-- Recrear columna is_admin
ALTER TABLE "user" 
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Sincronizar desde role
UPDATE "user"
SET is_admin = CASE 
  WHEN role = 'admin' THEN TRUE
  ELSE FALSE
END;

-- Eliminar índice de role
DROP INDEX IF EXISTS idx_user_role;

-- Eliminar constraint de role
ALTER TABLE "user" DROP CONSTRAINT IF EXISTS valid_role;

-- Eliminar columna role
ALTER TABLE "user" DROP COLUMN IF EXISTS role;

COMMIT;

-- Verificar rollback
SELECT 
  column_name,
  data_type 
FROM information_schema.columns 
WHERE table_name = 'user' 
  AND column_name IN ('role', 'is_admin')
ORDER BY column_name;
-- Debe mostrar solo is_admin