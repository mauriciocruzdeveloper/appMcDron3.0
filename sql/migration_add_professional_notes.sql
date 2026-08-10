-- ============================================
-- MIGRATION: Observaciones profesionales del usuario/cliente
-- Date: 2026-08-10
-- Description: Agrega columna professional_notes (uso interno/admin) para
--              anotar a qué se dedica el cliente y evaluar prioridad/valor.
-- ============================================

BEGIN;

ALTER TABLE "user"
ADD COLUMN IF NOT EXISTS professional_notes TEXT;

COMMENT ON COLUMN "user".professional_notes IS
  'Notas internas de uso administrativo (a qué se dedica el cliente, prioridad, valor). No visible para el propio usuario.';

COMMIT;
