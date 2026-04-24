-- Migration: Agregar estado de obsolescencia al catalogo de intervenciones
-- Permite conservar el historico sin eliminar ni reutilizar intervenciones viejas

ALTER TABLE intervention
  ADD COLUMN IF NOT EXISTS is_obsolete BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_intervention_is_obsolete ON intervention(is_obsolete);

COMMENT ON COLUMN intervention.is_obsolete IS 'Si es TRUE, la intervencion queda fuera de nuevas asignaciones pero se mantiene en historico y listados.';
