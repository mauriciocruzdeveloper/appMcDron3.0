-- Agregar campos de descripción y fotos a las asignaciones de intervenciones
-- Para generar presupuestos automáticos con detalle de problemas e imágenes

-- Agregar columna de descripción del problema
ALTER TABLE repair_intervention 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Agregar columna de fotos (array de URLs)
ALTER TABLE repair_intervention 
ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb;

-- Crear índice para búsquedas por fotos (opcional, útil si querés buscar asignaciones con/sin fotos)
CREATE INDEX IF NOT EXISTS idx_repair_intervention_photos ON repair_intervention USING GIN (photos);

-- Comentarios para documentación
COMMENT ON COLUMN repair_intervention.description IS 'Descripción detallada del problema específico para esta intervención en el presupuesto';
COMMENT ON COLUMN repair_intervention.photos IS 'Array de URLs de fotos que documentan el problema (JSONB array de strings)';

-- Verificar el resultado
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'repair_intervention' 
  AND column_name IN ('description', 'photos')
ORDER BY ordinal_position;
