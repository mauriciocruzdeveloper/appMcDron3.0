# Marcar repuestos como obsoletos

## Por qué
Las intervenciones del catálogo ya soportan un flag `Obsoleta` que las excluye de nuevas asignaciones sin borrar su historial. Los repuestos no tienen ese mecanismo: hoy la única forma de "retirar" un repuesto del catálogo es eliminarlo, lo cual falla si está referenciado por alguna intervención y de todos modos perdería el registro histórico si no lo estuviera.

## Qué cambia
- Se agrega `Obsoleta` (boolean, default `false`) al repuesto, análogo a `Intervencion.Obsoleta`.
- Columna `is_obsolete` en la tabla `part` (Supabase), mapeada igual que `intervention.is_obsolete`.
- UI de `Repuesto.component.tsx`: switch "Marcar como obsoleto" (igual al de Intervención).
- `ListaRepuestos.component.tsx`: badge "Obsoleto" cuando corresponda (igual al de `ListaIntervenciones`).
- Regla de negocio centralizada en selectores (no en los componentes):
  - `selectRepuestosSeleccionables` (repuesto.selectors.ts): excluye repuestos obsoletos de las opciones nuevas, salvo que ya estuvieran elegidos en ese formulario (para no romper el valor mostrado).
  - `selectIntervencionesAsignables` (intervencion.selectors.ts): excluye intervenciones obsoletas de las opciones para asignar a una reparación.
- Puntos de uso de esos selectores:
  - `Intervencion.component.tsx`: repuestos seleccionables para la intervención.
  - `Pedido.component.tsx`: repuesto a pedir en cada ítem del pedido.
  - `IntervencionesReparacion.component.tsx`: intervención a asignar a una reparación.
- No se modifica el cálculo de stock/estado del repuesto: un repuesto obsoleto conserva su stock, ledger e historial tal cual.

## Impacto
- Specs afectadas: `inventory-repuestos` (nueva capability delta).
- Código: `src/types/repuesto.ts`, `src/components/Repuesto.component.tsx`, `src/components/ListaRepuestos.component.tsx`, `src/components/Intervencion.component.tsx`, `src/persistencia/persistenciaSupabase/repuestosPersistencia.js`.
- SQL: nueva migración `migration_add_is_obsolete_to_part.sql`.
- Sin impacto en reglas de stock/pedidos existentes.
