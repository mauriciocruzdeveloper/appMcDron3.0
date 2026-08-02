## Why
Hoy el estado del pedido puede elegirse manualmente, pero el flujo real del negocio depende de datos concretos del pedido. Eso genera inconsistencias entre el estado visible y la información cargada.

## What Changes
- El estado del pedido dejará de seleccionarse manualmente en la edición.
- Al dar de alta un pedido sin número de seguimiento ni fecha de llegada, el estado será automáticamente `pending`.
- Si el pedido tiene número de seguimiento, el estado será automáticamente `in_transit`.
- Si el pedido tiene fecha de llegada, el estado será automáticamente `arrived`.
- Se agregará una acción explícita para cancelar un pedido, que lo dejará en `cancelled`.

## Impact
- Affected specs: pedidos de repuestos
- Affected code: `src/components/Pedido.component.tsx`, `src/redux-tool-kit/pedidoRepuesto/*.ts`, `src/types/pedidoRepuesto.ts`, vistas de listado y detalle de pedidos
