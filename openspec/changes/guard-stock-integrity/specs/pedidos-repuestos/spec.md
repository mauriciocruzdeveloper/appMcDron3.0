## ADDED Requirements

### Requirement: Inmutabilidad de pedidos recibidos
El sistema SHALL impedir editar o eliminar un pedido que ya esta en estado `arrived`,
para preservar la integridad del stock que ese pedido sumo al recibirse.

#### Scenario: Intento de editar pedido arrived
- **WHEN** se intenta guardar un pedido cuyo estado previo ya era `arrived`
- **THEN** el sistema rechaza la operacion
- **AND** no modifica `StockRepu`

#### Scenario: Intento de eliminar pedido arrived
- **WHEN** se intenta eliminar un pedido en estado `arrived`
- **THEN** el sistema rechaza la operacion
- **AND** no modifica `StockRepu`

#### Scenario: UI de pedido arrived
- **WHEN** se abre un pedido en estado `arrived`
- **THEN** la UI muestra los campos en solo lectura
- **AND** oculta las acciones de guardar y eliminar
- **AND** informa que el pedido recibido no es editable
