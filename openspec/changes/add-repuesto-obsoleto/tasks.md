# Tasks

- [x] Agregar `Obsoleta?: boolean` a `RepuestoData` (`src/types/repuesto.ts`).
- [x] Migración SQL `part.is_obsolete` (default false) + índice, análoga a la de `intervention`.
- [x] Mapear `is_obsolete` <-> `Obsoleta` en `repuestosPersistencia.js` (get, guardar, listado con suscripción, movimiento de stock).
- [x] Switch "Marcar como obsoleto" en `Repuesto.component.tsx`.
- [x] Badge "Obsoleto" en `ListaRepuestos.component.tsx`.
- [x] Selector `selectRepuestosSeleccionables` (repuesto.selectors.ts) que excluye obsoletos salvo que ya estén elegidos.
- [x] Selector `selectIntervencionesAsignables` (intervencion.selectors.ts) que excluye intervenciones obsoletas.
- [x] Usar `selectRepuestosSeleccionables` en `Intervencion.component.tsx` (repuestos de la intervención) y en `Pedido.component.tsx` (repuesto a pedir).
- [x] Usar `selectIntervencionesAsignables` en `IntervencionesReparacion.component.tsx` (intervención a asignar a una reparación).
- [x] Validar que `openspec validate add-repuesto-obsoleto --strict` pase.
