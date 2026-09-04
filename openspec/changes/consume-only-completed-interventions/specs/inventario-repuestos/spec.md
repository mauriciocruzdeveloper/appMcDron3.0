## MODIFIED Requirements

### Requirement: Compromiso y consumo por evento
El sistema SHALL gestionar el compromiso mediante movimientos por evento y SHALL emitir
consumo físico únicamente por intervenciones completadas.

#### Scenario: Reserva al aceptar
- **WHEN** una reparación pasa a Aceptado o Repuestos
- **THEN** el sistema emite movimientos `reservation` con `committed_delta` positivo por los repuestos de todas sus intervenciones asignadas

#### Scenario: Liberación al salir sin reparar
- **WHEN** una reparación comprometida sale a un estado no reparado o se elimina
- **THEN** el sistema emite movimientos `release` con `committed_delta` negativo por sus repuestos

#### Scenario: Consumo al reparar
- **WHEN** una reparación pasa a Reparado
- **THEN** el sistema emite movimientos `consumption` con `on_hand_delta` y `committed_delta` negativos por los repuestos de sus intervenciones completadas
- **AND** emite movimientos `release` solo con `committed_delta` negativo por los repuestos de sus intervenciones no completadas

#### Scenario: Repuesto compartido por intervenciones con distinto estado
- **WHEN** un repuesto es requerido por intervenciones completadas y no completadas de la misma reparación
- **AND** la reparación pasa a Reparado
- **THEN** el movimiento `consumption` incluye únicamente la cantidad requerida por las intervenciones completadas
- **AND** el movimiento `release` incluye únicamente la cantidad requerida por las intervenciones no completadas

#### Scenario: Recepción de pedido
- **WHEN** un pedido pasa a arrived por primera vez
- **THEN** el sistema emite movimientos `reception` con `on_hand_delta` positivo por cada item