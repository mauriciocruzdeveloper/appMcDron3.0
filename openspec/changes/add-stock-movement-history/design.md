## Context

El stock físico se registra en `stock_movement`. La pantalla de repuesto ya conoce el ID
del repuesto y muestra controles de ajuste, por lo que puede consultar el historial sin
introducir un nuevo read model global.

## Goals / Non-Goals

- Goals: permitir auditoría visual del stock de un repuesto, con una consulta acotada y
  estados de carga/error/ vacío.
- Non-Goals: editar o eliminar movimientos, recalcular stock, modificar comprometidos o
  reemplazar el RPC `apply_stock_movement`.

## Decisions

- La persistencia hará únicamente la query por `part_id`, el ordenamiento y el mapeo DTO.
- La UI usará un `<details>` consistente con el bloque existente de intervenciones asociadas.
- El historial se cargará para repuestos existentes; un repuesto nuevo no tiene movimientos.
- Supabase será la implementación operativa. Firebase conservará una implementación de
  compatibilidad basada en su fuente de movimientos si el backend la expone; si no existe,
  devolverá una lista vacía documentada sin afectar la edición del repuesto.

## Risks / Trade-offs

- Un historial grande puede aumentar la respuesta; se mitigará con límite inicial y orden
  descendente, dejando paginación para una ampliación posterior.
- Movimientos históricos pueden contener deltas comprometidos; la UI mostrará el movimiento
  registrado, pero lo distinguirá del stock físico y no lo usará para calcular comprometidos.