# Diseño: Ledger de inventario + rename

## 1. Modelo de datos

### Tabla `stock_movement` (append-only, fuente de verdad)
| Columna         | Tipo         | Notas |
|-----------------|--------------|-------|
| id              | BIGSERIAL PK | |
| part_id         | BIGINT FK    | REFERENCES part(id) ON DELETE CASCADE |
| kind            | TEXT         | 'opening' \| 'reception' \| 'reservation' \| 'release' \| 'consumption' \| 'adjustment' |
| on_hand_delta   | INTEGER      | delta al stock fisico (puede ser 0) |
| committed_delta | INTEGER      | delta al comprometido (puede ser 0) |
| reference_type  | TEXT NULL    | 'purchase_order' \| 'repair' \| 'manual' |
| reference_id    | BIGINT NULL  | id del pedido/reparacion (si aplica) |
| note            | TEXT NULL    | |
| created_at      | TIMESTAMPTZ  | DEFAULT NOW() |

Semantica de cada `kind`:
- `opening`      : backfill inicial (on_hand_delta = stock actual, committed_delta = backorder actual)
- `reception`    : pedido arrived → on_hand_delta = +cantidad, committed_delta = 0
- `reservation`  : reparacion entra a comprometido → committed_delta = +demanda, on_hand_delta = 0
- `release`      : reparacion sale sin reparar / se elimina / se rechaza → committed_delta = -demanda
- `consumption`  : reparacion pasa a Reparado → on_hand_delta = -demanda, committed_delta = -demanda
- `adjustment`   : correccion manual (merma/conteo) → on_hand_delta = ±n

### Columnas cacheadas en `part`
- `stock`            (on-hand)  — se mantiene existente
- `committed_units`  (reservado) — RENAME desde `backorder`

Invariante: `part.stock = SUM(on_hand_delta)` y `part.committed_units = SUM(committed_delta)`
por `part_id`. Las columnas cacheadas permiten lecturas rapidas; el ledger permite auditar y
reconstruir.

## 2. RPC atomico
```sql
apply_stock_movement(
  p_part_id BIGINT,
  p_on_hand_delta INTEGER,
  p_committed_delta INTEGER,
  p_kind TEXT,
  p_reference_type TEXT,
  p_reference_id BIGINT,
  p_note TEXT
) RETURNS part
```
- Inserta la fila en `stock_movement`.
- `UPDATE part SET stock = stock + p_on_hand_delta,
   committed_units = GREATEST(0, committed_units + p_committed_delta) WHERE id = p_part_id`.
- Devuelve el `part` actualizado.
- Todo dentro de la misma funcion (transaccion implicita) → sin condiciones de carrera.

## 3. Cambio de logica de compromiso (de recomputo global a eventos)
Hoy: `recalcularUnidadesPedidasDesdeReparacionesAceptadas` recorre todo el store y reescribe.
Nuevo: cada transicion emite movimientos solo para la reparacion afectada:
- Presupuestado → Aceptado/Repuestos: por cada repuesto de sus intervenciones → `reservation` (+n)
- Aceptado/Repuestos → estado no reparado (incl. rechazo y eliminacion): → `release` (-n)
- Aceptado → Reparado: → `consumption` (-n on_hand, -n committed)
- Pedido → arrived (primera vez): por item → `reception` (+cantidad)

La demanda por reparacion se obtiene de sus intervenciones (igual que hoy con
`obtenerCompromisoPorRepuestoDeReparacion`), pero el resultado se aplica como delta, no como
valor absoluto global.

## 4. Migracion y backfill
1. `ALTER TABLE part RENAME COLUMN backorder TO committed_units;`
2. `CREATE TABLE IF NOT EXISTS stock_movement (...)` + indices + RLS.
3. `CREATE OR REPLACE FUNCTION apply_stock_movement(...)`.
4. Backfill: `INSERT INTO stock_movement (part_id, kind, on_hand_delta, committed_delta, note)
   SELECT id, 'opening', stock, committed_units, 'backfill inicial' FROM part;`

## 5. Fases de implementacion
- **Fase 1 (codigo)**: rename `UnidadesPedidas` → `UnidadesComprometidas` en tipos, slice,
  selectores, acciones y UI (mapeo persistencia sigue leyendo `backorder` temporalmente).
- **Fase 2 (BD)**: migracion rename columna + tabla `stock_movement` + RPC + backfill (DEV primero).
- **Fase 3 (persistencia)**: mapear `committed_units`; agregar `aplicarMovimientoStockPersistencia` (RPC).
- **Fase 4 (dominio)**: reescribir acciones de stock para emitir movimientos por evento.
- **Fase 5**: validar selectores/UI, ajuste manual, pruebas.

## 6. Compatibilidad
- Mientras Fase 2 no este aplicada, el mapeo de persistencia lee/escribe `backorder`.
- Tras Fase 2, se cambia el mapeo a `committed_units` en un unico commit coordinado.
