## 1. Implementación
- [x] 1.1 Separar la demanda de repuestos de asignaciones completadas y no completadas.
- [x] 1.2 Al pasar a `Reparado`, consumir solo la demanda completada y liberar la demanda pendiente.
- [x] 1.3 Preservar la reserva inicial de todas las intervenciones y la regla para stock no disponible.

## 2. Pruebas
- [x] 2.1 Verificar que una asignación completada genere consumo físico y liberación del compromiso.
- [x] 2.2 Verificar que una asignación pendiente solo libere el compromiso.
- [x] 2.3 Verificar cantidades separadas cuando un repuesto sea compartido por asignaciones completadas y pendientes.
- [x] 2.4 Ejecutar las pruebas enfocadas del flujo de reparación.
