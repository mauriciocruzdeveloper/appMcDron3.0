## ADDED Requirements

### Requirement: Observaciones profesionales del cliente
El sistema DEBE permitir a un administrador registrar observaciones internas
sobre un usuario/cliente (a qué se dedica, notas de valor/prioridad), para
uso exclusivo administrativo.

#### Scenario: Admin agrega observaciones a un cliente
- **WHEN** un administrador edita la ficha de un usuario y completa el campo
  "Observaciones profesionales"
- **THEN** el valor se guarda asociado al usuario y persiste al recargar la ficha

#### Scenario: Cliente no ve observaciones profesionales
- **WHEN** un usuario con rol `cliente` o `partner` visualiza su propia ficha
- **THEN** el campo "Observaciones profesionales" no se muestra

#### Scenario: Observaciones vacías por defecto
- **WHEN** se crea un usuario nuevo sin completar el campo
- **THEN** el usuario se guarda correctamente con observaciones vacías/nulas
