-- ============================================================
-- MIGRACIÓN: Crear tablas de pedidos de repuestos
-- Fecha: 2026-05-09
-- ============================================================

-- Tabla principal de pedidos
CREATE TABLE IF NOT EXISTS purchase_order (
    id          BIGSERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL,          -- ID hardcodeado del proveedor (ver constantes)
    supplier_name TEXT NOT NULL,           -- Nombre del proveedor (denormalizado para simplicidad)
    order_date  DATE NOT NULL DEFAULT CURRENT_DATE,
    estimated_arrival DATE,               -- Fecha estimada de llegada
    actual_arrival DATE,                  -- Fecha real de llegada
    status      TEXT NOT NULL DEFAULT 'pending', -- pending | in_transit | arrived | cancelled
    tracking_number TEXT,                 -- Número de seguimiento
    notes       TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de ítems del pedido
CREATE TABLE IF NOT EXISTS purchase_order_item (
    id                  BIGSERIAL PRIMARY KEY,
    purchase_order_id   BIGINT NOT NULL REFERENCES purchase_order(id) ON DELETE CASCADE,
    part_id             BIGINT REFERENCES part(id) ON DELETE SET NULL,   -- puede ser NULL si el repuesto fue eliminado
    part_name           TEXT NOT NULL,   -- nombre denormalizado para historial
    quantity            INTEGER NOT NULL CHECK (quantity > 0),
    unit_price          NUMERIC(12, 2),  -- precio unitario en moneda local
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_purchase_order_status ON purchase_order(status);
CREATE INDEX IF NOT EXISTS idx_purchase_order_item_order ON purchase_order_item(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_item_part ON purchase_order_item(part_id);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_purchase_order_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_purchase_order_updated_at ON purchase_order;
CREATE TRIGGER trg_purchase_order_updated_at
    BEFORE UPDATE ON purchase_order
    FOR EACH ROW EXECUTE FUNCTION update_purchase_order_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- Solo usuarios autenticados pueden operar sobre pedidos.
-- La restricción de rol admin se aplica en el frontend (RoleGuard).
-- ============================================================

ALTER TABLE purchase_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_item ENABLE ROW LEVEL SECURITY;

-- purchase_order: acceso completo para usuarios autenticados
CREATE POLICY "Authenticated users can select purchase_order"
    ON purchase_order FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert purchase_order"
    ON purchase_order FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update purchase_order"
    ON purchase_order FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete purchase_order"
    ON purchase_order FOR DELETE
    TO authenticated
    USING (true);

-- purchase_order_item: acceso completo para usuarios autenticados
CREATE POLICY "Authenticated users can select purchase_order_item"
    ON purchase_order_item FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert purchase_order_item"
    ON purchase_order_item FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update purchase_order_item"
    ON purchase_order_item FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete purchase_order_item"
    ON purchase_order_item FOR DELETE
    TO authenticated
    USING (true);
