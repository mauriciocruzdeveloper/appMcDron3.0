## ADDED Requirements

### Requirement: Preservacion y respaldo separado de uploads masivos
El sistema de despliegue SHALL excluir el árbol `uploads/archivos/` del snapshot automático
de código y de la limpieza de archivos durante un rollback, evitando transferir gigas de
contenido de usuario en cada despliegue o eliminar fotos subidas con posterioridad al
snapshot. Adicionalmente, el script SHALL proveer un comando dedicado `backup-uploads` para
respaldar de forma incremental los archivos subidos por usuarios.

#### Scenario: Backup de despliegue sin re-descargar uploads masivos
- **WHEN** el operador inicia un despliegue de código con conexión y destino válidos
- **THEN** el sistema descarga el directorio remoto excluyendo `uploads/archivos/` a un snapshot nuevo
- **AND** registra metadata, cantidad de archivos, tamaño y checksums
- **AND** solo habilita el despliegue después de validar el snapshot

#### Scenario: Backup incremental dedicado de uploads
- **WHEN** el operador ejecuta `./deploy.sh backup-uploads`
- **THEN** el sistema sincroniza localmente el contenido remoto de `uploads/archivos/` sin alterar producción

#### Scenario: Rollback de codigo preservando archivos subidos
- **WHEN** el operador selecciona un snapshot cuya metadata coincide con el destino
- **AND** confirma el rollback
- **THEN** el sistema restaura el código y configuración respaldados sin borrar `uploads/archivos/`
- **AND** informa el resultado y ejecuta verificaciones HTTP
