## ADDED Requirements

### Requirement: Transiciones de estado alineadas al mapa de dominio
El sistema SHALL permitir un cambio de estado de reparacion solo si la transicion es valida
segun `transicionesPermitidas` (via `esTransicionValida`), tanto en la UI (botones
disponibles) como en la accion que aplica el cambio.

#### Scenario: Transicion invalida oculta en UI
- **WHEN** una reparacion esta en Aceptado o Repuestos
- **THEN** la UI no ofrece avanzar a Cobrado, Enviado ni Finalizado
- **AND** solo ofrece Reparado o una salida sin reparar (Rechazado/Cancelado/Abandonado)

#### Scenario: Transicion invalida rechazada por la accion
- **WHEN** se intenta aplicar un cambio de estado no permitido por `transicionesPermitidas`
- **THEN** la accion rechaza la operacion sin modificar el estado ni el stock

#### Scenario: Consumo garantizado al reparar
- **WHEN** una reparacion llega a un estado posterior a Reparado (Cobrado/Enviado/Finalizado)
- **THEN** necesariamente paso por Reparado
- **AND** el stock fisico fue descontado en esa transicion
