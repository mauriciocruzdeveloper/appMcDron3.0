## ADDED Requirements

### Requirement: Validación de formato de email de clientes
El sistema SHALL validar que las direcciones de correo electrónico de clientes cumplan un formato ASCII estándar válido antes de persistir un cliente o dar de alta una reparación en recepción, tránsito o presupuesto.

#### Scenario: Email válido con o sin espacios laterales
- **WHEN** el usuario ingresa un correo ASCII bien formado como `cliente@gmail.com` o `  cliente.dji+1@dominio.com.ar  `
- **THEN** el sistema recorta los espacios iniciales y finales y permite continuar con el guardado

#### Scenario: Email con tilde o caracteres no ASCII
- **WHEN** el usuario ingresa un correo con tildes, diéresis o `ñ` (por ejemplo `maría@gmail.com` o `ñoño@dominio.com`)
- **THEN** el sistema rechaza la operación antes de ejecutar escrituras en persistencia
- **AND** muestra un mensaje claro indicando que el email no es válido y no debe contener tildes, `ñ` ni espacios

#### Scenario: Email mal formado
- **WHEN** el correo carece de `@`, de dominio con TLD válido, contiene espacios internos o puntos consecutivos
- **THEN** el sistema bloquea el alta antes de crear usuario, drone o reparación

#### Scenario: Email de contacto opcional
- **WHEN** el campo `EmailContacto` está vacío o contiene sólo espacios al guardar un usuario
- **THEN** el sistema permite guardar porque el email de contacto es opcional
- **AND** si tiene contenido, exige el mismo formato válido que el email principal
