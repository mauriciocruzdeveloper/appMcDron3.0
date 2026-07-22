## ADDED Requirements

### Requirement: Composición adaptativa por viewport

La interfaz SHALL reorganizar su contenido para aprovechar el ancho disponible, sin alterar las funciones ni el orden de prioridad en pantallas pequeñas.

#### Scenario: Uso en celular

- **WHEN** el viewport tiene menos de 992 px de ancho
- **THEN** la navegación permanece compacta y el contenido se presenta en una sola columna sin desplazamiento horizontal

#### Scenario: Uso en monitor

- **WHEN** el viewport tiene al menos 992 px de ancho
- **THEN** la navegación expone accesos frecuentes y las pantallas compatibles distribuyen sus bloques en múltiples columnas legibles

### Requirement: Dashboard administrativo jerarquizado

El inicio administrativo SHALL separar accesos rápidos, trabajo de reparaciones e información de inventario en zonas visuales diferenciadas en desktop.

#### Scenario: Dashboard en desktop

- **WHEN** un administrador abre Inicio en un monitor
- **THEN** ve los accesos rápidos en una franja superior, el trabajo prioritario en el área principal y el estado de repuestos en un área lateral

#### Scenario: Dashboard en mobile

- **WHEN** un administrador abre Inicio en un celular
- **THEN** las mismas secciones se apilan en el orden operativo existente y todas las acciones siguen disponibles

### Requirement: Comportamiento funcional preservado

La adaptación responsive SHALL conservar rutas, filtros, expansiones, acciones y contenido existentes.

#### Scenario: Cambio de tamaño

- **WHEN** el usuario cambia entre tamaños mobile y desktop
- **THEN** no pierde estado funcional ni encuentra acciones duplicadas o inaccesibles