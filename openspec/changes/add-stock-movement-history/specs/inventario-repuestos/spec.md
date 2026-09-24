## ADDED Requirements

### Requirement: Historial de movimientos del repuesto

El sistema SHALL permitir consultar en la página de detalle de un repuesto los movimientos
de `stock_movement` asociados a ese repuesto, sin modificar el ledger ni el compromiso
derivado.

#### Scenario: Mostrar movimientos ordenados

- **WHEN** el usuario abre el desplegable de movimientos de un repuesto existente
- **THEN** el sistema muestra sus movimientos del más reciente al más antiguo
- **AND** muestra fecha, tipo, variación de stock físico y nota o referencia disponible

#### Scenario: Repuesto sin movimientos

- **WHEN** el repuesto no tiene movimientos registrados
- **THEN** el desplegable informa que no hay movimientos
- **AND** la pantalla conserva el resto de sus datos y acciones

#### Scenario: Error de consulta

- **WHEN** falla la consulta del historial
- **THEN** el desplegable informa el error sin ocultar los datos del repuesto
- **AND** no modifica stock ni unidades comprometidas

#### Scenario: Lectura sin efectos

- **WHEN** el usuario consulta o vuelve a cerrar el historial
- **THEN** el sistema no crea, modifica ni elimina movimientos
- **AND** el cálculo de comprometidos permanece basado en reparaciones y snapshots