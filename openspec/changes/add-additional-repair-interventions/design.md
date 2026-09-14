## Context
`repair_intervention` representa una intervención asignada a una reparación, pero actualmente solo guarda precios y estado. La demanda de inventario se reconstruye consultando `part_intervention`, que es el catálogo mutable de repuestos por intervención.

## Goals / Non-Goals
- Goals: registrar intervenciones agregadas durante la reparación, preservar su composición de repuestos y mantener consistente el ledger al agregarlas, quitarlas y completar la reparación.
- Non-Goals: modificar los repuestos de una asignación individual, agregar consumos sin intervención, crear un flujo de autorización comercial o cambiar el modelo de precios.

## Decisions
- `repair_intervention.origin` usa `presupuestada` o `adicional`; las filas existentes se consideran `presupuestada`.
- `repair_intervention.parts_snapshot` guarda un array JSON de objetos `{ partId, quantity }` tomado de `part_intervention` al crear la asignación.
- El cálculo de demanda usa el snapshot. Solo conserva fallback al catálogo para filas legacy que todavía no hayan sido migradas.
- Una asignación `adicional` solo puede crearse en `Aceptado` o `Repuestos`. Al crearla se emite `reservation`; al eliminarla se emite `release` antes de borrarla.
- La asignación adicional conserva sus costos propios para trazabilidad, pero no participa del listado, subtotal, email, PDF ni `PresuFiRep` del presupuesto aceptado.

## Risks / Trade-offs
- La creación de la asignación y el movimiento del ledger son operaciones separadas. Si la reserva falla, la acción elimina compensatoriamente la asignación recién creada y propaga el error.
- Cambiar el catálogo deja de afectar reparaciones ya asignadas, pero los datos anteriores dependen del backfill de la migración.

## Migration Plan
1. Agregar las columnas con defaults compatibles.
2. Completar `parts_snapshot` desde `part_intervention` para filas existentes.
3. Desplegar la aplicación que escribe y consume snapshots.

## Open Questions
- El tratamiento comercial de una intervención adicional seguirá el cálculo actual hasta que se defina un flujo específico de autorización o bonificación.