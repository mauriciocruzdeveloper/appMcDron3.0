## Why
Al marcar una reparación como `Reparado` mediante la resolución alternativa, el sistema
consume actualmente los repuestos de todas las intervenciones asignadas, incluso de las
que permanecen pendientes. Esto reduce el stock físico por trabajos que no se realizaron.

## What Changes
- Consumir stock físico únicamente por los repuestos de asignaciones de intervención con
  estado `completada` cuando la reparación pasa a `Reparado`.
- Liberar el compromiso, sin descontar stock físico, correspondiente a las asignaciones
  que no estén completadas.
- Mantener la reserva inicial de repuestos para todas las intervenciones asignadas al
  aceptar el presupuesto.
- Consolidar por separado consumo y liberación cuando un mismo repuesto pertenezca a
  intervenciones completadas y pendientes.
- Mantener la regla existente para repuestos sin stock disponible: liberar su compromiso
  sin generar consumo físico.

## Impact
- Affected specs: `reparaciones-intervenciones`, `inventario-repuestos`
- Affected code:
  - `src/redux-tool-kit/reparacion/reparacion.actions.ts`
  - pruebas del flujo de stock al cambiar una reparación a `Reparado`
- Sin cambios de esquema, persistencia ni interfaz.
