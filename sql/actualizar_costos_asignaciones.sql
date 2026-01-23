-- Script para actualizar los costos de repuestos y totales en repair_intervention
-- Este script calcula los precios actuales de los repuestos y actualiza las asignaciones existentes
-- NOTA: parts_cost = 0 es válido para intervenciones sin repuestos, solo actualizamos NULL

-- Actualizar parts_cost y total_cost para todas las asignaciones que tienen parts_cost NULL
UPDATE repair_intervention
SET 
  parts_cost = (
    SELECT COALESCE(SUM(p.price * COALESCE(pi.quantity, 1)), 0)
    FROM part_intervention pi
    JOIN part p ON p.id = pi.part_id
    WHERE pi.intervention_id = repair_intervention.intervention_id
  ),
  total_cost = COALESCE(repair_intervention.labor_cost, 0) + (
    SELECT COALESCE(SUM(p.price * COALESCE(pi.quantity, 1)), 0)
    FROM part_intervention pi
    JOIN part p ON p.id = pi.part_id
    WHERE pi.intervention_id = repair_intervention.intervention_id
  )
WHERE parts_cost IS NULL;

-- Verificar resultados
SELECT 
  ri.id,
  ri.repair_id,
  i.name as intervention_name,
  ri.labor_cost,
  ri.parts_cost,
  ri.total_cost
FROM repair_intervention ri
JOIN intervention i ON i.id = ri.intervention_id
ORDER BY ri.id;
