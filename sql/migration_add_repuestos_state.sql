-- ============================================
-- MIGRATION: Agregar campos para estado Repuestos
-- Date: 2025-11-16
-- Author: Mauricio Cruz
-- Description: Agrega columnas parts_notes y requested_parts_ids
--              a la tabla repair para soportar el estado "Repuestos"
-- ============================================

BEGIN;

-- Agregar columnas
ALTER TABLE repair 
ADD COLUMN IF NOT EXISTS parts_notes TEXT,
ADD COLUMN IF NOT EXISTS requested_parts_ids TEXT[];

-- Agregar comentarios descriptivos
COMMENT ON COLUMN repair.parts_notes IS 'Observaciones sobre qué repuestos se necesitan (max 2000 chars)';
COMMENT ON COLUMN repair.requested_parts_ids IS 'Array de IDs de repuestos solicitados del inventario (max 50 items)';

-- Agregar constraint de longitud para parts_notes
ALTER TABLE repair
ADD CONSTRAINT parts_notes_length CHECK (LENGTH(parts_notes) <= 2000);

-- Agregar constraint de cantidad de items en array
ALTER TABLE repair
ADD CONSTRAINT requested_parts_count CHECK (
  array_length(requested_parts_ids, 1) IS NULL 
  OR array_length(requested_parts_ids, 1) <= 50
);

-- Crear index GIN para búsquedas eficientes en array (opcional pero recomendado)
CREATE INDEX IF NOT EXISTS idx_repair_requested_parts 
ON repair USING GIN(requested_parts_ids);

COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verificar que las columnas se crearon correctamente
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'repair' 
  AND column_name IN ('parts_notes', 'requested_parts_ids')
ORDER BY column_name;

-- Expected output:
-- parts_notes         | text  | YES | NULL
-- requested_parts_ids | ARRAY | YES | NULL

-- Verificar constraints
SELECT 
  constraint_name, 
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'repair'
  AND constraint_name LIKE '%parts%';

-- Expected output should include:
-- parts_notes_length      | CHECK
-- requested_parts_count   | CHECK

-- Verificar index
SELECT 
  indexname, 
  indexdef
FROM pg_indexes
WHERE tablename = 'repair'
  AND indexname = 'idx_repair_requested_parts';

-- ============================================
-- ROLLBACK SCRIPT (ejecutar solo si hay problemas)
-- ============================================

/*
BEGIN;

-- Eliminar constraints
ALTER TABLE repair DROP CONSTRAINT IF EXISTS parts_notes_length;
ALTER TABLE repair DROP CONSTRAINT IF EXISTS requested_parts_count;

-- Eliminar index
DROP INDEX IF EXISTS idx_repair_requested_parts;

-- Eliminar columnas
ALTER TABLE repair DROP COLUMN IF EXISTS parts_notes;
ALTER TABLE repair DROP COLUMN IF EXISTS requested_parts_ids;

COMMIT;
*/
