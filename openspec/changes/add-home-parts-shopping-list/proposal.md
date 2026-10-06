## Why

El inicio muestra repuestos agotados y pedidos, pero no una lista consolidada de lo
que falta comprar para las reparaciones pendientes. Un repuesto sin stock puede no
tener demanda, y uno con stock positivo puede ser insuficiente para varios trabajos.

## What Changes

- Agregar al inicio del administrador una lista colapsable "Repuestos a comprar",
  siguiendo las listas existentes, sin reemplazar Agotados ni Pedidos.
- Considerar reparaciones en `Aceptado` y `Repuestos`, usando cantidades de
  `repuestosSnapshot` de las asignaciones que incluyen repuestos del taller.
- Agrupar por ID de repuesto y calcular `aComprar = max(0, demanda - stock - pedidosActivos)`.
  Normalizar stock y cantidades de pedidos a valores no negativos.
- Mostrar nombre, proveedor si existe, demanda total, stock fisico, unidades ya
  pedidas, unidades a comprar y las reparaciones que demandan ese repuesto.
- Incluir solamente filas con unidades a comprar mayores que cero. Los pedidos
  `pending` e `in_transit` reducen la compra pendiente; otros estados no cuentan.
- Mostrar carga y error sin afirmar que no hay compras pendientes cuando los datos
  necesarios no estan disponibles. Un ID ausente del catalogo debe quedar visible
  como repuesto no encontrado, sin convertir esa ausencia en stock cero confirmado.

## Decisions

- Reutilizar `selectAsignacionesCompromiso` y `selectDemandaPorRepuesto`, no el
  compromiso limitado al stock ni el catalogo mutable de intervenciones.
- Calcular cobertura global una sola vez por repuesto. Las reparaciones asociadas
  indican quienes lo necesitan, no a quien se asignara el stock compartido.
- No modificar stock, estados de reparacion, pedidos ni movimientos de inventario.
- No incorporar tablas, endpoints ni suscripciones nuevas. Verificar durante la
  implementacion que las cargas actuales permiten distinguir carga, error y exito;
  si falta estado de carga, agregarlo al flujo Redux existente.
- Mantener repuestos obsoletos si tienen demanda vigente y senalarlos, en lugar de
  ocultar una necesidad real. No habilitar automaticamente su compra.

## Impact

- Affected specs: `inventario-repuestos`.
- Affected code: `src/redux-tool-kit/repuesto/repuesto.selectors.ts`, selectores y
  estado de carga de reparaciones/inventario/pedidos, y `src/components/Inicio/`.
- Complementa `derive-part-commitments-from-repairs`, `cap-commitments-by-available-stock`
  y `show-shared-part-shortage`, sin alterar sus reglas de compromiso o alertas.
- Sin cambios previstos en PHP ni en el esquema de la base de datos.

## Approval

Propuesta aprobada por el usuario el 2026-10-05. Lista implementada; no desplegada.

## Validation

- 29 suites y 240 pruebas aprobadas, incluyendo 19 pruebas nuevas de compras,
  interfaz, estados de carga y errores/recuperacion de realtime.
- Build de produccion generado correctamente con advertencias preexistentes.
- Validacion estructural local de OpenSpec; CLI OpenSpec no disponible.
- Verificacion visual escritorio/movil pendiente: apertura de navegador omitida.