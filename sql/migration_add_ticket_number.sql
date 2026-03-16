-- ============================================================
-- Migración: Agregar campo public_id a reparaciones
-- Formato: REP-YYYY-NNNNNNN (computado en frontend, guardado en BD)
-- ============================================================
--
-- NNNNNNN = 1000000 + id de la reparación → 7 dígitos empezando por 1
-- YYYY    = año de created_at
-- Ejemplo: repair con id=42 creada en 2026 → REP-2026-1000042
--
-- INSTRUCCIONES:
-- 1. Ejecutar este script en Supabase SQL Editor
-- 2. Desplegar el frontend actualizado
--

-- 1. Agregar la columna
ALTER TABLE repair ADD COLUMN IF NOT EXISTS public_id TEXT;

-- 2. Backfill reparaciones existentes
-- IDs <= 9999999 (nuevos secuenciales): 1000000 + id → 7 dígitos empezando por 1
-- IDs > 9999999 (legacy timestamps): se usan tal cual
UPDATE repair
SET public_id = 'REP-' || EXTRACT(YEAR FROM created_at)::TEXT || '-' || 
  CASE WHEN id <= 9999999 THEN (1000000 + id)::TEXT
       ELSE id::TEXT
  END
WHERE public_id IS NULL;

-- 3. Crear índice único
CREATE UNIQUE INDEX IF NOT EXISTS idx_repair_public_id ON repair(public_id);

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
-- SELECT id, public_id, created_at FROM repair ORDER BY id;
