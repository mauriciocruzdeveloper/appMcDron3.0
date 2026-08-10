## ADDED Requirements

### Requirement: Gestion de plantillas de email
El sistema SHALL permitir a usuarios con rol admin listar, crear, editar y desactivar plantillas de email reutilizables para campanas.

#### Scenario: Alta de plantilla por admin
- **WHEN** un admin crea una plantilla con nombre, asunto y cuerpo
- **THEN** la plantilla se guarda y queda disponible para asociar a campanas

#### Scenario: Baja logica de plantilla
- **WHEN** un admin elimina una plantilla
- **THEN** el sistema la desactiva por soft delete
- **AND** conserva el historial de corridas previas que la hayan usado

### Requirement: Gestion de campanas por criterios dinamicos
El sistema SHALL permitir a usuarios con rol admin crear campanas de email con filtros de clientes/reparaciones evaluados en tiempo de envio.

#### Scenario: Segmento dinamico cambia entre corridas
- **WHEN** una campana se ejecuta en dos fechas distintas
- **THEN** los destinatarios se recalculan en cada corrida segun el estado de los datos en ese momento
- **AND** el grupo objetivo puede variar entre corridas

### Requirement: Filtros MVP combinables y criterio de no pagaron
El sistema SHALL soportar en MVP filtros predefinidos combinables y SHALL incluir el criterio "no pagaron" como monto_restante > 0.

#### Scenario: Filtro no pagaron
- **WHEN** una campana incluye el filtro no pagaron
- **THEN** solo incluye destinatarios con (PresuFiRep - AdelantoRep) > 0

#### Scenario: Filtros combinados
- **WHEN** una campana combina estado de reparacion y antiguedad
- **THEN** el sistema envia solo a clientes que cumplen todos los criterios seleccionados

### Requirement: Ejecucion manual de campanas
El sistema SHALL permitir al admin ejecutar una campana manualmente bajo demanda.

#### Scenario: Enviar ahora
- **WHEN** el admin presiona "Enviar ahora"
- **THEN** el sistema ejecuta la campana inmediatamente
- **AND** registra una corrida con metricas de enviados/fallidos

### Requirement: Periodicidad con catch-up
El sistema SHALL soportar periodicidad una vez, diaria, semanal y mensual, y SHALL ejecutar campanas vencidas aunque el runner se dispare tarde.

#### Scenario: Runner tardio
- **WHEN** una campana tenia next_run_at vencido y el runner se ejecuta mas tarde
- **THEN** la campana se envia igual
- **AND** la siguiente fecha se recalcula desde la hora real de ejecucion

### Requirement: Historial de corridas y resultados
El sistema SHALL registrar historial por corrida y por destinatario para trazabilidad operativa.

#### Scenario: Consulta de historial
- **WHEN** un admin abre el historial de campanas
- **THEN** ve fecha de corrida, cantidad de destinatarios, cantidad de enviados, cantidad de fallidos y errores

### Requirement: Restriccion por permisos
El sistema SHALL restringir la gestion y ejecucion de campanas/plantillas a usuarios admin.

#### Scenario: Usuario no admin intenta acceder
- **WHEN** un usuario sin rol admin intenta abrir la seccion de campanas
- **THEN** el sistema bloquea el acceso a la seccion y a las acciones de envio

### Requirement: Limite de envio por corrida
El sistema SHALL limitar la cantidad de emails enviados por corrida para respetar el limite SMTP del hosting (100/hora), y SHALL registrar los destinatarios restantes como pendientes.

#### Scenario: Corrida con mas destinatarios que el limite
- **WHEN** una corrida tiene mas destinatarios que el limite por hora
- **THEN** el sistema envia hasta el limite y registra el resto con estado pendiente
- **AND** la corrida queda en estado parcial

### Requirement: Reintento de pendientes y fallidos
El sistema SHALL permitir al admin reintentar el envio de los destinatarios pendientes o fallidos de una corrida, sin duplicar envios a quienes ya recibieron.

#### Scenario: Reintento de corrida parcial
- **WHEN** el admin reintenta una corrida parcial
- **THEN** el sistema envia solo a destinatarios con estado pendiente o fallido
- **AND** actualiza las metricas de la corrida

### Requirement: Finalizacion manual de corrida
El sistema SHALL permitir al admin dar por finalizada una corrida con destinatarios sin enviar, dejando registro de su estado final.

#### Scenario: Finalizar corrida con fallidos persistentes
- **WHEN** el admin finaliza una corrida con destinatarios pendientes o fallidos
- **THEN** la corrida queda en estado finalizado y no admite mas reintentos
