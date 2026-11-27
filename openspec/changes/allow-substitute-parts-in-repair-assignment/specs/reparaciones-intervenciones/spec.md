## ADDED Requirements

### Requirement: Sustitución y ajuste de repuestos efectivos en asignaciones de reparación
El sistema SHALL permitir a un administrador modificar los repuestos efectivos (`repuestosSnapshot` e `incluyeRepuestosTaller`) de cualquier asignación de intervención en estado `pendiente` mientras la reparación se encuentre en `Aceptado` o `Repuestos`, sin modificar el presupuesto acordado con el cliente.

#### Scenario: Sustituir repuesto presupuestado por otro repuesto del inventario
- **WHEN** un administrador edita una asignación `pendiente` de una reparación en `Aceptado` o `Repuestos`
- **AND** reemplaza los repuestos actuales por uno o más repuestos activos de cualquier modelo en el inventario con sus cantidades
- **THEN** el sistema actualiza `repuestosSnapshot` con los nuevos repuestos y establece `incluyeRepuestosTaller = true`
- **AND** el compromiso derivado, las alertas de faltantes y la lista de compras dejan de contemplar el repuesto anterior y pasan a contemplar el repuesto sustituto
- **AND** si la asignación tiene origen `presupuestada`, conserva sin cambios `PrecioManoObra`, `PrecioPiezas`, `PrecioTotal` y `PresuFiRep`

#### Scenario: Resolver asignación sin utilizar repuestos del inventario
- **WHEN** un administrador edita una asignación `pendiente` en `Aceptado` o `Repuestos` y quita todos los repuestos del inventario
- **THEN** el sistema persiste `repuestosSnapshot = []` e `incluyeRepuestosTaller = false`
- **AND** la asignación deja de aportar demanda, compromiso y consumo de stock físico
- **AND** si la asignación tiene origen `presupuestada`, conserva sin cambios `PrecioManoObra`, `PrecioPiezas`, `PrecioTotal` y `PresuFiRep`

#### Scenario: Restaurar repuestos originales de la intervención
- **WHEN** un administrador selecciona restaurar los repuestos originales en una asignación `pendiente` cuyos repuestos fueron modificados
- **THEN** el sistema restablece `repuestosSnapshot` e `incluyeRepuestosTaller` según la definición actual de la intervención en el catálogo

#### Scenario: Bloquear edición de repuestos fuera de condiciones válidas
- **WHEN** se intenta modificar los repuestos efectivos de una asignación que está `completada` o cuya reparación no se encuentra en `Aceptado` ni `Repuestos`
- **THEN** el sistema rechaza la operación sin modificar la asignación ni el informe de reparación

#### Scenario: Consumo y trazabilidad al pasar a Reparado
- **WHEN** una reparación pasa a `Reparado` por primera vez con una asignación `completada` cuyos repuestos fueron sustituidos
- **THEN** el sistema descuenta del stock físico únicamente los repuestos presentes en el `repuestosSnapshot` vigente (con stock disponible)
- **AND** registra en `stock_movement.note` que el consumo corresponde a un repuesto ajustado en la reparación

### Requirement: Aclaración automática editable en el informe de reparación ante ajuste de repuestos
El sistema SHALL reflejar automáticamente en el campo editable `DescripcionTecRep` (`Informe de Reparación o Diagnóstico`) las sustituciones o resoluciones sin reemplazo de pieza aplicadas sobre asignaciones, permitiendo que el técnico revise o edite el texto antes de notificar al cliente.

#### Scenario: Agregar aclaración al sustituir repuesto
- **WHEN** un administrador guarda un repuesto sustituto en una asignación `pendiente`
- **THEN** el sistema agrega en `DescripcionTecRep` una línea aclaratoria indicando la intervención y el repuesto utilizado, sin borrar el texto libre previamente escrito por el técnico

#### Scenario: Agregar aclaración al resolver sin repuestos de stock
- **WHEN** un administrador deja sin repuestos de inventario una asignación cuya intervención tenía repuestos en catálogo
- **THEN** el sistema agrega en `DescripcionTecRep` una línea aclaratoria indicando que la intervención se resolvió reparando el componente sin reemplazo completo de pieza

#### Scenario: Actualizar o quitar aclaración al volver a cambiar o restaurar
- **WHEN** un administrador vuelve a cambiar el repuesto sustituto de la misma asignación o restaura sus repuestos originales
- **THEN** el sistema reemplaza o elimina únicamente la línea automática asociada a esa asignación sin duplicar entradas ni alterar el resto del texto libre en `DescripcionTecRep`
