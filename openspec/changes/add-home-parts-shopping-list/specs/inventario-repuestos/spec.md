## ADDED Requirements

### Requirement: Lista de compras derivada de reparaciones pendientes
El sistema SHALL ofrecer en el inicio del administrador una lista de repuestos a
comprar, consolidada por ID de repuesto, a partir de reparaciones en `Aceptado` o
`Repuestos` y los snapshots de asignaciones que incluyen piezas provistas por el
taller. SHALL respetar las cantidades positivas de cada snapshot y calcular la
compra pendiente como `max(0, demandaTotal - stockFisico - cantidadPedidoActivo)`.
SHALL usar valores no negativos de stock y cantidades de pedidos; SHALL contar
solamente pedidos `pending` e `in_transit` y mostrar filas con compra pendiente positiva.

#### Scenario: Repuesto agotado sin reparaciones que lo necesiten
- **WHEN** un repuesto tiene stock cero pero ninguna asignacion candidata lo requiere
- **THEN** no aparece en la lista de compras

#### Scenario: Demanda compartida mayor que el stock positivo
- **WHEN** dos reparaciones candidatas requieren respectivamente 2 y 3 unidades del mismo repuesto, hay 2 unidades en stock y no hay pedidos activos
- **THEN** aparece una unica fila con demanda 5, stock 2 y 3 unidades a comprar
- **AND** ambas reparaciones figuran como demandantes, sin asignar prioridad sobre el stock

#### Scenario: Pedido activo con cobertura parcial
- **WHEN** la demanda es 5, el stock es 1 y hay 2 unidades en pedidos activos
- **THEN** la fila muestra 2 unidades ya pedidas y 2 unidades a comprar

#### Scenario: Compra cubierta por un pedido existente
- **WHEN** stock mas pedidos activos alcanza o supera la demanda del repuesto
- **THEN** ese repuesto no aparece en la lista de compras

#### Scenario: Exclusiones de demanda y cobertura
- **WHEN** existen piezas aportadas por el cliente, reparaciones fuera de Aceptado/Repuestos o pedidos cancelados/recibidos
- **THEN** las piezas del cliente y las reparaciones fuera de alcance no suman demanda
- **AND** los pedidos cancelados o recibidos no suman unidades pedidas pendientes

### Requirement: Presentacion y confiabilidad de la lista de compras
El sistema SHALL mostrar una seccion colapsable consistente con las listas actuales,
solo para administradores, con contador de tipos de repuestos a comprar. Cada fila
SHALL mostrar nombre, proveedor cuando exista, demanda, stock, unidades pedidas,
cantidad a comprar y enlaces a las reparaciones demandantes y al repuesto existente.
SHALL actualizarse a partir de los cambios de datos existentes sin mutar inventario
ni crear pedidos. SHALL distinguir carga, error y vacio confirmado.

#### Scenario: Consulta y navegacion
- **WHEN** el administrador despliega Repuestos a comprar y consulta una fila
- **THEN** ve sus cantidades y puede abrir el repuesto o una reparacion demandante
- **AND** las listas de Agotados y Pedidos siguen disponibles

#### Scenario: Carga incompleta o fallida
- **WHEN** la demanda, el catalogo o los pedidos necesarios todavia se cargan o fallan
- **THEN** se muestra carga o error, no un mensaje confirmado de ausencia de compras

#### Scenario: Repuesto faltante en el catalogo
- **WHEN** un snapshot candidato referencia un ID que no existe en el catalogo cargado
- **THEN** se muestra una referencia identificable al repuesto no encontrado y sus reparaciones
- **AND** no se informa una cantidad a comprar como confirmada suponiendo stock cero

#### Scenario: Repuesto obsoleto con demanda pendiente
- **WHEN** un repuesto obsoleto conserva demanda con cobertura insuficiente
- **THEN** permanece visible y senalado como obsoleto para revision del administrador

#### Scenario: Acceso restringido
- **WHEN** un cliente o partner abre su inicio
- **THEN** no se muestra la lista administrativa de compras