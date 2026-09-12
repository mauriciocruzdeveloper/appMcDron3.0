## Why
El sitio `mcdron-web-php` se despliega manualmente y no existe un procedimiento
repetible para respaldar el servidor antes de modificarlo. Un error de copia puede
dejar produccion incompleta y sin una fuente inmediata para volver atras.

## What Changes
- Agregar un script de despliegue para `mcdron-web-php` basado en FTPS con
  verificacion de certificados habilitada.
- Exigir un backup local completo y fechado del directorio remoto antes de subir
  cualquier archivo.
- Abortar el despliegue si el backup falla, esta vacio o no contiene los archivos
  marcadores esperados del sitio.
- Construir el paquete desde el commit Git actual para impedir que `.env`, `.git`,
  logs locales u otros archivos no versionados se suban accidentalmente.
- Preservar `.env` y datos mutables existentes en el servidor durante el despliegue.
- Incorporar modos de previsualizacion y rollback que no ejecuten cambios sin una
  confirmacion explicita.
- Verificar el sitio y el bloqueo web de `.env` despues del despliegue.

## Impact
- Affected specs: php-deployment
- Affected code:
  - `mcdron-web-php/deploy.sh`
  - `mcdron-web-php/.gitignore`
  - `mcdron-web-php/.deploy.env.example`
  - `mcdron-web-php/DEPLOYMENT.md`
- External requirements: acceso FTPS a Ferozo y `lftp` instalado localmente.
