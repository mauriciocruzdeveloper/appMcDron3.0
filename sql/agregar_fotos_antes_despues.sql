-- =========================================================
-- AGREGAR CAMPOS PHOTO_BEFORE Y PHOTO_AFTER A LA TABLA REPAIR
-- =========================================================
-- Fecha: 2024
-- Descripción: Agrega dos columnas para almacenar las URLs
--              de las fotos "antes" y "después" de una reparación
-- =========================================================

-- 1. Agregar las columnas a la tabla repair
ALTER TABLE repair 
ADD COLUMN IF NOT EXISTS photo_before VARCHAR(500),
ADD COLUMN IF NOT EXISTS photo_after VARCHAR(500);

-- 2. Agregar comentarios a las columnas (documentación)
COMMENT ON COLUMN repair.photo_before IS 'URL de la foto que muestra el estado del drone ANTES de la reparación';
COMMENT ON COLUMN repair.photo_after IS 'URL de la foto que muestra el estado del drone DESPUÉS de la reparación';

-- 3. (OPCIONAL) Agregar constraint para evitar que sean la misma foto
-- Descomenta las siguientes líneas si quieres esta validación:
-- ALTER TABLE repair 
-- ADD CONSTRAINT check_different_photos 
-- CHECK (photo_before IS NULL OR photo_after IS NULL OR photo_before != photo_after);

-- 4. Verificar que las columnas se crearon correctamente
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'repair' 
AND column_name IN ('photo_before', 'photo_after')
ORDER BY column_name;

-- =========================================================
-- INSTRUCCIONES DE USO:
-- =========================================================
-- 1. Conectarte a tu base de datos Supabase usando el SQL Editor
-- 2. Copiar y pegar este script completo
-- 3. Ejecutar el script
-- 4. Verificar que el resultado de la consulta final muestre:
--    - photo_after    | character varying | 500 | YES | NULL
--    - photo_before   | character varying | 500 | YES | NULL
-- =========================================================

-- =========================================================
-- ROLLBACK (si necesitas revertir los cambios):
-- =========================================================
-- ALTER TABLE repair DROP COLUMN IF EXISTS photo_before;
-- ALTER TABLE repair DROP COLUMN IF EXISTS photo_after;
-- ALTER TABLE repair DROP CONSTRAINT IF EXISTS check_different_photos;
-- =========================================================
