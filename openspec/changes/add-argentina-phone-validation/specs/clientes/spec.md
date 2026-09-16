## ADDED Requirements

### Requirement: Validación de teléfonos argentinos de clientes
El sistema SHALL validar todo teléfono no vacío de un cliente como un número argentino antes de persistir el cliente o cualquier alta de reparación que lo cree.

#### Scenario: Formatos argentinos nacionales válidos
- **WHEN** el usuario ingresa un número nacional de diez dígitos, con o sin el prefijo nacional `0`
- **THEN** el sistema acepta valores como `3416559834` y `03416559834`
- **AND** permite espacios, guiones y paréntesis como separadores visuales

#### Scenario: Formatos argentinos internacionales válidos
- **WHEN** el usuario ingresa el código de país `+54` seguido por los diez dígitos nacionales
- **THEN** el sistema acepta valores como `+543416559834`
- **AND** para móviles también acepta el indicador `9`, como en `+5493416559834`

#### Scenario: Formato móvil nacional tradicional
- **WHEN** el usuario ingresa un móvil con prefijo nacional `0`, código de área, indicador local `15` y número de abonado
- **THEN** el sistema acepta el número si al retirar `0` y `15` quedan diez dígitos nacionales

#### Scenario: Teléfono opcional
- **WHEN** el campo de teléfono está vacío o contiene sólo espacios
- **THEN** el sistema permite guardar porque el teléfono continúa siendo opcional

#### Scenario: Teléfono inválido
- **WHEN** el valor no representa uno de los formatos argentinos admitidos, contiene letras, tiene una longitud incorrecta o usa `+` fuera del prefijo internacional
- **THEN** el sistema rechaza la acción antes de cualquier escritura
- **AND** informa que debe ingresarse un teléfono argentino válido con ejemplos aceptados

#### Scenario: Validación en todos los puntos de alta
- **WHEN** se crea o edita un cliente directamente, o se crea desde recepción, tránsito o presupuesto
- **THEN** las acciones aplican la misma regla de dominio
- **AND** la capa de persistencia recibe únicamente datos que ya fueron validados