## Why
Cuando se agrega una intervención adicional en una reparación con presupuesto aceptado, el sistema asume siempre que los repuestos los provee el taller. Si el repuesto lo trajo el cliente o se obtuvo fuera del inventario, no existe forma de excluirlo, lo que genera compromiso/alertas de compra innecesarias y descuenta stock físico al cerrar la reparación.

## What Changes
- Permitir elegir si una intervención adicional usa o no repuestos del taller al momento de agregarla en la sección `REPARAR` (opción activada por defecto cuando la intervención tiene repuestos asociados).
- Mostrar un indicador visual (`Sin repuesto taller`) en la lista `Tareas a Realizar` cuando una asignación con repuestos asociados tiene excluido el uso de repuestos del taller.
- Permitir alternar el uso de repuestos del taller en asignaciones adicionales mientras permanezcan en estado `pendiente` y la reparación esté en `Aceptado` o `Repuestos`, sin alterar `PresuFiRep`.
- Unificar el recálculo de `parts_cost` al alternar la inclusión de repuestos para respetar cantidades y múltiples piezas desde `repuestosSnapshot` (con fallback al catálogo en asignaciones legacy).

## Impact
- Affected specs: `reparaciones-intervenciones`
- Affected code: `src/redux-tool-kit/reparacion/reparacion.actions.ts`, `src/components/Reparacion/sections/ReparacionReparar.tsx` y pruebas unitarias/de componente asociadas.
- Database: sin migraciones nuevas (reutiliza `repair_intervention.includes_workshop_parts` y `parts_snapshot`).
