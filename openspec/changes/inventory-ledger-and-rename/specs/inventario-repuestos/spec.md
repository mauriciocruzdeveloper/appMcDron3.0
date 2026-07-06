## ADDED Requirements

### Requirement: Libro de movimientos como fuente de verdad
El sistema SHALL registrar cada cambio de inventario como un movimiento append-only en
`stock_movement`, y mantener `part.stock` y `part.committed_units` como valores cacheados
consistentes con la suma de movimientos.

#### Scenario: Movimiento atomico
- **WHEN** el sistema aplica un movimiento de stock
- **THEN** inserta una fila en `stock_movement` con `on_hand_delta` y `committed_delta`
- **AND** actualiza `part.stock` y `part.committed_units` en la misma transaccion
- **AND** `committed_units` nunca queda por debajo de cero

#### Scenario: Auditoria reconstruible
- **WHEN** se suman los `on_hand_delta` y `committed_delta` de un repuesto
- **THEN** el resultado coincide con `part.stock` y `part.committed_units`

### Requirement: Ajuste manual de stock
El sistema SHALL permitir un ajuste manual de stock fisico como movimiento `adjustment`.

#### Scenario: Correccion por conteo o merma
- **WHEN** el usuario registra un ajuste manual de stock de un repuesto
- **THEN** el sistema crea un movimiento `adjustment` con el delta indicado
- **AND** actualiza `part.stock` sin modificar `committed_units`

### Requirement: Compromiso y consumo por evento
El sistema SHALL gestionar el compromiso mediante movimientos por evento en lugar de
recomputo global.

#### Scenario: Reserva al aceptar
- **WHEN** una reparacion pasa a Aceptado o Repuestos
- **THEN** el sistema emite movimientos `reservation` (committed_delta positivo) por sus repuestos

#### Scenario: Liberacion al salir sin reparar
- **WHEN** una reparacion comprometida sale a un estado no reparado o se elimina
- **THEN** el sistema emite movimientos `release` (committed_delta negativo) por sus repuestos

#### Scenario: Consumo al reparar
- **WHEN** una reparacion pasa a Reparado
- **THEN** el sistema emite movimientos `consumption` (on_hand_delta y committed_delta negativos)

#### Scenario: Recepcion de pedido
- **WHEN** un pedido pasa a arrived por primera vez
- **THEN** el sistema emite movimientos `reception` (on_hand_delta positivo) por cada item
