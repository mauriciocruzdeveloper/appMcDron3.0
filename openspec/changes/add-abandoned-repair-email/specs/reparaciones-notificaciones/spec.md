## ADDED Requirements

### Requirement: Aviso previo de abandono
El sistema SHALL enviar un aviso previo antes de permitir que una reparacion cambie a
`Abandonado` y SHALL registrar la fecha del aviso exitoso.

#### Scenario: Aviso disponible por antiguedad
- **WHEN** transcurrieron 3 meses calendario desde `FeRecRep`
- **AND** la reparacion esta en un estado elegible y no tiene aviso registrado
- **THEN** la UI ofrece enviar el aviso de abandono

#### Scenario: Lista de avisos pendientes en Inicio
- **WHEN** un administrador abre el inicio
- **THEN** el sistema muestra las reparaciones listas para enviar el aviso de abandono
- **AND** obtiene la lista mediante un selector memoizado de Reselect
- **AND** permite abrir el detalle de cada reparacion
- **AND** excluye reparaciones sin antiguedad suficiente, con aviso registrado o en un
  estado no elegible

#### Scenario: Envio exitoso sin cambio de estado
- **WHEN** un administrador confirma enviar el aviso
- **THEN** el sistema envia el email al `EmailContacto` del usuario o, si no existe, al
  `EmailUsu` de la reparacion
- **AND** conserva el estado actual
- **AND** guarda `FechaAvisoAbandono` con la fecha del envio exitoso

#### Scenario: Contenido del aviso
- **WHEN** se genera el email de drone abandonado
- **THEN** identifica al cliente, al drone y al numero publico de reparacion
- **AND** informa que el cliente dispone de 7 dias desde la notificacion para retirarlo
- **AND** informa que, vencido ese plazo, el drone sera dispuesto por el servicio tecnico

#### Scenario: Cancelacion de la confirmacion
- **WHEN** el administrador cancela la confirmacion de abandono
- **THEN** el sistema no cambia el estado
- **AND** no envia ningun email

#### Scenario: Email fallido
- **WHEN** falla el envio del aviso
- **THEN** el sistema conserva el estado actual
- **AND** no registra `FechaAvisoAbandono`
- **AND** la UI informa que el email no pudo enviarse

#### Scenario: Cancelacion durante el plazo
- **WHEN** existe un aviso y aun no se confirmo el abandono definitivo
- **THEN** el administrador puede cancelar el aviso
- **AND** el sistema limpia `FechaAvisoAbandono` sin cambiar el estado