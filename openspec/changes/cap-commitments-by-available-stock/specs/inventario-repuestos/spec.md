## MODIFIED Requirements

### Requirement: Proyección derivada de unidades comprometidas

El sistema SHALL calcular la demanda activa sumando las cantidades de snapshots incluidos en
reparaciones `Aceptado` o `Repuestos`, y SHALL exponer como unidades comprometidas el mínimo
entre esa demanda y el stock físico disponible del repuesto.

#### Scenario: Sin stock físico

- **WHEN** una reparación activa demanda un repuesto cuyo stock es cero
- **THEN** la demanda se conserva como faltante
- **AND** las unidades comprometidas del repuesto son cero

#### Scenario: Compromiso parcial

- **WHEN** la demanda activa es cinco y el stock físico disponible es dos
- **THEN** el sistema expone dos unidades comprometidas
- **AND** expone tres unidades como faltante

#### Scenario: Stock suficiente

- **WHEN** la demanda activa no supera el stock físico disponible
- **THEN** el sistema expone la demanda activa como comprometida
- **AND** no crea faltante por esa demanda

#### Scenario: Ingreso posterior de stock

- **WHEN** aumenta el stock físico de un repuesto con demanda activa no cubierta
- **THEN** el compromiso derivado aumenta hasta el mínimo entre stock y demanda
- **AND** no se crea un movimiento de reserva