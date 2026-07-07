## ADDED Requirements

### Requirement: Marcado de repuestos como obsoletos
El sistema DEBE permitir marcar un repuesto del catálogo como obsoleto para excluirlo de nuevas asociaciones a intervenciones, conservando su historial, stock y movimientos de inventario.

#### Scenario: Marcar un repuesto existente como obsoleto
- **WHEN** un administrador activa el switch "Marcar como obsoleto" en el formulario de un repuesto existente y guarda
- **THEN** el repuesto se persiste con `Obsoleta = true`
- **AND** el stock, unidades comprometidas y ledger del repuesto no se modifican

#### Scenario: Repuesto obsoleto no aparece como opción para nuevas intervenciones
- **WHEN** se edita o crea una intervención y se completa el modelo de drone
- **THEN** los repuestos con `Obsoleta = true` no figuran entre las opciones seleccionables (según `selectRepuestosSeleccionables`)
- **AND** si la intervención ya tenía asociado un repuesto que luego fue marcado obsoleto, esa asociación existente se conserva sin cambios

#### Scenario: Repuesto obsoleto no aparece como opción para nuevos ítems de pedido
- **WHEN** se agrega o edita un ítem en un pedido a proveedor
- **THEN** los repuestos con `Obsoleta = true` no figuran entre las opciones del combo de repuesto, salvo que ese ítem ya lo tuviera referenciado

#### Scenario: Listado muestra repuestos obsoletos con indicador visual
- **WHEN** un repuesto con `Obsoleta = true` aparece en el listado de repuestos
- **THEN** se muestra una etiqueta "Obsoleto" junto a su nombre
- **AND** el repuesto sigue siendo visible en el listado (no se oculta ni se elimina)

