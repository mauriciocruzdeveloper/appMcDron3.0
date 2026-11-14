## 1. Reglas de negocio (Redux Actions)
- [x] 1.1 Extender `calcularCostosAsignacionIntervencion` y `agregarIntervencionAReparacionAsync` para aceptar `incluirRepuesto` opcional (por defecto `true`), conservando `repuestosSnapshot` y calculando `partsCost = 0` e `incluyeRepuestosTaller = false` cuando se excluye.
- [x] 1.2 Actualizar `actualizarIncluirRepuestoAsignacionAsync` para calcular `parts_cost` usando `repuestosSnapshot` completo (cantidades y múltiples piezas, con fallback al catálogo) y rechazar cambios en intervenciones adicionales completadas o fuera de `Aceptado`/`Repuestos`.

## 2. Interfaz de usuario (`ReparacionReparar`)
- [x] 2.1 Mostrar opción `"Usar repuesto del taller"` (marcada por defecto) al seleccionar una intervención adicional que tenga repuestos asociados.
- [x] 2.2 Mostrar indicador `"Sin repuesto taller"` en `Tareas a Realizar` cuando una asignación con repuestos tenga excluido el uso de repuestos del taller.
- [x] 2.3 Permitir alternar `"Usar repuesto del taller"` en intervenciones adicionales `pendiente` mientras la reparación esté en `Aceptado` o `Repuestos` para administradores.

## 3. Validación
- [x] 3.1 Agregar pruebas de thunks/reglas de negocio para alta adicional sin repuesto, toggle con snapshot multi-repuesto y bloqueo en adicional completada.
- [x] 3.2 Agregar pruebas de componente `ReparacionReparar` para el check al agregar, badge indicador y toggle en tarea adicional pendiente.
- [x] 3.3 Validar propuesta con OpenSpec y ejecutar suite de pruebas.
