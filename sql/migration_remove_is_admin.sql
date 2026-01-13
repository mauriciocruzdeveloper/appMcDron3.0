-- ============================================
-- MIGRATION: Remover columna is_admin (OPCIONAL)
-- Date: 2026-01-13
-- Author: Mauricio Cruz
-- Description: Elimina la columna is_admin después de verificar
--              que el sistema funciona correctamente con role
-- 
-- ADVERTENCIA:
-- - Solo ejecutar después de verificar que TODO el código
--   usa role en lugar de is_admin
-- - Recomendado esperar al menos 1 semana en producción
-- - Hacer backup antes de ejecutar
-- ============================================

-- ⚠️ CHECKPOINT DE SEGURIDAD
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '⚠️  ADVERTENCIA: Vas a eliminar is_admin';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Asegúrate de que:';
  RAISE NOTICE '1. Todo el código usa "role" en lugar de "is_admin"';
  RAISE NOTICE '2. Has probado todas las funcionalidades';
  RAISE NOTICE '3. Tienes un backup reciente de la base de datos';
  RAISE NOTICE '';
  RAISE NOTICE 'Si no estás seguro, CANCELA esta migración (Ctrl+C)';
  RAISE NOTICE '';
  -- Pausa de 10 segundos
  PERFORM pg_sleep(10);
END $$;

BEGIN;

-- ============================================
-- STEP 1: Verificación final de consistencia
-- ============================================

DO $$
DECLARE
  inconsistent_count INTEGER;
  total_users INTEGER;
BEGIN
  -- Contar usuarios
  SELECT COUNT(*) INTO total_users FROM "user";
  
  -- Verificar consistencia
  SELECT COUNT(*) INTO inconsistent_count
  FROM "user"
  WHERE NOT (
    (is_admin = TRUE AND role = 'admin') OR
    (is_admin = FALSE AND role IN ('cliente', 'partner'))
  );
  
  RAISE NOTICE 'Total de usuarios: %', total_users;
  RAISE NOTICE 'Usuarios inconsistentes: %', inconsistent_count;
  
  IF inconsistent_count > 0 THEN
    RAISE EXCEPTION 'ABORTANDO: % usuarios tienen is_admin y role inconsistentes. Corregir antes de continuar.', inconsistent_count;
  END IF;
  
  RAISE NOTICE '✓ Verificación OK: Procediendo con eliminación de is_admin';
END $$;

-- ============================================
-- STEP 2: Eliminar constraint si existe
-- ============================================

ALTER TABLE "user" DROP CONSTRAINT IF EXISTS user_is_admin_check;

-- ============================================
-- STEP 3: Eliminar columna is_admin
-- ============================================

ALTER TABLE "user" DROP COLUMN IF EXISTS is_admin CASCADE;

COMMIT;

-- ============================================
-- VERIFICATION
-- ============================================

-- Verificar que la columna se eliminó
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'user' AND column_name = 'is_admin';

-- Expected output: Sin filas (la columna ya no existe)

-- Verificar que role sigue funcionando
SELECT 
  role, 
  COUNT(*) as total
FROM "user"
GROUP BY role;

-- Mostrar estructura actual de la tabla
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user'
ORDER BY ordinal_position;

-- ============================================
-- ROLLBACK SCRIPT
-- ============================================

/*
-- Si necesitas restaurar is_admin:

BEGIN;

-- Recrear columna is_admin
ALTER TABLE "user" 
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE NOT NULL;

-- Sincronizar desde role
UPDATE "user"
SET is_admin = CASE 
  WHEN role = 'admin' THEN TRUE
  ELSE FALSE
END;

COMMIT;

-- Verificar
SELECT 
  role,
  is_admin,
  COUNT(*) as total
FROM "user"
GROUP BY role, is_admin
ORDER BY role;

*/
