BEGIN;

ALTER TABLE "user"
ADD COLUMN IF NOT EXISTS cuit TEXT;

ALTER TABLE purchase_order
ADD COLUMN IF NOT EXISTS customer_cuit TEXT;

COMMENT ON COLUMN "user".cuit IS 'CUIT del cliente para compras internacionales. Campo opcional.';
COMMENT ON COLUMN purchase_order.customer_cuit IS 'CUIT del cliente asociado al pedido. Campo opcional.';

COMMIT;
