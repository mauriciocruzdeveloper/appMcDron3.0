## ADDED Requirements

### Requirement: Secciones colapsables en la reparación
El sistema SHALL permitir expandir y colapsar individualmente las secciones operativas de la página de reparación.

#### Scenario: Abrir la página de una reparación
- **WHEN** el usuario abre una reparación
- **THEN** la sección asociada al estado actual se muestra expandida inicialmente
- **AND** su encabezado usa el color del estado actual
- **AND** las demás secciones operativas se muestran colapsadas inicialmente
- **AND** cada encabezado colapsable informa su estado mediante `aria-expanded`

#### Scenario: Cambiar el estado de la reparación
- **WHEN** el estado de la reparación cambia y tiene una sección operativa asociada
- **THEN** la nueva sección activa se expande
- **AND** su encabezado usa el color del nuevo estado

#### Scenario: Colapsar una sección
- **WHEN** el usuario activa el encabezado de una sección expandida
- **THEN** el contenido de esa sección se oculta
- **AND** las demás secciones conservan su estado

#### Scenario: Expandir una sección
- **WHEN** el usuario activa el encabezado de una sección colapsada
- **THEN** el contenido vuelve a mostrarse sin perder sus datos

### Requirement: Secciones siempre visibles
El sistema SHALL mantener fuera del mecanismo de colapso la cabecera, el progreso, las anotaciones confidenciales y las acciones.

#### Scenario: Orden superior de la reparación
- **WHEN** se renderiza la página para un administrador
- **THEN** se muestran primero la cabecera, luego el progreso y en tercer lugar las anotaciones confidenciales
- **AND** el enlace a Drive aparece después como sección colapsable

#### Scenario: Usuario sin acceso a anotaciones
- **WHEN** se renderiza la página para un usuario no administrador
- **THEN** las anotaciones confidenciales no se muestran
- **AND** cabecera y progreso permanecen siempre visibles

#### Scenario: Acciones administrativas
- **WHEN** se renderiza la página para un administrador
- **THEN** las acciones se muestran siempre visibles y sin control de colapso