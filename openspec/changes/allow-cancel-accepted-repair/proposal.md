## Why
Cuando el cliente acepta el presupuesto y luego decide no reparar, el sistema no ofrecía
una salida coherente: la UI bloqueaba Aceptado -> Rechazado y no exponía la cancelación.
Además, el mapa de dominio permitía Aceptado -> Rechazado, contradiciendo el selector
que lo bloqueaba (incoherencia entre `transicionesPermitidas` y `selectPuedeAvanzarA`).

## What Changes
- Se elimina `Rechazado` de las transiciones permitidas desde `Aceptado`: el rechazo del
  presupuesto es exclusivo del flujo previo a la aceptación (Presupuestado -> Rechazado).
- La salida de una reparación aceptada que no se va a realizar es `Cancelado` (o
  `Abandonado`), estados terminales existentes.
- La UI de presupuesto ofrece el botón "Cancelar Reparación" cuando la transición a
  `Cancelado` es válida (incluye estado Aceptado).
- Sin cambios de stock: `cambiarEstadoReparacionAsync` ya libera el compromiso de
  repuestos al salir de Aceptado/Repuestos hacia un estado no reparativo.

## Impact
- Affected specs: reparaciones-intervenciones (transiciones)
- Affected code:
  - `src/usecases/estadosReparacion.ts` (mapa `transicionesPermitidas`)
  - `src/redux-tool-kit/reparacion/reparacion.selectors.ts` (`selectPuedeAvanzarA`, comentario de regla)
  - `src/components/Reparacion/sections/ReparacionPresupuesto.tsx` (botón Cancelar)
  - `src/usecases/estadosReparacion.test.ts` (tests de la regla)
