## ADDED Requirements

### Requirement: Backup obligatorio previo al despliegue
El sistema SHALL crear una copia local completa y fechada del directorio remoto antes
de modificar cualquier archivo de produccion. El backup SHALL incluir archivos ocultos
y configuracion privada, y SHALL almacenarse fuera del repositorio con permisos
restrictivos.

#### Scenario: Backup valido
- **WHEN** el operador inicia un despliegue con conexion y destino validos
- **THEN** el sistema descarga todo el directorio remoto a un snapshot nuevo
- **AND** registra metadata, cantidad de archivos, tamano y checksums
- **AND** solo habilita el despliegue despues de validar el snapshot

#### Scenario: Backup incompleto
- **WHEN** falla una descarga, el snapshot esta vacio o falta un marcador esperado
- **THEN** el sistema aborta antes de realizar cualquier escritura remota
- **AND** elimina el intento incompleto para no conservar copias parciales con secretos

### Requirement: Paquete de despliegue controlado
El sistema SHALL desplegar solamente archivos provenientes del commit Git validado y
SHALL excluir secretos y archivos locales no versionados.

#### Scenario: Repositorio listo
- **WHEN** `main` esta limpio y sincronizado con `origin/main`
- **THEN** el sistema construye el paquete desde `HEAD`
- **AND** el paquete no contiene `.env`, `.git` ni logs locales

#### Scenario: Repositorio no apto
- **WHEN** existen cambios locales, otra rama esta activa o `main` no coincide con el remoto
- **THEN** el sistema rechaza el despliegue sin conectarse en modo escritura

### Requirement: Despliegue conservador
El sistema SHALL actualizar el codigo remoto sin eliminar automaticamente archivos que
no formen parte del paquete, preservando especialmente `.env` y datos mutables.

#### Scenario: Despliegue exitoso
- **WHEN** el backup y el paquete fueron validados y el operador confirma
- **THEN** el sistema sube los archivos versionados por FTPS con certificado verificado
- **AND** conserva `.env` y archivos remotos no administrados por Git
- **AND** ejecuta verificaciones HTTP posteriores

#### Scenario: Previsualizacion
- **WHEN** el operador ejecuta `--dry-run`
- **THEN** el sistema muestra el destino y las operaciones previstas
- **AND** no modifica archivos remotos

### Requirement: Rollback desde snapshot
El sistema SHALL permitir restaurar un snapshot local validado mediante una operacion
separada y confirmada explicitamente.

#### Scenario: Restauracion confirmada
- **WHEN** el operador selecciona un snapshot cuya metadata coincide con el destino
- **AND** confirma el rollback
- **THEN** el sistema restaura el contenido respaldado
- **AND** informa el resultado y ejecuta verificaciones HTTP

#### Scenario: Snapshot invalido
- **WHEN** falta metadata, checksums o archivos marcadores del snapshot
- **THEN** el sistema rechaza el rollback sin modificar produccion
