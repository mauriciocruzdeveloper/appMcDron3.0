## MODIFIED Requirements

### Requirement: Transiciones de estado alineadas al mapa de dominio
El sistema SHALL permitir un cambio de estado de reparacion solo si la transicion es valida
segun `transicionesPermitidas` (via `esTransicionValida`), tanto en la UI como en la accion
que aplica el cambio. `Abandonado` SHALL ser un destino valido solo desde `Respondido`,
`Transito`, `Presupuestado`, `Repuestos`, `Reparado`, `Diagnosticado` y `Cobrado`, y solo
cuando hayan transcurrido 7 dias desde un aviso de abandono registrado.

#### Scenario: Abandono desde un estado de espera permitido
- **WHEN** un administrador visualiza una reparacion en `Respondido`, `Transito`,
  `Presupuestado`, `Repuestos`, `Reparado`, `Diagnosticado` o `Cobrado`
- **AND** transcurrieron 7 dias desde `FechaAvisoAbandono`
- **THEN** la UI ofrece marcarla como `Abandonado`
- **AND** la accion de dominio acepta la transicion desde su estado actual sin enviar email

#### Scenario: Abandono no disponible con una tarea operativa pendiente
- **WHEN** una reparacion esta en un estado donde el administrador debe responder, revisar,
  presupuestar, reparar, diagnosticar, cobrar o enviar
- **THEN** la UI no ofrece marcarla como `Abandonado`
- **AND** un intento directo de aplicar esa transicion es rechazado sin modificar datos

#### Scenario: Abandono no disponible desde estados terminales o legacy
- **WHEN** una reparacion esta en un estado terminal o legacy
- **THEN** la UI no ofrece marcarla como `Abandonado`
- **AND** un intento directo de aplicar esa transicion es rechazado sin modificar datos

#### Scenario: Abandono sin aviso vencido
- **WHEN** no existe `FechaAvisoAbandono` o aun no transcurrieron 7 dias completos
- **THEN** la UI no ofrece marcar la reparacion como `Abandonado`
- **AND** un intento directo de aplicar esa transicion es rechazado sin modificar datos

#### Scenario: Liberacion de reservas al abandonar
- **WHEN** una reparacion en `Repuestos` cambia a `Abandonado`
- **THEN** el sistema libera los repuestos comprometidos mediante el efecto de dominio
  existente

#### Scenario: Historial de stock conservado al abandonar
- **WHEN** una reparacion posterior a la etapa de reparacion cambia a `Abandonado`
- **THEN** el sistema no revierte consumos ni movimientos historicos de stock

#### Scenario: Reparacion abandonada irreversible
- **WHEN** una reparacion ya esta `Abandonado`
- **THEN** no existe una transicion para reabrirla
- **AND** si el cliente regresa se crea una nueva reparacion vinculada a la anterior