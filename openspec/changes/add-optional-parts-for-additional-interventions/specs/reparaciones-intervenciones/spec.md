## ADDED Requirements

### Requirement: Exclusión opcional de repuestos del taller en intervenciones adicionales
El sistema SHALL permitir indicar si una intervención adicional utiliza o no repuestos del inventario del taller al crearla y mientras permanezca `pendiente` durante el trabajo activo (`Aceptado` o `Repuestos`).

#### Scenario: Agregar intervención adicional sin repuesto del taller
- **WHEN** un administrador selecciona una intervención adicional con repuestos asociados en `Aceptado` o `Repuestos`
- **AND** desmarca el uso de repuestos del taller antes de agregarla
- **THEN** el sistema crea la asignación con origen `adicional`, `incluyeRepuestosTaller = false` y costo de piezas `0`
- **AND** conserva el `repuestosSnapshot` de la intervención sin aportar demanda, compromiso ni consumo de stock físico
- **AND** no modifica `PresuFiRep`

#### Scenario: Agregar intervención adicional sin piezas asociadas
- **WHEN** un administrador selecciona una intervención adicional que no tiene repuestos en el catálogo
- **THEN** la interfaz no muestra controles de inclusión de repuesto
- **AND** la asignación se registra con `incluyeRepuestosTaller = false` y `repuestosSnapshot` vacío

#### Scenario: Alternar uso de repuesto del taller en adicional pendiente
- **WHEN** un administrador cambia la opción de uso de repuesto del taller en una asignación adicional `pendiente` con la reparación en `Aceptado` o `Repuestos`
- **THEN** el sistema actualiza `incluyeRepuestosTaller`, recalcula el costo propio de piezas y total de esa asignación usando su `repuestosSnapshot`
- **AND** no modifica `PresuFiRep`

#### Scenario: Bloquear cambio de repuestos en adicional completada
- **WHEN** se intenta cambiar la inclusión de repuestos de una asignación adicional `completada`
- **THEN** el sistema rechaza la operación sin modificar la asignación

#### Scenario: Indicador visual en tareas a realizar
- **WHEN** se visualiza en `Tareas a Realizar` una asignación con repuestos asociados cuya marca `incluyeRepuestosTaller` es `false`
- **THEN** la interfaz muestra un indicador explícito de que no utiliza repuestos del taller
