-- ============================================================
-- MIGRACIÓN: Ledger de inventario + rename de columna
-- Cambio OpenSpec: inventory-ledger-and-rename
-- Fecha: 2026-07-05
--
-- IMPORTANTE:
--   * Ejecutar PRIMERO en el proyecto Supabase DEV y verificar backfill.
--   * Es idempotente donde es posible, pero el RENAME de columna solo
--     debe correrse una vez (protegido con guarda condicional).
-- ============================================================

-- ------------------------------------------------------------
-- 1) RENAME columna part.backorder -> part.committed_units
--    (guarda para no fallar si ya se aplicó)
-- ------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'part' AND column_name = 'backorder'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'part' AND column_name = 'committed_units'
    ) THEN
        ALTER TABLE part RENAME COLUMN backorder TO committed_units;
    END IF;
END $$;

-- Asegurar defaults/NOT NULL coherentes en las columnas cacheadas
ALTER TABLE part ALTER COLUMN stock SET DEFAULT 0;
ALTER TABLE part ALTER COLUMN committed_units SET DEFAULT 0;
UPDATE part SET stock = 0 WHERE stock IS NULL;
UPDATE part SET committed_units = 0 WHERE committed_units IS NULL;

-- ------------------------------------------------------------
-- 2) Tabla de movimientos (append-only, fuente de verdad)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock_movement (
    id              BIGSERIAL PRIMARY KEY,
    part_id         BIGINT NOT NULL REFERENCES part(id) ON DELETE CASCADE,
    kind            TEXT NOT NULL CHECK (kind IN (
                        'opening', 'reception', 'reservation',
                        'release', 'consumption', 'adjustment'
                    )),
    on_hand_delta   INTEGER NOT NULL DEFAULT 0,
    committed_delta INTEGER NOT NULL DEFAULT 0,
    reference_type  TEXT CHECK (reference_type IN ('purchase_order', 'repair', 'manual')),
    reference_id    BIGINT,
    note            TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_movement_part ON stock_movement(part_id);
CREATE INDEX IF NOT EXISTS idx_stock_movement_ref ON stock_movement(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_stock_movement_kind ON stock_movement(kind);

-- ------------------------------------------------------------
-- 3) RPC atómico: inserta movimiento y actualiza cache en part
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION apply_stock_movement(
    p_part_id         BIGINT,
    p_on_hand_delta   INTEGER,
    p_committed_delta INTEGER,
    p_kind            TEXT,
    p_reference_type  TEXT DEFAULT NULL,
    p_reference_id    BIGINT DEFAULT NULL,
    p_note            TEXT DEFAULT NULL
) RETURNS part
LANGUAGE plpgsql
AS $$
DECLARE
    v_part part;
BEGIN
    INSERT INTO stock_movement (
        part_id, kind, on_hand_delta, committed_delta,
        reference_type, reference_id, note
    ) VALUES (
        p_part_id, p_kind, COALESCE(p_on_hand_delta, 0), COALESCE(p_committed_delta, 0),
        p_reference_type, p_reference_id, p_note
    );

    UPDATE part
    SET stock           = GREATEST(0, COALESCE(stock, 0) + COALESCE(p_on_hand_delta, 0)),
        committed_units = GREATEST(0, COALESCE(committed_units, 0) + COALESCE(p_committed_delta, 0))
    WHERE id = p_part_id
    RETURNING * INTO v_part;

    IF v_part.id IS NULL THEN
        RAISE EXCEPTION 'Repuesto % no encontrado', p_part_id;
    END IF;

    RETURN v_part;
END;
$$;

-- Asegurar permiso de ejecucion del RPC para usuarios autenticados
GRANT EXECUTE ON FUNCTION apply_stock_movement(BIGINT, INTEGER, INTEGER, TEXT, TEXT, BIGINT, TEXT) TO authenticated;

-- ------------------------------------------------------------
-- 4) Backfill: un movimiento 'opening' por cada part con los
--    valores actuales (solo si el part aún no tiene 'opening')
-- ------------------------------------------------------------
INSERT INTO stock_movement (part_id, kind, on_hand_delta, committed_delta, note)
SELECT p.id, 'opening', COALESCE(p.stock, 0), COALESCE(p.committed_units, 0), 'backfill inicial'
FROM part p
WHERE NOT EXISTS (
    SELECT 1 FROM stock_movement m
    WHERE m.part_id = p.id AND m.kind = 'opening'
);

-- ------------------------------------------------------------
-- 5) Row Level Security
-- ------------------------------------------------------------
ALTER TABLE stock_movement ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can select stock_movement" ON stock_movement;
CREATE POLICY "Authenticated users can select stock_movement"
    ON stock_movement FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert stock_movement" ON stock_movement;
CREATE POLICY "Authenticated users can insert stock_movement"
    ON stock_movement FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Los movimientos son append-only: no se permite update ni delete por RLS
-- (no se crean políticas de UPDATE/DELETE).

-- ------------------------------------------------------------
-- 6) Verificación (correr manualmente tras aplicar)
--    La suma del ledger debe coincidir con la cache de part.
-- ------------------------------------------------------------
-- SELECT p.id, p.stock, p.committed_units,
--        SUM(m.on_hand_delta)   AS ledger_on_hand,
--        SUM(m.committed_delta) AS ledger_committed
-- FROM part p
-- JOIN stock_movement m ON m.part_id = p.id
-- GROUP BY p.id, p.stock, p.committed_units
-- HAVING p.stock <> SUM(m.on_hand_delta)
--     OR p.committed_units <> SUM(m.committed_delta);
