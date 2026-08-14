## Why
Los pedidos de repuestos pueden guardar un número de seguimiento, pero hoy la app no ofrece ninguna forma directa de abrir ese seguimiento ni consultar su estado desde el mismo flujo de compra.

## What Changes
- Se agregará un helper centralizado para construir links directos de 17TRACK a partir del número de seguimiento.
- En el detalle del pedido, si existe un número de seguimiento, se mostrará un enlace para abrirlo directamente en 17TRACK.
- En el listado de pedidos, se habilitará acceso rápido al seguimiento sin entrar al detalle del pedido.
- La consulta automática de estados mediante la API de 17TRACK quedará para una segunda etapa, implementada desde backend para no exponer credenciales en React.

## Impact
- Affected specs: pedidos de repuestos
- Affected code: `src/utils/tracking.ts`, `src/components/Pedido.component.tsx`, `src/components/ListaPedidos.component.tsx`
