## ADDED Requirements

### Requirement: Seguimiento obligatorio para enviar una reparacion
El sistema SHALL permitir que una reparacion cambie al estado Enviado solamente cuando
`SeguimientoEntregaRep`, despues de quitar espacios exteriores, contenga al menos un caracter.
La regla SHALL aplicarse tanto en la UI como en la accion de dominio que cambia el estado.

#### Scenario: Reparacion sin seguimiento
- **WHEN** una reparacion puede transicionar a Enviado pero su seguimiento es nulo, vacio o contiene solamente espacios
- **THEN** la UI no permite ejecutar la accion de marcar como Enviado
- **AND** la accion de cambio de estado rechaza cualquier intento directo sin modificar la reparacion

#### Scenario: Reparacion con seguimiento
- **WHEN** una reparacion puede transicionar a Enviado y su seguimiento contiene un valor
- **THEN** la UI permite ejecutar la accion de marcar como Enviado
- **AND** la accion de cambio de estado puede aplicar la transicion

### Requirement: Identificacion y consulta de seguimiento Andreani
El sistema SHALL identificar como Andreani un seguimiento que, despues de normalizar sus
espacios, este compuesto por exactamente 15 digitos. Para esos valores SHALL mostrar una
leyenda identificatoria y un boton que abra el sitio oficial de seguimiento de Andreani en
una pestaña nueva.

#### Scenario: Codigo Andreani detectado
- **WHEN** el usuario ingresa `360003067941120` como numero de seguimiento
- **THEN** la seccion de entrega muestra la leyenda `Envio Andreani detectado`
- **AND** muestra un boton para consultar el seguimiento en el sitio oficial de Andreani

#### Scenario: Seguimiento de otro transportista
- **WHEN** el seguimiento no esta compuesto por exactamente 15 digitos
- **THEN** la seccion no lo identifica como Andreani
- **AND** no muestra el boton especifico de Andreani

#### Scenario: Codigo Andreani con espacios exteriores
- **WHEN** el seguimiento contiene un codigo de 15 digitos con espacios exteriores
- **THEN** el sistema lo normaliza y lo identifica como Andreani
