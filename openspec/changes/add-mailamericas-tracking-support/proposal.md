## Why
Actualmente en los pedidos de repuesto (y en la entrega de reparaciones) los envíos a través de MailAmericas (por ejemplo con número `MLAR048983277EX`) no se identificaban como un transportista específico ni dirigían a la plataforma oficial de seguimiento de MailAmericas.

## What Changes
- Agregar funciones `isMailAmericasTrackingNumber` y `buildMailAmericasTrackingUrl` en `src/utils/tracking.ts`.
- Actualizar `buildTrackingUrl` para resolver URLs directas de MailAmericas cuando el código corresponda a MailAmericas (`https://mailamericas.com/tracking?number_id=<tracking>`).
- En la edición de pedido de repuesto (`Pedido.component.tsx`), detectar envíos de MailAmericas, mostrar la leyenda "Envío MailAmericas detectado" y un botón con acceso directo al tracking de MailAmericas.
- En la lista de pedidos de repuestos (`ListaPedidos.component.tsx`), hacer que el enlace de tracking dirija directamente a MailAmericas para dichos códigos.
- En la sección de entrega de la reparación (`ReparacionEntrega.tsx`), mantener la detección de MailAmericas y botón oficial.

## Impact
- Affected specs: `pedidos-repuesto`, `reparaciones-entrega`
- Affected code:
  - `src/utils/tracking.ts`
  - `src/utils/tracking.test.ts`
  - `src/components/Pedido.component.tsx`
  - `src/components/ListaPedidos.component.tsx`
  - `src/components/Reparacion/sections/ReparacionEntrega.tsx`
