## ADDED Requirements

### Requirement: Identificación y consulta de seguimiento MailAmericas en Pedidos de Repuesto
El sistema SHALL identificar como MailAmericas un número de seguimiento de pedido de repuesto que comience con el prefijo MailAmericas (como `MLAR` o `ML`). Para esos valores SHALL ofrecer un enlace directo hacia el sitio oficial de seguimiento de MailAmericas (`https://mailamericas.com/tracking?number_id=<tracking>`).

#### Scenario: Codigo MailAmericas detectado en Pedido de Repuesto
- **WHEN** el usuario ingresa o visualiza `MLAR048983277EX` como número de seguimiento en un pedido de repuesto
- **THEN** la interfaz muestra la opción de consultar el seguimiento directamente en el sitio oficial de MailAmericas (`https://mailamericas.com/tracking?number_id=MLAR048983277EX`)
