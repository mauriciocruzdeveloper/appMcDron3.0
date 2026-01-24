-- Script para agregar el campo de estado a las asignaciones de intervención
-- Este campo permite marcar las tareas como completadas o pendientes

-- Agregar columna status con valor por defecto 'pendiente'
ALTER TABLE repair_intervention
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pendiente' NOT NULL;

-- Actualizar asignaciones según el estado de la reparación:
-- - 'completada' si la reparación está en estados finales (Reparado, Finalizado, etc.)
-- - 'pendiente' si la reparación está en proceso

-- Marcar como completada las asignaciones de reparaciones finalizadas
UPDATE repair_intervention ri
SET status = 'completada'
FROM repair r
WHERE ri.repair_id = r.id
  AND r.state IN (
    'Reparado',      -- Reparación completada técnicamente
    'Cobrado',       -- Cobrada al cliente
    'Enviado',       -- Enviada de vuelta
    'Finalizado',    -- Proceso finalizado
    'Entregado'      -- Estado legacy de entrega
  )
  AND (ri.status IS NULL OR ri.status = 'pendiente');

-- Asegurar que el resto están en pendiente
UPDATE repair_intervention
SET status = 'pendiente'
WHERE status IS NULL;

-- Crear índice para mejorar queries por estado
CREATE INDEX IF NOT EXISTS idx_repair_intervention_status ON repair_intervention(status);

-- Verificar resultados
SELECT 
  ri.id,
  ri.repair_id,
  i.name as intervention_name,
  ri.status,
  ri.labor_cost,
  ri.parts_cost,
  ri.total_cost
FROM repair_intervention ri
JOIN intervention i ON i.id = ri.intervention_id
ORDER BY ri.repair_id, ri.id;
