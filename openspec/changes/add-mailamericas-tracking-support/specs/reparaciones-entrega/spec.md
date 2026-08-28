## ADDED Requirements

### Requirement: Identificacion y consulta de seguimiento MailAmericas
El sistema SHALL identificar como MailAmericas un número de seguimiento que comience con el prefijo MailAmericas (como `MLAR` o `ML`). Para esos valores SHALL mostrar una leyenda identificatoria y un botón que abra el sitio oficial de seguimiento de MailAmericas en una pestaña nueva.

#### Scenario: Codigo MailAmericas detectado
- **WHEN** el usuario ingresa `MLAR048983277EX` como número de seguimiento en la reparación
- **THEN** la sección de entrega muestra la leyenda `Envío MailAmericas detectado`
- **AND** muestra un botón para consultar el seguimiento en el sitio oficial de MailAmericas (`https://mailamericas.com/tracking?number_id=MLAR048983277EX`)

#### Scenario: Codigo MailAmericas con espacios exteriores y minusculas
- **WHEN** el seguimiento contiene un código de MailAmericas con espacios exteriores o minúsculas (ej. ` mlar048983277ex `)
- **THEN** el sistema lo normaliza y lo identifica como MailAmericas
