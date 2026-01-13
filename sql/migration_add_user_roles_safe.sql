-- ============================================
-- MIGRATION: Sistema de Roles de Usuario (FASE 1 - SEGURA)
-- Date: 2026-01-13
-- Author: Mauricio Cruz
-- Description: Agrega columna role y migra datos desde is_admin
--              MANTIENE is_admin para no perder datos
-- 
-- IMPORTANTE: 
-- - Este script AGREGA role pero MANTIENE is_admin
-- - Es 100% seguro: no se pierden datos
-- - Después de verificar, ejecutar migration_remove_is_admin.sql
-- - Recomendado: Hacer backup antes de ejecutar
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
-- STEP 4: Migrar datos existentes de is_admin a role
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
  RAISE NOTICE '   1. Actualizar código para usar role en vez de is_admin';
  RAISE NOTICE '   2. Probar en desarrollo/staging';
  RAISE NOTICE '   3. Ejecutar migration_remove_is_admin.sql';
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
  AND column_name IN ('role', 'is_admin')
ORDER BY column_name;

-- Expected output:
-- is_admin | boolean           | YES | false
-- role     | character varying | NO  | 'cliente'::character varying

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
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'user'
  AND constraint_name = 'valid_role';

-- Expected output:
-- valid_role | CHECK

-- Verificar índice
SELECT 
  indexname, 
  indexdef
FROM pg_indexes
WHERE tablename = 'user'
  AND indexname = 'idx_user_role';

-- Listar primeros 10 usuarios con sus roles (verificar consistencia)
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
FROM "user"
ORDER BY created_at DESC
LIMIT 10;

-- Verificar que NO hay inconsistencias (debe retornar 0 filas)
SELECT 
  id,
  email,
  is_admin,
  role
FROM "user"
WHERE NOT (
  (is_admin = TRUE AND role = 'admin') OR
  (is_admin = FALSE AND role IN ('cliente', 'partner'))
);
-- Si retorna filas, hay un problema

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

-- Contar usuarios por rol e is_admin (verificar migración)
-- SELECT role, is_admin, COUNT(*) 
-- FROM "user" 
-- GROUP BY role, is_admin 
-- ORDER BY role, is_admin;

-- ============================================
-- ROLLBACK SCRIPT (SEGURO - is_admin todavía existe)
-- ============================================

/*
-- Solo ejecutar si hay problemas y se necesita revertir la migración
-- Como is_admin todavía existe, el rollback es 100% seguro

BEGIN;

-- Eliminar índice
DROP INDEX IF EXISTS idx_user_role;

-- Eliminar constraint
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
-- Debe mostrar solo is_admin (volvemos al estado original sin pérdida de datos)

*/
