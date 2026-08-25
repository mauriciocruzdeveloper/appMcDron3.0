## ADDED Requirements

### Requirement: Ranking temporal de modelos reparados

El sistema SHALL calcular un ranking de modelos usando únicamente reparaciones con fecha de finalización válida y una relación resoluble entre reparación, drone y modelo de drone. Cada reparación SHALL aportar `2 ^ (-diasDesdeFinalizacion / 180)` al puntaje del modelo y el sistema SHALL mostrar también su cantidad histórica sin ponderar.

#### Scenario: Una reparación reciente pesa más que una antigua
- **GIVEN** dos modelos con una reparación completada cada uno
- **AND** una reparación terminó hoy y la otra terminó hace 180 días
- **WHEN** se calcula el ranking
- **THEN** la reparación de hoy aporta `1` punto
- **AND** la reparación de hace 180 días aporta `0,5` puntos
- **AND** el modelo reparado hoy aparece primero

#### Scenario: Un modelo acumula varias reparaciones
- **GIVEN** un modelo con varias reparaciones completadas en fechas diferentes
- **WHEN** se calcula el ranking
- **THEN** su cantidad histórica incluye todas las reparaciones válidas
- **AND** su puntaje es la suma de los pesos temporales de esas reparaciones

#### Scenario: Una reparación no permite resolver el modelo
- **GIVEN** una reparación con fecha de finalización pero sin una relación válida hasta el catálogo de modelos
- **WHEN** se calcula el ranking
- **THEN** la reparación no se asigna a ningún modelo
- **AND** la página informa la cantidad de reparaciones omitidas por relaciones faltantes

### Requirement: Cantidad configurable de cajas

La página SHALL permitir al administrador ingresar una cantidad entera de cajas mayor o igual a uno y SHALL recalcular localmente la propuesta cuando cambie el valor.

#### Scenario: El administrador cambia la cantidad de cajas
- **GIVEN** un ranking con modelos reparados
- **WHEN** el administrador cambia la cantidad de cajas por un entero válido
- **THEN** la propuesta se actualiza sin persistir el valor ni modificar inventario

#### Scenario: El valor ingresado no es válido
- **WHEN** el administrador ingresa un valor vacío, decimal o menor que uno
- **THEN** la página indica que la cantidad debe ser un entero mayor o igual a uno
- **AND** no presenta una propuesta basada en ese valor

### Requirement: Cajas exclusivas para modelos prioritarios

Cuando haya menos cajas que modelos activos, el sistema SHALL comparar el puntaje de cada modelo con la carga promedio por caja y SHALL asignar cajas exclusivas a los modelos que alcancen ese umbral, conservando al menos una caja compartida si quedan modelos por ubicar.

#### Scenario: Un modelo supera la carga promedio
- **GIVEN** menos cajas que modelos activos
- **AND** un modelo tiene un puntaje igual o superior al puntaje total dividido por la cantidad de cajas
- **WHEN** se genera la propuesta
- **THEN** ese modelo recibe una caja exclusiva si todavía puede conservarse una caja para los modelos restantes

#### Scenario: Solo existe una caja
- **GIVEN** varios modelos activos y una sola caja disponible
- **WHEN** se genera la propuesta
- **THEN** todos los modelos se incluyen en una única caja compartida

### Requirement: Agrupamiento transparente de modelos

El sistema SHALL agrupar los modelos sin caja exclusiva priorizando fabricante, serie y generación nominal. Las variantes posteriores al número de generación SHALL pertenecer a la misma familia, mientras que generaciones diferentes SHALL permanecer en familias distintas. Cada caja compartida SHALL enumerar todos sus modelos exactos y SHALL mostrar el puntaje y la cantidad de reparaciones acumulados.

#### Scenario: Modelos de una misma familia comparten caja
- **GIVEN** modelos no prioritarios `Phantom 3 Standard` y `Phantom 3 Pro` del mismo fabricante
- **WHEN** existe una caja compartida disponible para ellos
- **THEN** el sistema los propone juntos bajo la familia `Phantom 3`
- **AND** enumera cada modelo exacto incluido

#### Scenario: Generaciones distintas usan familias diferentes
- **GIVEN** modelos `Phantom 3 Pro` y `Phantom 4 Pro`
- **WHEN** se infieren sus familias
- **THEN** pertenecen a `Phantom 3` y `Phantom 4` respectivamente

#### Scenario: Un sufijo pegado identifica una variante
- **GIVEN** modelos `Air 3` y `Air 3S`
- **WHEN** se infieren sus familias
- **THEN** ambos pertenecen a la familia `Air 3`

#### Scenario: Hay más familias que cajas compartidas
- **GIVEN** más familias pendientes que cajas compartidas
- **WHEN** se genera la propuesta
- **THEN** el sistema combina las familias de menor demanda buscando equilibrar el puntaje acumulado entre cajas
- **AND** conserva visible la familia de cada modelo incluido

### Requirement: Cajas suficientes o sobrantes

Cuando la cantidad de cajas sea igual o superior a la cantidad de modelos activos, el sistema SHALL asignar al menos una caja exclusiva a cada modelo y SHALL distribuir todas las cajas restantes proporcionalmente según el puntaje ponderado.

#### Scenario: Hay una caja por modelo
- **GIVEN** la misma cantidad de cajas que modelos activos
- **WHEN** se genera la propuesta
- **THEN** cada modelo recibe exactamente una caja exclusiva

#### Scenario: Sobran cajas
- **GIVEN** más cajas que modelos activos
- **WHEN** se genera la propuesta
- **THEN** cada modelo recibe una caja exclusiva
- **AND** todas las cajas restantes se asignan a modelos concretos en proporción a su puntaje
- **AND** ninguna caja queda como reserva sin uso definido

#### Scenario: Se distribuyen veinticinco cajas
- **GIVEN** tres modelos con puntajes proporcionales `1`, `0,5` y `0,25`
- **AND** hay veinticinco cajas disponibles
- **WHEN** se genera la propuesta
- **THEN** se asignan las veinticinco cajas
- **AND** los modelos reciben respectivamente catorce, siete y cuatro cajas

### Requirement: Acceso administrativo a estadísticas de modelos

El sistema SHALL ofrecer una página protegida para administradores dentro de la navegación de estadísticas, con el ranking y la propuesta de cajas adaptados a mobile y desktop.

#### Scenario: Un administrador abre la página
- **WHEN** un usuario administrador accede desde el menú de estadísticas
- **THEN** ve el ranking ordenado, la cantidad de cajas y la propuesta de distribución

#### Scenario: No existen reparaciones completadas resolubles
- **WHEN** no hay reparaciones con fecha de finalización y modelo resoluble
- **THEN** la página muestra un estado vacío
- **AND** no propone asignaciones de cajas