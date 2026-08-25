## Why

La compra y organización de repuestos necesita distinguir los modelos con demanda reciente de aquellos que solo tuvieron reparaciones antiguas. El conteo histórico simple no refleja esa diferencia ni ayuda a decidir cómo repartir una cantidad limitada de cajas físicas.

## What Changes

- Agregar una página administrativa de estadísticas por modelo de drone.
- Ordenar los modelos por cantidad de reparaciones completadas y por un puntaje de demanda que pondera más las reparaciones recientes.
- Permitir ingresar la cantidad disponible de cajas de repuestos.
- Proponer cajas exclusivas para modelos de alta demanda y cajas compartidas para el resto, agrupadas por fabricante y familia nominal cuando sea posible.
- Mostrar la composición y el motivo de cada asignación para que la propuesta sea auditable.
- Mantener el cálculo en Redux/selectores o casos de uso, sin agregar lógica de negocio ni estado persistido en la capa de persistencia.

## Impact

- Affected specs: `drone-model-parts-planning`
- Affected code: selectores/casos de uso de reparaciones y modelos, nuevo componente de estadísticas, rutas administrativas y navegación.
- Datos utilizados: reparaciones, drones y modelos de drone ya cargados en Redux.
- No requiere migraciones, tablas nuevas ni cambios en APIs de persistencia.
