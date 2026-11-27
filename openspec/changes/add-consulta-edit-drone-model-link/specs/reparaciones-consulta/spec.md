## ADDED Requirements

### Requirement: Acceso directo para editar el modelo de drone desde Consulta
El sistema SHALL mostrar en la sección **CONSULTA** de una reparación, junto al campo **Modelo del Drone**, un acceso directo hacia la ficha de edición del modelo (`/inicio/modelos-drone/:id`) cuando el usuario sea `admin` y exista un modelo del catálogo asociado.

#### Scenario: Reparación con drone y modelo asignado
- **WHEN** un administrador visualiza la sección **CONSULTA** de una reparación cuyo drone tiene `ModeloDroneId` asignado
- **THEN** junto al selector **Modelo del Drone** se muestra el acceso "Editar modelo de drone" que navega a `/inicio/modelos-drone/:id`

#### Scenario: Reparación sin drone con nombre coincidente en catálogo
- **WHEN** un administrador visualiza la sección **CONSULTA** de una reparación sin `DroneId` cuyo nombre de modelo coincide de forma única con un modelo del catálogo
- **THEN** junto al campo de texto **Modelo del Drone** se muestra el acceso "Editar modelo de drone" hacia `/inicio/modelos-drone/:id`

#### Scenario: Sin modelo asociado o usuario no administrador
- **WHEN** la reparación no tiene modelo resuelto en el catálogo o el usuario no tiene rol `admin`
- **THEN** no se muestra el acceso de edición del modelo de drone
