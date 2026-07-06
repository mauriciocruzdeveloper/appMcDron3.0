## 1. Fase 1 - Rename de dominio (codigo)
- [x] 1.1 `src/types/repuesto.ts`: `UnidadesPedidas` -> `UnidadesComprometidas`
- [x] 1.2 Actualizar slice/selectores/acciones de repuesto
- [x] 1.3 Actualizar `reparacion.actions.ts` y `reparacion.selectors.ts`
- [x] 1.4 Actualizar `pedidoRepuesto.actions.ts`
- [x] 1.5 Actualizar UI (`Repuesto.component.tsx`, etiquetas)
- [x] 1.6 Persistencia: mapear campo nuevo desde columna `backorder` (temporal)

## 2. Fase 2 - Migracion BD
- [ ] 2.1 SQL: `RENAME COLUMN backorder TO committed_units`
- [ ] 2.2 SQL: crear tabla `stock_movement` + indices + RLS
- [ ] 2.3 SQL: crear RPC `apply_stock_movement`
- [ ] 2.4 SQL: backfill `opening` por cada part
- [ ] 2.5 Aplicar en DEV y verificar sumas del ledger vs cache

## 3. Fase 3 - Persistencia
- [x] 3.1 Mapear `committed_units` en repuestosPersistencia
- [x] 3.2 Agregar `aplicarMovimientoStockPersistencia` (llama RPC) y exportarla

## 4. Fase 4 - Dominio por eventos
- [x] 4.1 Reserva al aceptar (reservation)
- [x] 4.2 Liberacion al salir/rechazar/eliminar (release)
- [x] 4.3 Consumo al reparar (consumption)
- [x] 4.4 Recepcion al arribar pedido (reception)
- [x] 4.5 Ajuste manual (adjustment) — accion `ajustarStockManualAsync`
- [x] 4.6 Retirar `recalcularUnidadesPedidasDesdeReparacionesAceptadas`

## 5. Fase 5 - Validacion
- [ ] 5.1 Verificar selectores de faltante con nuevo campo
- [x] 5.2 Wire UI: campos Stock/Comprometido de solo lectura + usar ajuste manual (evitar bypass del ledger)
- [ ] 5.3 Aplicar migracion en DEV y validacion manual de todos los flujos
- [ ] 5.4 Verificar auditoria: ledger reproduce stock/committed
