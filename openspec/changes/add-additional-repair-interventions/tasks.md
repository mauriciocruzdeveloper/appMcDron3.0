## 1. Esquema y persistencia
- [x] 1.1 Agregar migración para `origin` y `parts_snapshot`, incluyendo backfill e índices/constraints.
- [x] 1.2 Persistir y mapear origen y snapshot en las asignaciones.

## 2. Dominio e inventario
- [x] 2.1 Construir el snapshot al asignar una intervención y consumir demanda desde ese snapshot.
- [x] 2.2 Validar que las adicionales solo se agreguen en `Aceptado` o `Repuestos`.
- [x] 2.3 Reservar stock al agregar una adicional y liberar la reserva al eliminarla.
- [x] 2.4 Mantener el consumo físico limitado a asignaciones completadas.

## 3. Interfaz
- [x] 3.1 Permitir al administrador agregar intervenciones adicionales desde la sección Reparar.
- [x] 3.2 Identificar visualmente las asignaciones adicionales y permitir eliminar las pendientes.
- [x] 3.3 Separar intervenciones presupuestadas y adicionales realizadas en el email de reparación terminada.
- [x] 3.4 Excluir las adicionales de la sección, total, email y PDF del presupuesto aceptado.

## 4. Validación
- [x] 4.1 Probar snapshot inmutable, reserva, liberación y consumo de adicionales.
- [x] 4.2 Ejecutar las pruebas enfocadas del flujo de reparación y validar la migración/documentación.