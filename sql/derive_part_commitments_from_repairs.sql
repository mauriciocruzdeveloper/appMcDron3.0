BEGIN;

ALTER TABLE public.repair_intervention
  ADD COLUMN IF NOT EXISTS includes_workshop_parts BOOLEAN;

UPDATE public.repair_intervention
SET includes_workshop_parts = CASE
  WHEN origin = 'adicional'
    AND jsonb_array_length(COALESCE(parts_snapshot, '[]'::jsonb)) > 0 THEN TRUE
  WHEN origin = 'presupuestada' AND COALESCE(parts_cost, 0) > 0 THEN TRUE
  ELSE FALSE
END
WHERE includes_workshop_parts IS NULL;

ALTER TABLE public.repair_intervention
  ALTER COLUMN includes_workshop_parts SET DEFAULT TRUE,
  ALTER COLUMN includes_workshop_parts SET NOT NULL;

COMMENT ON COLUMN public.repair_intervention.includes_workshop_parts IS
  'Indica si el taller provee los repuestos congelados en parts_snapshot';

COMMIT;

-- Casos historicos ambiguos: revisar antes del corte. Un precio cero puede
-- representar una pieza gratuita o una pieza provista por el cliente.
SELECT
  ri.id AS assignment_id,
  ri.repair_id,
  ri.intervention_id,
  ri.origin,
  ri.parts_cost,
  ri.parts_snapshot,
  ri.includes_workshop_parts
FROM public.repair_intervention ri
WHERE COALESCE(ri.parts_cost, 0) = 0
  AND jsonb_array_length(COALESCE(ri.parts_snapshot, '[]'::jsonb)) > 0
ORDER BY ri.repair_id, ri.id;

-- Reconciliacion: compromiso derivado frente al cache y al saldo historico.
WITH active_demand AS (
  SELECT
    (snapshot.item ->> 'partId')::BIGINT AS part_id,
    SUM(COALESCE((snapshot.item ->> 'quantity')::INTEGER, 1)) AS demanded_units
  FROM public.repair_intervention ri
  JOIN public.repair r ON r.id = ri.repair_id
  CROSS JOIN LATERAL jsonb_array_elements(ri.parts_snapshot) AS snapshot(item)
  WHERE r.state IN ('Aceptado', 'Repuestos')
    AND ri.includes_workshop_parts
  GROUP BY (snapshot.item ->> 'partId')::BIGINT
), derived_commitment AS (
  SELECT
    d.part_id,
    LEAST(d.demanded_units, GREATEST(COALESCE(p.stock, 0), 0)) AS committed_units
  FROM active_demand d
  JOIN public.part p ON p.id = d.part_id
), ledger_commitment AS (
  SELECT part_id, SUM(committed_delta) AS committed_units
  FROM public.stock_movement
  GROUP BY part_id
)
SELECT
  p.id AS part_id,
  p.name,
  COALESCE(d.committed_units, 0) AS derived_commitment,
  COALESCE(p.committed_units, 0) AS cached_commitment,
  COALESCE(l.committed_units, 0) AS ledger_commitment
FROM public.part p
LEFT JOIN derived_commitment d ON d.part_id = p.id
LEFT JOIN ledger_commitment l ON l.part_id = p.id
WHERE COALESCE(d.committed_units, 0) <> COALESCE(p.committed_units, 0)
   OR COALESCE(d.committed_units, 0) <> COALESCE(l.committed_units, 0)
ORDER BY p.name, p.id;