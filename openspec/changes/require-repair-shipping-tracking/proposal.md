## Why
Hoy una reparacion puede marcarse como Enviado aunque el numero de seguimiento este vacio,
lo que deja el envio sin una referencia consultable. Ademas, los codigos de Andreani no se
identifican ni ofrecen un acceso directo al seguimiento desde la reparacion.

## What Changes
- La transicion a Enviado SHALL requerir un `SeguimientoEntregaRep` con contenido distinto
  de espacios, tanto en la disponibilidad de la accion en UI como en el thunk que aplica el
  cambio de estado.
- Un seguimiento normalizado de exactamente 15 digitos SHALL identificarse como Andreani.
- Cuando se detecte Andreani, la seccion de entrega SHALL mostrar una leyenda y un boton para
  abrir el seguimiento oficial de Andreani en una pestaña nueva.
- Los seguimientos no identificados como Andreani continuaran guardandose normalmente, sin
  mostrar la leyenda ni el boton especifico.

## Impact
- Affected specs: reparaciones-entrega
- Affected code:
  - `src/redux-tool-kit/reparacion/reparacion.selectors.ts`
  - `src/redux-tool-kit/reparacion/reparacion.actions.ts`
  - `src/components/Reparacion/sections/ReparacionEntrega.tsx`
  - `src/utils/tracking.ts`
  - tests de selectores, acciones, componente y helpers de seguimiento
