-- ============================================
-- MIGRATION: Email de Contacto Alternativo
-- Date: 2026-01-20
-- Author: Mauricio Cruz
-- Description: Agrega columna contact_email para permitir que los usuarios
--              tengan un email diferente para recibir notificaciones
-- 
-- CONTEXTO:
-- - email: usado para autenticación (Supabase Auth), inmutable
-- - contact_email: usado para notificaciones, presupuestos, etc., editable
-- - Si contact_email es NULL, se usa email por defecto
-- ============================================

BEGIN;

-- ============================================
-- STEP 1: Agregar columna contact_email
-- ============================================

ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);

-- Agregar comentario descriptivo
COMMENT ON COLUMN "user".contact_email IS 
  'Email alternativo para recibir notificaciones y comunicaciones. Si es NULL, se usa el email de autenticación.';

-- ============================================
-- STEP 2: Agregar constraint de validación de email
-- ============================================

ALTER TABLE "user"
ADD CONSTRAINT valid_contact_email 
  CHECK (contact_email IS NULL OR contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

COMMENT ON CONSTRAINT valid_contact_email ON "user" IS 
  'Valida que contact_email tenga formato de email válido o sea NULL';

-- ============================================
-- STEP 3: Crear índice para búsquedas
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_contact_email ON "user"(contact_email)
WHERE contact_email IS NOT NULL;

COMMENT ON INDEX idx_user_contact_email IS 
  'Índice parcial para búsquedas por email de contacto (solo registros con contact_email definido)';

-- ============================================
-- STEP 4: Verificar resultados
-- ============================================

DO $$
DECLARE
  total_users INTEGER;
  users_with_contact INTEGER;
BEGIN
  -- Contar usuarios totales
  SELECT COUNT(*) INTO total_users FROM "user";
  
  -- Contar usuarios con contact_email definido
  SELECT COUNT(*) INTO users_with_contact FROM "user" WHERE contact_email IS NOT NULL;
  
  RAISE NOTICE '✅ Migración completada exitosamente';
  RAISE NOTICE '📊 Total de usuarios: %', total_users;
  RAISE NOTICE '📧 Usuarios con email de contacto: %', users_with_contact;
  RAISE NOTICE '';
  RAISE NOTICE 'Columna contact_email agregada correctamente';
  RAISE NOTICE 'Los usuarios pueden ahora tener un email alternativo para notificaciones';
END $$;

COMMIT;

-- ============================================
-- ROLLBACK (en caso de necesitar revertir)
-- ============================================
-- 
-- Para revertir esta migración, ejecutar:
-- 
-- BEGIN;
-- DROP INDEX IF EXISTS idx_user_contact_email;
-- ALTER TABLE "user" DROP CONSTRAINT IF EXISTS valid_contact_email;
-- ALTER TABLE "user" DROP COLUMN IF EXISTS contact_email;
-- COMMIT;
-- 
-- ============================================
