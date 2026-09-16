BEGIN;

ALTER TABLE public.repair_intervention
  ADD COLUMN IF NOT EXISTS origin VARCHAR(20) NOT NULL DEFAULT 'presupuestada',
  ADD COLUMN IF NOT EXISTS parts_snapshot JSONB;

UPDATE public.repair_intervention ri
SET parts_snapshot = COALESCE((
  SELECT jsonb_agg(
    jsonb_build_object(
      'partId', pi.part_id::text,
      'quantity', COALESCE(pi.quantity, 1)
    )
    ORDER BY pi.id
  )
  FROM public.part_intervention pi
  WHERE pi.intervention_id = ri.intervention_id
), '[]'::jsonb)
WHERE ri.parts_snapshot IS NULL;

ALTER TABLE public.repair_intervention
  ALTER COLUMN parts_snapshot SET DEFAULT '[]'::jsonb,
  ALTER COLUMN parts_snapshot SET NOT NULL;

ALTER TABLE public.repair_intervention
  DROP CONSTRAINT IF EXISTS repair_intervention_origin_check;

ALTER TABLE public.repair_intervention
  ADD CONSTRAINT repair_intervention_origin_check
  CHECK (origin IN ('presupuestada', 'adicional'));

ALTER TABLE public.repair_intervention
  DROP CONSTRAINT IF EXISTS repair_intervention_parts_snapshot_array_check;

ALTER TABLE public.repair_intervention
  ADD CONSTRAINT repair_intervention_parts_snapshot_array_check
  CHECK (jsonb_typeof(parts_snapshot) = 'array');

CREATE INDEX IF NOT EXISTS idx_repair_intervention_origin
  ON public.repair_intervention(origin);

COMMENT ON COLUMN public.repair_intervention.origin IS
  'Origen de la asignación: presupuestada o adicional durante la reparación';
COMMENT ON COLUMN public.repair_intervention.parts_snapshot IS
  'Snapshot inmutable de repuestos [{partId, quantity}] al crear la asignación';

COMMIT;