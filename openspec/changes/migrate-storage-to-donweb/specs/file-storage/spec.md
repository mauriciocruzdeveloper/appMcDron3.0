## ADDED Requirements

### Requirement: Subida autenticada y validada de archivos en DonWeb
El backend PHP SHALL exponer un endpoint `POST /api/upload_file` que solo permita subir archivos a usuarios autenticados con rol `admin`, validando ruta destino y tipo de contenido real antes de persistir en disco.

#### Scenario: Administrador sube imagen con miniatura
- **WHEN** la aplicación envía un archivo JPEG válido y su miniatura `_thumb.jpg` con `X-API-KEY` y Bearer token de un usuario `admin` hacia una ruta lógica permitida (por ejemplo `REPARACIONES/123/fotos/img_1.jpg`)
- **THEN** el backend escribe los archivos bajo `uploads/archivos/REPARACIONES/123/fotos/`
- **AND** responde HTTP 200 con la URL pública HTTPS correspondiente

#### Scenario: Rechazo por falta de permisos o ruta inválida
- **WHEN** una solicitud carece de token válido de `admin`, intenta usar secuencias `..` en la ruta o envía un archivo cuyo MIME real no está permitido (por ejemplo un script `.php`)
- **THEN** el backend rechaza la operación con código HTTP 400/403
- **AND** no escribe ningún archivo en el servidor

### Requirement: Directorio público de subidas sin ejecución de scripts
El directorio `uploads/` SHALL servir únicamente contenido estático sin permitir listado de directorios ni ejecución de motores de scripting del servidor.

#### Scenario: Solicitud directa de imagen publicada
- **WHEN** un navegador, cliente de correo o generador de PDF solicita una URL pública bajo `/uploads/archivos/`
- **THEN** el servidor entrega el archivo estático con encabezados de caché HTTP

### Requirement: Eliminación compatible durante convivencia de proveedores
La capa de persistencia de archivos SHALL eliminar archivos alojados en DonWeb mediante `POST /api/delete_file` (incluyendo su miniatura `_thumb.jpg` si existe) y SHALL conservar soporte para eliminar URLs históricas de Supabase Storage mientras existan referencias previas a la migración.

#### Scenario: Eliminación de foto alojada en DonWeb
- **WHEN** un administrador elimina una foto cuya URL apunta a `/uploads/archivos/...`
- **THEN** el backend elimina el archivo original y su variante `_thumb.jpg` si existe

#### Scenario: Eliminación de foto histórica en Supabase antes de migrar
- **WHEN** un administrador elimina una foto cuya URL apunta a `/storage/v1/object/public/...`
- **THEN** la capa de persistencia la elimina del bucket correspondiente en Supabase Storage

### Requirement: Migración por etapas e idempotente de archivos históricos
El proyecto SHALL proveer un script de migración ejecutable en modo simulación (`--dry-run`), descarga de objetos y actualización idempotente de prefijos de URL en las columnas de `repair`, `repair_intervention` y `part` sin borrar los archivos originales en Supabase.

#### Scenario: Simulación previa a la migración
- **WHEN** el operador ejecuta el script con `--dry-run`
- **THEN** el script informa cuántos objetos y filas de base de datos serían actualizados sin modificar archivos ni registros
