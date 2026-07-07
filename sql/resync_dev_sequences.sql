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

-- drone
SELECT setval(
  pg_get_serial_sequence('public.drone', 'id'),
  COALESCE((SELECT MAX(id) FROM public.drone), 0) + 1,
  false
);

-- intervention
SELECT setval(
  pg_get_serial_sequence('public.intervention', 'id'),
  COALESCE((SELECT MAX(id) FROM public.intervention), 0) + 1,
  false
);

-- part_intervention
SELECT setval(
  pg_get_serial_sequence('public.part_intervention', 'id'),
  COALESCE((SELECT MAX(id) FROM public.part_intervention), 0) + 1,
  false
);

-- part
SELECT setval(
  pg_get_serial_sequence('public.part', 'id'),
  COALESCE((SELECT MAX(id) FROM public.part), 0) + 1,
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
  'drone' AS table_name,
  MAX(id) AS max_id,
  (SELECT last_value FROM public.drone_id_seq) AS seq_last_value
FROM public.drone
UNION ALL
SELECT
  'intervention' AS table_name,
  MAX(id) AS max_id,
  (SELECT last_value FROM public.intervention_id_seq) AS seq_last_value
FROM public.intervention
UNION ALL
SELECT
  'part_intervention' AS table_name,
  MAX(id) AS max_id,
  (SELECT last_value FROM public.part_intervention_id_seq) AS seq_last_value
FROM public.part_intervention
UNION ALL
SELECT
  'part' AS table_name,
  MAX(id) AS max_id,
  (SELECT last_value FROM public.part_id_seq) AS seq_last_value
FROM public.part
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
