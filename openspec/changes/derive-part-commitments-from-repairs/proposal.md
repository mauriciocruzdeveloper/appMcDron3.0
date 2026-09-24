## Why

`part.committed_units` se mantiene hoy como un acumulador de movimientos `reservation`,
`release` y `consumption`. El movimiento y el cambio funcional que lo origina no comparten
una unica transaccion ni una clave de idempotencia, por lo que un fallo parcial, un reintento
o dos operaciones concurrentes pueden dejar compromiso duplicado o huerfano.

Ademas, las acciones y los selectores no usan actualmente la misma definicion de demanda:
las acciones leen cantidades de `repair_intervention.parts_snapshot`, mientras algunas
vistas usan el catalogo actual y el precio de piezas. El resultado puede no corresponder con
las reparaciones activas que el usuario observa.

## What Changes

- Derivar las unidades comprometidas desde las reparaciones en `Aceptado` o `Repuestos` y
  las cantidades congeladas en `repair_intervention.parts_snapshot`.
- Incorporar una marca explicita en la asignacion que indique si sus repuestos son provistos
  por el taller; no usar `parts_cost` como sustituto de esa decision de negocio.
- Cargar desde persistencia las asignaciones candidatas como datos crudos y mantenerlas en
  Redux como read model; un selector deriva el compromiso agregado y los demas selectores
  calculan stock libre, faltantes y estados visuales.
- Dejar de emitir movimientos `reservation` y `release`, y dejar de modificar compromiso en
  los movimientos `consumption`. El ledger continua siendo la fuente de verdad del stock
  fisico y conserva los movimientos historicos para auditoria.
- Retirar `part.committed_units` como fuente operativa. La columna se mantiene deprecada
  durante una transicion y se elimina en una migracion posterior una vez verificado el nuevo
  read model.
- Reconciliar la salida inicial comparando compromiso derivado, cache anterior y saldo
  historico del ledger, sin convertir diferencias antiguas en demanda vigente.

## Impact

- Affected specs: `inventario-repuestos`, `reparaciones-intervenciones`
- Affected code:
  - `sql/` - marca explicita de inclusion y vista/RPC de compromiso derivado
  - `src/persistencia/` - consulta y mapeo del read model
  - `src/redux-tool-kit/reparacion/` - retiro de reserva/liberacion por eventos
  - `src/redux-tool-kit/repuesto/` - estado derivado y selectores de disponibilidad
  - componentes de reparacion y repuestos que muestran compromiso o faltantes
- Data migration: inferencia inicial de la marca de inclusion y reporte de filas ambiguas
- Compatibility: los movimientos historicos permanecen append-only, pero dejan de definir
  el compromiso vigente

## Success Criteria

- Para cada repuesto, el compromiso mostrado coincide con la suma de snapshots incluidos de
  reparaciones actualmente en `Aceptado` o `Repuestos`.
- Repetir una transicion, reintentar una solicitud o abrir la app en varios dispositivos no
  puede incrementar el compromiso por duplicado.
- Agregar, excluir o eliminar una asignacion cambia el compromiso derivado sin movimientos
  compensatorios.
- Stock fisico y consumo conservan su trazabilidad en `stock_movement`.
- Existe una consulta de auditoria que identifica diferencias durante la migracion.
