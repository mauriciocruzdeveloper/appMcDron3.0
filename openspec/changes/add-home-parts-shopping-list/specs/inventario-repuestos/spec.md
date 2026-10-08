## ADDED Requirements

### Requirement: Lista de compras derivada de reparaciones pendientes
El sistema SHALL ofrecer en el inicio del administrador una lista de repuestos a
comprar, consolidada por ID de repuesto, a partir de reparaciones en `Aceptado` o
`Repuestos` y los snapshots de asignaciones que incluyen piezas provistas por el
taller. SHALL respetar las cantidades positivas de cada snapshot y calcular la
compra pendiente como `max(0, demandaTotal - stockFisico - cantidadPedidoActivo)`.
SHALL usar valores no negativos de stock y cantidades de pedidos; SHALL contar
solamente pedidos `pending` e `in_transit` y mostrar filas con stock cero y compra
pendiente positiva. SHALL excluir repuestos con stock positivo aunque este sea
insuficiente para toda la demanda.

#### Scenario: Repuesto agotado sin reparaciones que lo necesiten
- **WHEN** un repuesto tiene stock cero pero ninguna asignacion candidata lo requiere
- **THEN** no aparece en la lista de compras

#### Scenario: Demanda compartida mayor que el stock positivo
- **WHEN** dos reparaciones candidatas requieren respectivamente 2 y 3 unidades del mismo repuesto, hay 2 unidades en stock y no hay pedidos activos
- **THEN** el repuesto no aparece en A comprar porque tiene stock positivo

#### Scenario: Demanda compartida sin stock
- **WHEN** dos reparaciones candidatas requieren respectivamente 2 y 3 unidades del mismo repuesto y no hay stock ni pedidos activos
- **THEN** aparece una unica fila con demanda 5, stock 0 y 5 unidades a comprar
- **AND** ambas reparaciones figuran como demandantes

#### Scenario: Pedido activo con cobertura parcial
- **WHEN** la demanda es 5, el stock es 0 y hay 2 unidades en pedidos activos
- **THEN** la fila muestra 2 unidades ya pedidas y 3 unidades a comprar

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
- **THEN** no aparece en A comprar

#### Scenario: Acceso restringido
- **WHEN** un cliente o partner abre su inicio
- **THEN** no se muestra la lista administrativa de compras

### Requirement: Clasificacion independiente de agotados y pedidos
El sistema SHALL mostrar en Agotados todos los repuestos sin stock fisico, sin
excluirlos por falta de demanda o por pedidos existentes. SHALL excluir los repuestos
marcados como obsoletos de A comprar, Agotados y En pedido, independientemente de su
demanda y pedidos. SHALL
mostrar en En pedido los repuestos asociados a items de pedidos `pending` o
`in_transit`, independientemente del stock y compromiso. SHALL mostrar la suma de
unidades pedidas en esos pedidos y no confundirla con unidades comprometidas.

#### Scenario: Repuesto sin demanda ni stock
- **WHEN** un repuesto no tiene stock ni demanda de reparaciones
- **THEN** aparece en Agotados y no en A comprar

#### Scenario: Compra cubierta sin stock
- **WHEN** un repuesto sin stock tiene demanda cubierta completamente por pedidos activos
- **THEN** aparece en Agotados y En pedido pero no en A comprar

#### Scenario: Pedido sin compromiso con stock disponible
- **WHEN** un repuesto con stock positivo y sin demanda esta incluido en un pedido activo
- **THEN** aparece en En pedido, no en Agotados ni A comprar

#### Scenario: Pedido historico y compromiso no son pedidos activos
- **WHEN** un repuesto solo tiene compromiso de reparaciones o pedidos recibidos/cancelados
- **THEN** no aparece en En pedido

#### Scenario: Repuesto obsoleto con demanda y pedido activo
- **WHEN** un repuesto sin stock esta marcado como obsoleto y tiene demanda y pedido activo
- **THEN** no aparece en A comprar, Agotados ni En pedido