## ADDED Requirements

### Requirement: Cancelación de reparación aceptada
El sistema SHALL permitir cancelar una reparación en estado Aceptado mediante la
transición Aceptado -> Cancelado, y SHALL rechazar la transición Aceptado -> Rechazado
(el rechazo es exclusivo del flujo de presupuesto previo a la aceptación).

#### Scenario: Cliente desiste después de aceptar
- **WHEN** una reparación está en Aceptado y el cliente decide no reparar
- **THEN** el sistema permite pasar a Cancelado
- **AND** libera el compromiso de repuestos de esa reparación sin descontar stock físico

#### Scenario: Rechazado no disponible después de aceptar
- **WHEN** una reparación está en Aceptado
- **THEN** `esTransicionValida("Aceptado", "Rechazado")` retorna false
- **AND** la UI no ofrece el botón "Presupuesto Rechazado"

#### Scenario: Botón de cancelación en UI
- **WHEN** un admin ve la sección de presupuesto de una reparación en Aceptado
- **THEN** la UI ofrece la acción "Cancelar Reparación"
