## MODIFIED Requirements
### Requirement: Pedido de repuestos con estado derivado
El sistema SHALL determinar automáticamente el estado de un pedido de repuestos a partir de los datos cargados en el pedido.

#### Scenario: Alta simple sin seguimiento ni llegada
- **WHEN** el usuario crea un pedido sin número de seguimiento ni fecha de llegada
- **THEN** el pedido queda en estado `pending`

#### Scenario: Pedido con seguimiento
- **WHEN** el usuario carga un número de seguimiento en un pedido sin fecha de llegada
- **THEN** el pedido queda en estado `in_transit`

#### Scenario: Pedido recibido
- **WHEN** el usuario carga una fecha de llegada en un pedido
- **THEN** el pedido queda en estado `arrived`

#### Scenario: Pedido cancelado
- **WHEN** el usuario cancela un pedido mediante la acción disponible en la interfaz
- **THEN** el pedido queda en estado `cancelled`

### Requirement: Estado de pedido no editable manualmente
El sistema SHALL impedir que el usuario seleccione manualmente el estado de un pedido en el formulario.

#### Scenario: Edición de pedido
- **WHEN** el usuario abre el formulario de un pedido existente
- **THEN** no se muestra un control para editar el estado
