## ADDED Requirements
### Requirement: Seguimiento visible y accionable para pedidos
El sistema SHALL permitir abrir el seguimiento de un pedido de repuestos desde la interfaz cuando exista un número de seguimiento registrado.

#### Scenario: Pedido con número de seguimiento
- **WHEN** un pedido tiene un número de seguimiento cargado
- **THEN** el usuario puede abrir ese número directamente en 17TRACK desde la vista del pedido

#### Scenario: Pedido sin número de seguimiento
- **WHEN** un pedido no tiene un número de seguimiento válido
- **THEN** la interfaz no muestra el enlace de tracking

### Requirement: Integración de consulta de estado
El sistema SHALL realizar la consulta automática de estados mediante un endpoint backend, sin exponer las credenciales del servicio de tracking en el frontend.

#### Scenario: API de 17TRACK configurada
- **WHEN** el backend tiene credenciales válidas y un número está registrado en 17TRACK
- **THEN** la app puede obtener el estado normalizado del envío desde su propio backend

#### Scenario: Servicio externo no disponible
- **WHEN** la API de tracking no está configurada o responde con error
- **THEN** la app mantiene el enlace directo a 17TRACK como alternativa funcional
