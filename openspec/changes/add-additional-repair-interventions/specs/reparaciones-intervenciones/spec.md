## ADDED Requirements

### Requirement: Intervenciones adicionales durante la reparación
El sistema SHALL permitir que un administrador agregue una asignación de intervención adicional a una reparación en estado `Aceptado` o `Repuestos` y SHALL distinguirla de las asignaciones presupuestadas.

#### Scenario: Agregar una intervención adicional
- **WHEN** un administrador agrega una intervención desde la sección Reparar
- **AND** la reparación está en `Aceptado` o `Repuestos`
- **THEN** el sistema crea una asignación con origen `adicional` y estado `pendiente`
- **AND** incluye su costo mediante el cálculo de precios existente

#### Scenario: Intentar agregarla fuera del trabajo activo
- **WHEN** se intenta crear una asignación adicional en cualquier otro estado
- **THEN** el sistema rechaza la operación sin crear la asignación ni modificar inventario

#### Scenario: Conservar el presupuesto aceptado
- **WHEN** se agrega, modifica o elimina una intervención adicional durante la reparación
- **THEN** la intervención adicional no aparece en la sección, email ni PDF del presupuesto
- **AND** el sistema no modifica `PresuFiRep`
- **AND** conserva el costo propio de la asignación adicional para trazabilidad

#### Scenario: Ampliar el importe aceptado por el cliente
- **WHEN** el trabajo nuevo requiere aumentar el importe aceptado
- **THEN** el administrador crea una ampliación como reparación vinculada mediante la acción `Crear Ampliación`
- **AND** el presupuesto aceptado de la reparación original permanece inalterado

### Requirement: Composición congelada de una asignación
El sistema SHALL guardar en cada asignación un snapshot de los repuestos y cantidades definidos por su intervención al momento de crearla.

#### Scenario: El catálogo cambia después de asignar
- **WHEN** se modifican los repuestos de una intervención después de haberla asignado
- **THEN** la reserva, liberación y consumo de esa asignación mantienen los repuestos y cantidades de su snapshot

#### Scenario: Asignación legacy sin snapshot
- **WHEN** se procesa una asignación anterior a la migración que todavía no tiene snapshot
- **THEN** el sistema obtiene su composición actual del catálogo como compatibilidad temporal

### Requirement: Gestión de una intervención adicional pendiente
El sistema SHALL permitir eliminar una asignación adicional pendiente antes de cerrar la reparación y SHALL conservar las restricciones existentes para asignaciones presupuestadas.

#### Scenario: Eliminar una adicional pendiente
- **WHEN** un administrador elimina una asignación adicional pendiente
- **THEN** el sistema elimina la asignación sin modificar el presupuesto final de la reparación
- **AND** libera los repuestos reservados por esa asignación sin descontar stock físico

#### Scenario: Eliminar una adicional completada
- **WHEN** se intenta eliminar una asignación adicional completada
- **THEN** el sistema rechaza la operación para preservar la trazabilidad

### Requirement: Comunicación de intervenciones adicionales
El sistema SHALL distinguir en el email de reparación terminada las intervenciones presupuestadas realizadas de las intervenciones adicionales realizadas.

#### Scenario: Reparación con trabajo adicional
- **WHEN** se envía el email de una reparación con asignaciones completadas de ambos orígenes
- **THEN** el email muestra por separado las intervenciones presupuestadas y las adicionales

#### Scenario: Reparación sin trabajo adicional
- **WHEN** se envía el email de una reparación sin asignaciones adicionales completadas
- **THEN** el email muestra las intervenciones presupuestadas realizadas
- **AND** no muestra una sección vacía de intervenciones adicionales