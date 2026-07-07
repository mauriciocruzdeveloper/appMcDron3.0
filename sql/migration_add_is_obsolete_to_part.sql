-- Migration: Agregar estado de obsolescencia al catalogo de repuestos
-- Permite conservar el historico y el stock sin eliminar ni reutilizar repuestos viejos

ALTER TABLE part
  ADD COLUMN IF NOT EXISTS is_obsolete BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_part_is_obsolete ON part(is_obsolete);

COMMENT ON COLUMN part.is_obsolete IS 'Si es TRUE, el repuesto queda fuera de nuevas asociaciones a intervenciones pero conserva stock, ledger e historico.';
