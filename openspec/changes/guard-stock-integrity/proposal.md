## Why
Al validar la logica de stock aparecieron huecos donde el inventario queda inconsistente:
- Eliminar una reparacion en Aceptado/Repuestos no libera el backorder comprometido.
- Se puede eliminar un pedido ya recibido (`arrived`) sin revertir el stock que sumo.
- Se puede editar/revertir un pedido ya recibido, sin ajustar el stock, generando stock fantasma.

## What Changes
- Al eliminar una reparacion en Aceptado o Repuestos, el sistema SHALL liberar el backorder
  (`UnidadesPedidas`) comprometido por esa reparacion, sin tocar `StockRepu`.
- Un pedido en estado `arrived` SHALL quedar bloqueado: no se puede editar ni eliminar
  (ni por UI ni por accion), para preservar la integridad del stock ya sumado.
- La transicion a `arrived` sigue permitida una unica vez (suma stock); despues el pedido
  queda inmutable.

## Impact
- Affected specs: `reparaciones-intervenciones`, `pedidos-repuestos`
- Affected code:
  - `src/redux-tool-kit/reparacion/reparacion.actions.ts` — liberar backorder al eliminar reparacion
  - `src/redux-tool-kit/pedidoRepuesto/pedidoRepuesto.actions.ts` — bloquear editar/eliminar pedido arrived
  - `src/components/Pedido.component.tsx` — UI de solo lectura y sin eliminar para pedidos arrived
