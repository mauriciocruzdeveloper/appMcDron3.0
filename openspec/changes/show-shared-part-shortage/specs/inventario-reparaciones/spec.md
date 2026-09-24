## ADDED Requirements

### Requirement: Advertencia de cobertura compartida

El sistema SHALL mostrar el faltante global de un repuesto cuando la demanda activa total de las reparaciones supere el stock físico disponible, sin asignar automáticamente las unidades a una reparación específica.

#### Scenario: Tres reparaciones comparten dos unidades

- **WHEN** tres reparaciones activas requieren una unidad del mismo repuesto y existen dos unidades en stock
- **THEN** el compromiso global será de dos unidades
- **AND** cada reparación mostrará que la cobertura compartida es insuficiente y que falta una unidad en el conjunto
- **AND** ninguna reparación será marcada como única destinataria de las dos unidades

#### Scenario: La reparación urgente no sigue el orden de ingreso

- **WHEN** el usuario decide resolver primero una reparación posterior
- **THEN** la advertencia seguirá mostrando el faltante global sin impedir esa decisión