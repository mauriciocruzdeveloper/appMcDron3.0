## MODIFIED Requirements

### Requirement: Recepción de pedidos y consumo al reparar
El sistema SHALL separar la reposición de stock físico de la liberación de compromisos y
SHALL vincular el consumo físico al estado de cada asignación de intervención.

#### Scenario: Crear pedido de compra
- **WHEN** se crea un pedido en estado pending o in_transit con items de repuesto
- **THEN** el sistema no modifica unidades comprometidas ni stock

#### Scenario: Pedido pasa a arrived
- **WHEN** un pedido pasa a estado arrived por primera vez
- **THEN** para cada item recibido el sistema incrementa stock con la cantidad recibida
- **AND** no modifica unidades comprometidas

#### Scenario: Salida sin reparar desde Aceptado/Repuestos
- **WHEN** una reparación en Aceptado o Repuestos pasa a un estado no reparado
- **THEN** el sistema reduce las unidades comprometidas según los repuestos reservados por esa reparación
- **AND** no modifica stock físico

#### Scenario: Reparación pasa a Reparado con intervención completada
- **WHEN** una reparación pasa a estado Reparado por primera vez
- **AND** una asignación de intervención está en estado `completada`
- **THEN** el sistema descuenta del stock físico los repuestos requeridos por esa asignación
- **AND** reduce las unidades comprometidas en la misma cantidad

#### Scenario: Reparación pasa a Reparado con intervención pendiente
- **WHEN** una reparación pasa a estado Reparado por primera vez
- **AND** una asignación de intervención no está en estado `completada`
- **THEN** el sistema libera las unidades comprometidas por los repuestos de esa asignación
- **AND** no modifica el stock físico por esa asignación

#### Scenario: Repuesto compartido por intervenciones con distinto estado
- **WHEN** un mismo repuesto pertenece a asignaciones completadas y no completadas de la reparación
- **AND** la reparación pasa a estado Reparado por primera vez
- **THEN** el sistema consume únicamente la cantidad correspondiente a las asignaciones completadas
- **AND** libera sin consumir la cantidad correspondiente a las asignaciones no completadas
