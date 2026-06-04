-- ============================================================
-- RESYNC DE SECUENCIAS (DEV)
-- Fecha: 2026-06-04
-- Uso: ejecutar en Supabase SQL Editor (entorno de desarrollo)
-- Objetivo: evitar errores 23505 por PK duplicada cuando las secuencias
-- quedan por debajo del MAX(id) luego de seed/import con ids explicitos.
-- ============================================================

BEGIN;

-- repair
SELECT setval(
  pg_get_serial_sequence('public.repair', 'id'),
  COALESCE((SELECT MAX(id) FROM public.repair), 0) + 1,
  false
);

-- repair_intervention
SELECT setval(
  pg_get_serial_sequence('public.repair_intervention', 'id'),
  COALESCE((SELECT MAX(id) FROM public.repair_intervention), 0) + 1,
  false
);

-- purchase_order
SELECT setval(
  pg_get_serial_sequence('public.purchase_order', 'id'),
  COALESCE((SELECT MAX(id) FROM public.purchase_order), 0) + 1,
  false
);

-- purchase_order_item
SELECT setval(
  pg_get_serial_sequence('public.purchase_order_item', 'id'),
  COALESCE((SELECT MAX(id) FROM public.purchase_order_item), 0) + 1,
  false
);

-- messages
SELECT setval(
  pg_get_serial_sequence('public.messages', 'id'),
  COALESCE((SELECT MAX(id) FROM public.messages), 0) + 1,
  false
);

COMMIT;

-- Verificacion opcional de estado de secuencias
SELECT
  'repair' AS table_name,
  MAX(id) AS max_id,
  (SELECT last_value FROM public.repair_id_seq) AS seq_last_value
FROM public.repair
UNION ALL
SELECT
  'repair_intervention' AS table_name,
  MAX(id) AS max_id,
  (SELECT last_value FROM public.repair_intervention_id_seq) AS seq_last_value
FROM public.repair_intervention
UNION ALL
SELECT
  'purchase_order' AS table_name,
  MAX(id) AS max_id,
  (SELECT last_value FROM public.purchase_order_id_seq) AS seq_last_value
FROM public.purchase_order
UNION ALL
SELECT
  'purchase_order_item' AS table_name,
  MAX(id) AS max_id,
  (SELECT last_value FROM public.purchase_order_item_id_seq) AS seq_last_value
FROM public.purchase_order_item
UNION ALL
SELECT
  'messages' AS table_name,
  MAX(id) AS max_id,
  (SELECT last_value FROM public.messages_id_seq) AS seq_last_value
FROM public.messages;
