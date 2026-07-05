## ADDED Requirements

### Requirement: Liberacion de compromisos al eliminar reparacion
El sistema SHALL liberar el backorder comprometido por una reparacion cuando esta se
elimina estando en un estado comprometido.

#### Scenario: Eliminar reparacion en Aceptado o Repuestos
- **WHEN** se elimina una reparacion en estado Aceptado o Repuestos
- **THEN** el sistema recalcula `UnidadesPedidas` de los repuestos excluyendo esa reparacion
- **AND** no modifica `StockRepu`

#### Scenario: Eliminar reparacion sin compromiso
- **WHEN** se elimina una reparacion que no esta en Aceptado ni Repuestos
- **THEN** el sistema no modifica `StockRepu` ni `UnidadesPedidas`
