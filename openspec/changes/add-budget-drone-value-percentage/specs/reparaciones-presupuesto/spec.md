## ADDED Requirements

### Requirement: Indicador de porcentaje del presupuesto respecto al valor del modelo de drone
El sistema SHALL mostrar al administrador, en la sección `PRESUPUESTO` de la ficha de reparación junto al campo `Presupuesto Final $`, qué porcentaje representa el monto presupuestado respecto al `PrecioReferencia` del `ModeloDrone` asociado, o una leyenda explicativa cuando dicho valor no esté disponible. Este indicador SHALL ser exclusivo para administradores y NO SHALL incluirse en la vista de clientes ni en emails o PDFs de presupuesto.

#### Scenario: Modelo de drone con precio de referencia cargado
- **WHEN** un administrador visualiza o edita `Presupuesto Final $` en una reparación cuyo modelo de drone tiene `PrecioReferencia > 0`
- **THEN** la interfaz muestra el porcentaje que representa el monto actual respecto a `PrecioReferencia` junto con el valor de referencia del modelo

#### Scenario: Modelo de drone sin precio de referencia cargado
- **WHEN** un administrador visualiza la sección `PRESUPUESTO` de una reparación cuyo modelo de drone tiene `PrecioReferencia <= 0` o vacío
- **THEN** la interfaz muestra una leyenda indicando que el modelo de drone no tiene precio de referencia cargado y ofrece acceso para editar el modelo

#### Scenario: Reparación sin modelo de catálogo asociado
- **WHEN** un administrador visualiza la sección `PRESUPUESTO` de una reparación que no tiene un modelo de drone resoluble en el catálogo
- **THEN** la interfaz muestra una leyenda indicando que no hay un modelo de drone asociado en el catálogo para comparar el valor

#### Scenario: Ocultamiento para usuarios no administradores
- **WHEN** un usuario sin rol `admin` visualiza la sección `PRESUPUESTO` de una reparación
- **THEN** el sistema NO muestra el porcentaje ni las leyendas sobre el precio de referencia del modelo
