## Why
Cuando un pedido de repuestos pasa al estado "Recibido" (`arrived`), las cantidades pedidas
deben sumarse automáticamente al stock de cada repuesto. Hoy esto no ocurre y el usuario
debe actualizar el stock manualmente.

## What Changes
- Al guardar un pedido que **pasa a `arrived`** (y antes no lo era), se incrementa `StockRepu`
  de cada ítem con `RepuestoId` válido en la cantidad `Cantidad` del ítem.
- El incremento es atómico por repuesto: se obtiene el repuesto actual, se le suma la cantidad
  y se guarda.
- Si el pedido ya estaba en `arrived` y se vuelve a guardar, NO se vuelve a incrementar el stock.
- El store de Redux refleja inmediatamente los nuevos valores de stock.

## Impact
- Affected specs: `pedidos-repuestos` (nuevo delta en `add-repuestos-state`)
- Affected code:
  - `src/redux-tool-kit/pedidoRepuesto/pedidoRepuesto.actions.ts` — lógica principal
