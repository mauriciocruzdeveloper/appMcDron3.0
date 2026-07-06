## Why
`selectPuedeAvanzarA` decide que botones de cambio de estado se muestran usando una regla
permisiva ("etapa destino > etapa actual"), que contradice el mapa de dominio
`transicionesPermitidas` (usecases/estadosReparacion.ts). Por eso la UI ofrece transiciones
invalidas como Aceptado -> Finalizado, salteando `Reparado`. Efecto colateral grave: al
saltear `Reparado` no se descuenta el stock (el consumo solo ocurre en la transicion a
Reparado), dejando inventario inconsistente.

## What Changes
- `selectPuedeAvanzarA` SHALL considerar valida una transicion solo si tambien lo es segun
  `esTransicionValida` (interseccion). No se agregan transiciones nuevas; solo se eliminan
  las que el mapa de dominio no permite.
- `cambiarEstadoReparacionAsync` SHALL rechazar transiciones que no cumplan
  `esTransicionValida` (defensa en profundidad ante cualquier via de UI).
- Consecuencia: no se puede llegar a Cobrado/Enviado/Finalizado sin pasar por Reparado
  (o por la via Rechazado -> Diagnosticado), garantizando que el consumo de stock ocurra.

## Impact
- Affected specs: reparaciones-intervenciones (transiciones)
- Affected code:
  - `src/redux-tool-kit/reparacion/reparacion.selectors.ts` (`selectPuedeAvanzarA`)
  - `src/redux-tool-kit/reparacion/reparacion.actions.ts` (`cambiarEstadoReparacionAsync`)
