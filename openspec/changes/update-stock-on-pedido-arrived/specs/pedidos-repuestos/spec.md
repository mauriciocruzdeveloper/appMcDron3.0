## ADDED Requirements

### Requirement: Incremento automático de stock al recibir pedido
Cuando un pedido de repuestos pasa al estado `arrived` (Recibido), el sistema
SHALL incrementar automáticamente el `StockRepu` de cada repuesto incluido en el
pedido según la cantidad pedida (`Cantidad`).

#### Scenario: Pedido pasa a arrived por primera vez
- **WHEN** el usuario guarda un pedido cambiando su estado a `arrived` desde cualquier otro estado
- **THEN** por cada ítem del pedido con `RepuestoId` válido, el sistema suma `Cantidad` al `StockRepu` del repuesto en base de datos y en el store de Redux

#### Scenario: Pedido ya estaba en arrived y se vuelve a guardar
- **WHEN** el usuario guarda un pedido que ya tenía estado `arrived`
- **THEN** el stock NO se incrementa nuevamente (sin efecto duplicado)

#### Scenario: Ítem sin RepuestoId
- **WHEN** un ítem del pedido no tiene `RepuestoId` asignado
- **THEN** ese ítem se ignora para el incremento de stock
