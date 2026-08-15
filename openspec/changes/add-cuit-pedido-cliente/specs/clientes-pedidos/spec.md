## ADDED Requirements

### Requirement: CUIT opcional en cliente y pedido
El sistema SHALL permitir registrar un CUIT opcional asociado al cliente y transportar ese valor al pedido de repuestos para compras internacionales, sin requerirlo en todos los casos.

#### Scenario: Cliente con CUIT cargado
- **WHEN** un administrador crea o edita un cliente con un CUIT válido
- **THEN** el sistema guarda ese valor en la ficha del cliente
- **AND** lo reutiliza como valor por defecto en los pedidos que lo involucren

#### Scenario: Pedido con CUIT manual
- **WHEN** un usuario completa un pedido sin seleccionar un cliente con CUIT
- **THEN** el sistema acepta un valor manual opcional
- **AND** lo normaliza y persiste sin romper pedidos existentes

#### Scenario: Selector de clientes con CUIT
- **WHEN** un usuario abre un pedido
- **THEN** el sistema ofrece un selector solo con clientes que ya tienen CUIT cargado
- **AND** al elegir uno, el campo del pedido se completa automáticamente

#### Scenario: CUIT vacío o inválido
- **WHEN** el usuario deja el campo vacío o ingresa un valor no numérico/incorrecto
- **THEN** el sistema lo trata como opcional
- **AND** no bloquea el guardado del pedido ni del cliente
