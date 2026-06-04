## Why
El modelo anterior mezclaba demanda comprometida y stock fisico disponible, generando
alertas falsas cuando un pedido llegaba justo para cubrir reparaciones activas.
Se necesita separar compromiso de stock libre para reflejar mejor la operacion real.

## What Changes
- Al crear/eliminar asignaciones de intervencion, el sistema NO modifica inventario
  ni compromisos mientras la reparacion siga en Presupuestado.
- Al pasar de Presupuestado a Aceptado, el sistema SHALL comprometer en
  `UnidadesPedidas` la demanda de repuestos de las intervenciones asignadas.
- Si el presupuesto se rechaza, NO se comprometen repuestos.
- Crear un pedido de compra NO modifica compromisos (`UnidadesPedidas`).
- Al pasar pedido a arrived, la cantidad recibida incrementa `StockRepu`
  (stock fisico disponible), sin modificar compromisos.
- Al salir desde Aceptado/Repuestos hacia un estado no reparado (por ejemplo,
  Rechazado, Diagnosticado, Cancelado, Abandonado), el sistema libera
  `UnidadesPedidas` de esa reparacion sin tocar `StockRepu`.
- Al pasar una reparacion a `Reparado`, el sistema descuenta del repuesto la
  cantidad comprometida por esa reparacion en `StockRepu` y `UnidadesPedidas`.
- Los avisos visuales de faltantes se modifican: hay alerta critica solo cuando
  existe faltante real (`StockRepu < UnidadesPedidas`) y no hay pedido activo.
- La logica de dominio se implementa en acciones/selectores/usecases, dejando
  persistencia como capa de acceso a datos.

## Impact
- Affected specs: reparaciones-intervenciones (nuevo delta)
- Affected code:
  - src/redux-tool-kit/reparacion/reparacion.actions.ts
  - src/redux-tool-kit/pedidoRepuesto/pedidoRepuesto.actions.ts
  - src/redux-tool-kit/reparacion/reparacion.selectors.ts
  - src/components/Reparacion/sections/ReparacionRepuestos.tsx
