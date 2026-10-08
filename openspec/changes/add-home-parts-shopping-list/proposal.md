## Why

El inicio muestra repuestos agotados y pedidos, pero no una lista consolidada de lo
que falta comprar para las reparaciones pendientes. Un repuesto sin stock puede no
tener demanda. Las tres listas deben distinguir demanda sin stock, agotados y
repuestos incluidos en pedidos activos, sin confundir compromiso con compra.

## What Changes

- Agregar al inicio del administrador una lista colapsable "Repuestos a comprar",
  siguiendo las listas existentes, sin reemplazar Agotados ni Pedidos.
- Considerar reparaciones en `Aceptado` y `Repuestos`, usando cantidades de
  `repuestosSnapshot` de las asignaciones que incluyen repuestos del taller.
- Agrupar por ID de repuesto y calcular `aComprar = max(0, demanda - stock - pedidosActivos)`.
  Normalizar stock y cantidades de pedidos a valores no negativos.
- Mostrar nombre, proveedor si existe, demanda total, stock fisico, unidades ya
  pedidas, unidades a comprar y las reparaciones que demandan ese repuesto.
- Incluir solamente repuestos con stock cero y unidades a comprar mayores que cero.
  Los repuestos con stock positivo no se muestran, aunque no cubran toda la demanda.
  Los pedidos
  `pending` e `in_transit` reducen la compra pendiente; otros estados no cuentan.
- Agotados incluye todos los repuestos con stock cero, con o sin demanda, pedidos
  excepto los obsoletos. En pedido incluye repuestos en pedidos activos, tengan o no stock
  o demanda, mostrando unidades pedidas reales y no unidades comprometidas.
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
- Excluir los repuestos marcados como obsoletos de A comprar, Agotados y En pedido,
  incluso si tienen demanda o pedidos activos, segun confirmacion del 2026-10-08.

## Impact

- Affected specs: `inventario-repuestos`.
- Affected code: `src/redux-tool-kit/repuesto/repuesto.selectors.ts`, selectores y
  estado de carga de reparaciones/inventario/pedidos, y `src/components/Inicio/`.
- Complementa `derive-part-commitments-from-repairs`, `cap-commitments-by-available-stock`
  y `show-shared-part-shortage`, sin alterar sus reglas de compromiso o alertas.
- Sin cambios previstos en PHP ni en el esquema de la base de datos.

## Approval

Propuesta aprobada por el usuario el 2026-10-05. Lista implementada; no desplegada.
El 2026-10-08 el usuario confirma la correccion de criterios: comprar solo demanda
sin stock no cubierta por pedidos activos, agotados todos sin stock y pedidos solo
pendientes/en transito. Las listas pueden compartir repuestos.

## Validation

- 29 suites y 240 pruebas aprobadas, incluyendo 19 pruebas nuevas de compras,
  interfaz, estados de carga y errores/recuperacion de realtime.
- Build de produccion generado correctamente con advertencias preexistentes.
- Validacion estructural local de OpenSpec; CLI OpenSpec no disponible.
- Verificacion visual escritorio/movil pendiente: apertura de navegador omitida.
- Correccion 2026-10-08: 28 pruebas focalizadas y regresion completa de 30 suites,
  256 pruebas aprobadas. Criterios de las tres listas verificados en selectores y
  componentes, incluyendo cobertura parcial/total y cantidades reales de pedidos.