## MODIFIED Requirements

### Requirement: Reserva y consumo por asignación de intervención
El sistema SHALL calcular los movimientos de inventario con la composición congelada de cada asignación y SHALL mantener diferenciados la reserva, la liberación y el consumo físico.

#### Scenario: Reservar una intervención adicional
- **WHEN** se agrega una intervención adicional a una reparación en `Aceptado` o `Repuestos`
- **THEN** el sistema emite movimientos `reservation` por los repuestos y cantidades de su snapshot
- **AND** no modifica el stock físico

#### Scenario: Completar una intervención adicional
- **WHEN** la asignación adicional está `completada` y la reparación pasa a `Reparado`
- **THEN** el sistema emite movimientos `consumption` por su snapshot
- **AND** reduce stock físico y unidades comprometidas en esas cantidades

#### Scenario: Cerrar con una adicional pendiente
- **WHEN** la asignación adicional permanece `pendiente` y la reparación pasa a `Reparado`
- **THEN** el sistema emite movimientos `release` por su snapshot
- **AND** no modifica el stock físico

#### Scenario: Fallo al reservar una adicional
- **WHEN** se crea la asignación pero falla su movimiento de reserva
- **THEN** el sistema elimina compensatoriamente la asignación
- **AND** informa el error sin dejar una intervención adicional sin reserva