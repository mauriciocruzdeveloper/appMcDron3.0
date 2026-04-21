-- Migration: Agregar columna parent_repair_id a la tabla repair
-- Permite vincular reparaciones como "ampliaciones" de una reparación anterior
-- Una reparación hijo apunta a su reparación padre mediante esta FK opcional

ALTER TABLE repair
  ADD COLUMN IF NOT EXISTS parent_repair_id BIGINT REFERENCES repair(id) ON DELETE SET NULL;

-- Índice para consultar rápidamente todas las ampliaciones de una reparación
CREATE INDEX IF NOT EXISTS idx_repair_parent_repair_id ON repair(parent_repair_id);

-- Comentario descriptivo
COMMENT ON COLUMN repair.parent_repair_id IS 'ID de la reparación padre. Si está presente, esta es una ampliación de la reparación referenciada.';
