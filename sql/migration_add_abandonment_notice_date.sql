-- Fecha en que se envio correctamente el aviso previo de abandono.
-- Se guarda como timestamp Unix en milisegundos, igual que las demas fechas de repair.

ALTER TABLE repair
  ADD COLUMN IF NOT EXISTS abandonment_notice_date BIGINT;

COMMENT ON COLUMN repair.abandonment_notice_date IS
  'Timestamp Unix en milisegundos del aviso previo de abandono enviado al cliente.';