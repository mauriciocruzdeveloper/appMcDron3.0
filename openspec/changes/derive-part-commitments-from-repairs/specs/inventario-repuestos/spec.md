## MODIFIED Requirements

### Requirement: Libro de movimientos como fuente de verdad
El sistema SHALL registrar cada cambio de stock fisico como un movimiento append-only en
`stock_movement` y SHALL mantener `part.stock` consistente con la suma de
`on_hand_delta`. El compromiso vigente SHALL derivarse de reparaciones y asignaciones, no de
la suma de `committed_delta` ni de `part.committed_units`.

#### Scenario: Movimiento de stock fisico atomico
- **WHEN** el sistema aplica una recepcion, consumo o ajuste de stock
- **THEN** inserta una fila en `stock_movement` con su `on_hand_delta`
- **AND** actualiza `part.stock` en la misma transaccion
- **AND** no modifica el compromiso derivado

#### Scenario: Auditoria historica de compromiso
- **WHEN** se consultan movimientos historicos `reservation`, `release` o deltas comprometidos
- **THEN** el sistema los conserva como evidencia append-only
- **AND** no los usa para calcular el compromiso vigente

### Requirement: Compromiso y consumo por evento
El sistema SHALL derivar el compromiso desde las asignaciones vigentes y SHALL usar eventos
de inventario solamente para cambios de stock fisico.

#### Scenario: Entrada a estado comprometido
- **WHEN** una reparacion pasa a `Aceptado` o `Repuestos`
- **THEN** sus asignaciones incluidas participan automaticamente del selector de compromiso
- **AND** el sistema no emite movimientos `reservation`

#### Scenario: Salida sin reparar
- **WHEN** una reparacion deja `Aceptado` o `Repuestos` sin ser reparada, o se elimina
- **THEN** sus asignaciones dejan automaticamente de participar del selector de compromiso
- **AND** el sistema no emite movimientos `release`

#### Scenario: Consumo al reparar
- **WHEN** una reparacion pasa a `Reparado`
- **THEN** el sistema emite `consumption` con `on_hand_delta` negativo por repuestos provistos por el taller en intervenciones completadas
- **AND** no emite `committed_delta`
- **AND** las intervenciones pendientes no descuentan stock fisico

#### Scenario: Reintento o concurrencia
- **WHEN** una transicion se reintenta o dos clientes observan los mismos datos
- **THEN** el compromiso resulta de las filas funcionales vigentes
- **AND** no se incrementa por la cantidad de solicitudes ejecutadas

## ADDED Requirements

### Requirement: Proyeccion derivada de unidades comprometidas
El sistema SHALL calcular las unidades comprometidas de cada repuesto sumando las cantidades
de snapshots incluidos en reparaciones cuyo estado sea `Aceptado` o `Repuestos`.

#### Scenario: Consolidacion por repuesto
- **WHEN** varias asignaciones activas contienen el mismo `partId`
- **THEN** el selector suma `quantity` de todas ellas
- **AND** expone un unico total de unidades comprometidas para ese repuesto

#### Scenario: Reparacion fuera del flujo comprometido
- **WHEN** una reparacion esta en cualquier estado distinto de `Aceptado` o `Repuestos`
- **THEN** ninguna de sus asignaciones aporta unidades comprometidas

#### Scenario: Repuesto no provisto por el taller
- **WHEN** una asignacion indica que sus repuestos no son provistos por el taller
- **THEN** su snapshot no aporta unidades comprometidas

#### Scenario: Catalogo modificado
- **WHEN** cambia la composicion actual de una intervencion del catalogo
- **THEN** el compromiso de asignaciones existentes conserva sus `parts_snapshot`

#### Scenario: Disponibilidad de lectura
- **WHEN** la aplicacion calcula stock libre o faltantes
- **THEN** usa el compromiso derivado memoizado
- **AND** calcula `stockLibre = StockRepu - UnidadesComprometidas`
