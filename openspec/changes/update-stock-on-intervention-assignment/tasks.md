## 1. Implementacion
- [x] 1.1 Mover logica de consumo de repuestos a acciones/usecases y dejar persistencia como CRUD
- [x] 1.2 Al agregar/eliminar asignacion en Presupuestado: no modificar stock ni backorder
- [x] 1.3 Al aceptar presupuesto (Presupuestado -> Aceptado): comprometer backorder segun asignaciones
- [x] 1.4 Al crear pedido pending/in_transit: no modificar stock ni backorder
- [x] 1.5 Al pasar pedido a arrived: incrementar stock recibido sin tocar backorder
- [x] 1.6 Al salir desde Aceptado/Repuestos hacia estado no reparado: liberar backorder sin tocar stock
- [x] 1.7 Al pasar reparacion a Reparado: descontar stock y liberar backorder comprometido
- [x] 1.8 Ajustar selectores/avisos para alertar solo si hay faltante real sin pedido activo
- [ ] 1.9 Validar manualmente: aceptar/rechazar presupuesto, pedidos, salida sin reparar y reparado
