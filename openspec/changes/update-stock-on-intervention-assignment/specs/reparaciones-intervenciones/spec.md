## ADDED Requirements

### Requirement: Compromiso de repuestos al aceptar presupuesto
El sistema SHALL comprometer repuestos solo cuando la reparacion pasa de
Presupuestado a Aceptado.

#### Scenario: Asignacion en Presupuestado
- **WHEN** el usuario agrega o elimina intervenciones mientras la reparacion esta en Presupuestado
- **THEN** el sistema actualiza repair_intervention
- **AND** no modifica stock ni backorder en part

#### Scenario: Presupuesto aceptado
- **WHEN** una reparacion pasa de Presupuestado a Aceptado
- **THEN** el sistema consolida repuestos de las intervenciones asignadas
- **AND** incrementa backorder (`UnidadesPedidas`) con la demanda comprometida
- **AND** no modifica stock en part

#### Scenario: Presupuesto rechazado
- **WHEN** una reparacion pasa de Presupuestado a Rechazado
- **THEN** el sistema no compromete repuestos
- **AND** no modifica stock ni backorder en part

### Requirement: Recepcion de pedidos y consumo al reparar
El sistema SHALL separar reposicion de stock fisico de liberacion de compromisos.

#### Scenario: Crear pedido de compra
- **WHEN** se crea un pedido en estado pending o in_transit con items de repuesto
- **THEN** el sistema no modifica backorder ni stock

#### Scenario: Pedido pasa a arrived
- **WHEN** un pedido pasa a estado arrived por primera vez
- **THEN** para cada item recibido el sistema incrementa stock con la cantidad recibida
- **AND** no modifica backorder

#### Scenario: Salida sin reparar desde Aceptado/Repuestos
- **WHEN** una reparacion en Aceptado o Repuestos pasa a un estado no reparado
- **THEN** el sistema reduce backorder (`UnidadesPedidas`) segun los repuestos comprometidos por esa reparacion
- **AND** no modifica stock en part

#### Scenario: Reparacion pasa a Reparado
- **WHEN** una reparacion pasa a estado Reparado por primera vez
- **THEN** el sistema descuenta en stock la cantidad de repuestos comprometida por sus intervenciones
- **AND** reduce en backorder la misma cantidad por repuesto (sin bajar de cero)

### Requirement: Alertas visuales por faltante real
El sistema SHALL mostrar alerta critica solo cuando hay faltante real sin cobertura en pedido activo.

#### Scenario: Faltante sin pedido activo
- **WHEN** un repuesto requerido por una reparacion tiene stock < backorder
- **AND** no tiene pedido en estado pending o in_transit
- **THEN** la UI muestra aviso de faltante sin cobertura

#### Scenario: Faltante con pedido activo
- **WHEN** un repuesto requerido tiene stock < backorder
- **AND** tiene pedido en estado pending o in_transit
- **THEN** la UI no muestra alerta critica
