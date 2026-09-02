## ADDED Requirements

### Requirement: Email al enviar una reparacion
Cuando una reparacion cambie al estado `Enviado` con el envio de notificaciones habilitado,
el sistema SHALL enviar al cliente un email que identifique la reparacion y el drone e incluya
el codigo guardado en `SeguimientoEntregaRep`.

#### Scenario: Drone marcado como enviado
- **WHEN** un administrador cambia una reparacion con seguimiento valido al estado `Enviado`
- **THEN** el sistema persiste la transicion
- **AND** envia un email al cliente con el numero de reparacion, el drone y el codigo de seguimiento
- **AND** la UI confirma que el drone fue marcado como enviado y que el email fue enviado

#### Scenario: Falla el email de envio
- **WHEN** la reparacion cambia a `Enviado` pero el endpoint de email falla
- **THEN** el sistema conserva la transicion ya persistida
- **AND** la UI informa que no pudo enviar el email
- **AND** no afirma que la notificacion fue enviada correctamente

### Requirement: Enlace Andreani en el email de envio
Cuando `SeguimientoEntregaRep`, despues de normalizar espacios, sea un codigo Andreani de
exactamente 15 digitos, el email SHALL incluir un enlace a
`https://www.andreani.com/envio/<codigo>`. Para otros formatos SHALL mostrar el codigo sin
presentar un enlace como si fuera de Andreani.

#### Scenario: Seguimiento Andreani
- **WHEN** se envia el email con el seguimiento `360003067941120`
- **THEN** el cuerpo muestra el codigo `360003067941120`
- **AND** incluye un enlace a `https://www.andreani.com/envio/360003067941120`

#### Scenario: Seguimiento de otro proveedor
- **WHEN** se envia el email con un seguimiento que no cumple el formato Andreani
- **THEN** el cuerpo muestra el codigo de seguimiento
- **AND** no incluye un enlace de Andreani

### Requirement: Email al finalizar una reparacion
Cuando una reparacion cambie al estado `Finalizado` con el envio de notificaciones habilitado,
el sistema SHALL enviar al cliente un email de cierre del proceso, distinto del aviso de
trabajo tecnico terminado que corresponde al estado `Reparado`.

#### Scenario: Reparacion finalizada
- **WHEN** un administrador cambia una reparacion al estado `Finalizado`
- **THEN** el sistema persiste la transicion y las fechas requeridas por el flujo actual
- **AND** envia al cliente un email de reparacion finalizada con el numero de reparacion y el drone
- **AND** la UI confirma la finalizacion y el envio del email

#### Scenario: Finalizacion con fecha ajustada
- **WHEN** la reparacion se finaliza sin una fecha previa de finalizacion tecnica
- **THEN** el sistema conserva el ajuste actual que usa la fecha de entrega como respaldo
- **AND** envia el email de reparacion finalizada
- **AND** la UI informa tanto el ajuste de fecha como el envio correcto del email

#### Scenario: Falla el email de finalizacion
- **WHEN** la reparacion cambia a `Finalizado` pero el endpoint de email falla
- **THEN** el sistema conserva la transicion ya persistida
- **AND** la UI informa que no pudo enviar el email

### Requirement: Destinatario de notificaciones de estado
Los emails de `Enviado` y `Finalizado` SHALL dirigirse a `EmailContacto` del usuario asociado
cuando tenga contenido; en caso contrario SHALL usar `EmailUsu` de la reparacion.

#### Scenario: Usuario con email de contacto
- **WHEN** el usuario asociado tiene `EmailContacto`
- **THEN** el email de estado se envia a esa direccion

#### Scenario: Usuario sin email de contacto
- **WHEN** el usuario asociado no tiene `EmailContacto`
- **THEN** el email de estado se envia a `EmailUsu` de la reparacion