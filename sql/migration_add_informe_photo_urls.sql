-- =========================================================
-- AGREGAR CAMPO INFORME_PHOTO_URLS A LA TABLA REPAIR
-- =========================================================
-- Descripción: Agrega un array de URLs de fotos dedicado al informe
--              de reparación/diagnóstico (independiente de photo_urls,
--              photo_before/photo_after y de las fotos de asignaciones)
-- =========================================================

ALTER TABLE repair
ADD COLUMN IF NOT EXISTS informe_photo_urls TEXT[] DEFAULT '{}';

COMMENT ON COLUMN repair.informe_photo_urls IS 'URLs de fotos adjuntas al informe de reparación/diagnóstico (DescripcionTecRep)';

-- Verificación
SELECT
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'repair'
AND column_name = 'informe_photo_urls';
