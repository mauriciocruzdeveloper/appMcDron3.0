## Why
El inventario hoy guarda dos numeros mutables en `part` (`stock` y `backorder`) y el
compromiso se recalcula "desde cero" leyendo todo el store. Eso genera drift, condiciones
de carrera y backorder fantasma (bugs ya detectados). Ademas el nombre `UnidadesPedidas`
("unidades pedidas") es enganoso: en realidad representa demanda **comprometida/reservada**,
no unidades pedidas a proveedor.

Se busca alinear el modelo con la practica estandar de inventario:
- Renombrar el campo a `UnidadesComprometidas` (columna `committed_units`).
- Introducir un **libro de movimientos** (`stock_movement`) append-only como fuente de
  verdad auditable; `part.stock` y `part.committed_units` pasan a ser valores cacheados
  mantenidos de forma atomica junto a cada movimiento.
- Reemplazar el recalculo global por **eventos** por transicion (reserva, liberacion,
  consumo, recepcion, ajuste manual).

## What Changes
- ADD tabla `stock_movement` (id, part_id, kind, on_hand_delta, committed_delta,
  reference_type, reference_id, note, created_at).
- ADD funcion RPC `apply_stock_movement(...)` que inserta el movimiento y actualiza
  `part.stock` y `part.committed_units` en una transaccion, devolviendo el `part` actualizado.
- RENAME columna `part.backorder` -> `part.committed_units` (con migracion) y campo
  de dominio `UnidadesPedidas` -> `UnidadesComprometidas`.
- CHANGE la logica de compromiso: de recomputo global a movimientos por evento
  ligados a `reference_type='repair'|'purchase_order'|'manual'`.
- ADD accion de ajuste manual de stock (merma/conteo) como movimiento `adjustment`.
- BACKFILL: crear un movimiento de apertura por cada `part` para que la suma del ledger
  coincida con los valores cacheados actuales.

## Impact
- Affected specs: `pedidos-repuestos`, `reparaciones-intervenciones`, `inventario-repuestos` (nuevo)
- Affected code:
  - `sql/` — nueva migracion (rename + tabla + RPC + backfill)
  - `src/types/repuesto.ts` — campo `UnidadesComprometidas`
  - `src/persistencia/persistenciaSupabase/repuestosPersistencia.js` — mapeo `committed_units`, uso de RPC
  - `src/redux-tool-kit/repuesto/*` — slice/selectores/acciones
  - `src/redux-tool-kit/reparacion/reparacion.actions.ts` — reserva/consumo/liberacion por evento
  - `src/redux-tool-kit/pedidoRepuesto/pedidoRepuesto.actions.ts` — recepcion por evento
  - `src/components/Repuesto.component.tsx`, `src/redux-tool-kit/reparacion/reparacion.selectors.ts` — etiquetas/campo

## Riesgos / Notas
- La migracion de BD es **irreversible en produccion**; se aplica primero en DEV y con backfill verificado.
- Se ejecuta por fases; el rename (Fase 1-2) puede ir antes que el ledger (Fase 3-4).
