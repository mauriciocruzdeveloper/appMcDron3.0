-- Migration: Agregar foto identificatoria a la tabla de repuestos (part)
-- Permite almacenar la URL de la imagen del repuesto subida a Supabase Storage

ALTER TABLE part
  ADD COLUMN IF NOT EXISTS photo_url TEXT;

COMMENT ON COLUMN part.photo_url IS 'URL pública de la foto identificatoria del repuesto almacenada en Supabase Storage';
