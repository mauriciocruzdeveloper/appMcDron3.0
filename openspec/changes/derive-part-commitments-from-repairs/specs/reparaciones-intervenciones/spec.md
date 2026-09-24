## MODIFIED Requirements

### Requirement: Compromiso de repuestos al aceptar presupuesto
El sistema SHALL hacer que las asignaciones incluidas de una reparacion participen del
compromiso derivado solamente mientras la reparacion este en `Aceptado` o `Repuestos`.

#### Scenario: Asignacion en Presupuestado
- **WHEN** el usuario agrega, elimina o modifica intervenciones en `Presupuestado`
- **THEN** el sistema actualiza las asignaciones y sus snapshots
- **AND** esas asignaciones no aportan compromiso

#### Scenario: Presupuesto aceptado
- **WHEN** una reparacion pasa de `Presupuestado` a `Aceptado`
- **THEN** el selector incorpora las cantidades de sus asignaciones incluidas
- **AND** no modifica un contador de compromiso

#### Scenario: Presupuesto rechazado o cancelado
- **WHEN** una reparacion no entra al flujo comprometido o sale de el sin reparar
- **THEN** sus asignaciones no aportan compromiso
- **AND** no requiere movimientos compensatorios

### Requirement: Reserva y consumo por asignacion de intervencion
El sistema SHALL usar la composicion congelada y la inclusion explicita de cada asignacion
para derivar compromiso y decidir el consumo de stock fisico.

#### Scenario: Agregar una intervencion adicional
- **WHEN** se agrega una intervencion adicional incluida en `Aceptado` o `Repuestos`
- **THEN** su snapshot aporta inmediatamente al compromiso derivado
- **AND** no se crea un movimiento `reservation`

#### Scenario: Eliminar una adicional pendiente
- **WHEN** se elimina una intervencion adicional pendiente
- **THEN** su snapshot deja de aportar al compromiso derivado
- **AND** no se crea un movimiento `release`

#### Scenario: Completar y reparar
- **WHEN** una asignacion incluida esta `completada` y la reparacion pasa a `Reparado`
- **THEN** el sistema descuenta stock fisico segun su snapshot
- **AND** la reparacion deja de aportar al compromiso derivado por su nuevo estado

#### Scenario: Cerrar con una asignacion pendiente
- **WHEN** una asignacion incluida permanece `pendiente` al cerrar la reparacion
- **THEN** no descuenta stock fisico
- **AND** deja de aportar al compromiso derivado sin movimiento de liberacion

## ADDED Requirements

### Requirement: Inclusion explicita de repuestos del taller
Cada asignacion SHALL persistir explicitamente si los repuestos de su snapshot son provistos
por el taller, separando esa decision del importe de piezas.

#### Scenario: Taller provee los repuestos
- **WHEN** el administrador incluye los repuestos de una asignacion
- **THEN** la asignacion persiste la marca de inclusion
- **AND** su snapshot puede aportar compromiso y consumo segun estado

#### Scenario: Cliente provee los repuestos
- **WHEN** el administrador excluye los repuestos de una asignacion
- **THEN** la asignacion persiste la exclusion
- **AND** su snapshot no aporta compromiso ni consumo de stock fisico

#### Scenario: Precio cero
- **WHEN** una pieza provista por el taller tiene precio cero
- **THEN** la decision de compromiso depende de la marca explicita
- **AND** no depende de `parts_cost`

#### Scenario: Migracion de asignaciones historicas
- **WHEN** se migra una asignacion existente
- **THEN** el sistema infiere una marca inicial con reglas documentadas
- **AND** lista los casos ambiguos para revision antes del corte
