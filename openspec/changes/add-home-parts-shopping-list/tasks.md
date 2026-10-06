## 1. Implementation

- [x] 1.1 Obtener aprobacion de la propuesta y confirmar alcance: estados Aceptado/Repuestos y descuento de pedidos activos.
- [x] 1.2 Crear selector de lista de compras con demanda global, stock, pedidos activos y reparaciones relacionadas; reglas solo en selectores/usecases.
- [x] 1.3 Distinguir carga, error, exito vacio y referencias ausentes con el flujo de datos existente; no agregar consultas por reparacion.
- [x] 1.4 Agregar seccion colapsable Repuestos a comprar en InicioAdmin con contador, cantidades y enlaces a repuesto/reparaciones; conservar listas actuales.

## 2. Validation

- [x] 2.1 Probar stock cero sin demanda, demanda cubierta, stock parcial y varias reparaciones compartiendo repuesto con cantidades mayores que uno.
- [x] 2.2 Probar pedidos parciales, suficientes, cancelados y recibidos; excluir piezas del cliente y reparaciones fuera de estados candidatos.
- [x] 2.3 Probar repuesto obsoleto, ID ausente del catalogo, carga/error y actualizacion al cambiar asignaciones, stock o pedidos.
- [ ] 2.4 Verificar navegacion, plegado y visualizacion en escritorio/movil; no mostrar la seccion a clientes o partners.

Navegacion y plegado cubiertos por pruebas de componente; integracion exclusiva en
InicioAdmin. Verificacion visual escritorio/movil pendiente por apertura de navegador
omitida. No se marca la tarea 2.4 como completada sin esa comprobacion.