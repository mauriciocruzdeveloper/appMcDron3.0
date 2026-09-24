## Why

Cuando varias reparaciones demandan el mismo repuesto, el stock disponible es compartido y no debe presentarse como cobertura completa de cada reparación. La interfaz necesita advertir el faltante global sin imponer una prioridad automática.

## What Changes

- Derivar la demanda total y el faltante global de cada repuesto.
- Mostrar en cada reparación una alerta de cobertura compartida insuficiente cuando la demanda total supere el stock físico.
- Mantener el compromiso global limitado al stock y sin asignarlo por fecha o prioridad.

## Impact

- Affected specs: inventario y repuestos de reparaciones.
- Affected code: selectores de reparaciones y sección de repuestos de una reparación.