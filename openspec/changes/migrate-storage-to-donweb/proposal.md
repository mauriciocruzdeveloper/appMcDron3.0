## Why
Supabase Storage obliga a mantener el plan pago (USD 25/mes) al superar las cuotas gratuitas de almacenamiento/egress por las fotos y documentos cargados en reparaciones, intervenciones y repuestos. El hosting propio en DonWeb (`mauriciocruzdrones.com.ar`), donde ya corre `mcdron-web-php`, permite alojar y servir esos archivos estáticos sin costo adicional y bajar Supabase al plan Free.

## What Changes
- **Backend PHP (`mcdron-web-php`)**:
  - Agregar endpoints `POST /api/upload_file` y `POST /api/delete_file` protegidos con `X-API-KEY` más validación del JWT de Supabase Auth exigiendo rol `admin`.
  - Validar ruta lógica (`REPARACIONES/`, `ASIGNACIONES/`, `REPUESTOS/`), ausencia de *path traversal*, extensión y MIME real (`finfo`), guardando archivos bajo `uploads/archivos/<path>` y devolviendo su URL pública (`https://mauriciocruzdrones.com.ar/uploads/archivos/<path>`).
  - Agregar `uploads/.htaccess` para impedir ejecución de scripts en el directorio de subidas, deshabilitar índices y aplicar encabezados `Cache-Control` largos a archivos estáticos.
  - Actualizar `.htaccess` raíz para exponer las nuevas rutas y admitir el header `Authorization` en CORS.
  - Ajustar `deploy.sh` para excluir `uploads/` del backup/rollback automático de código (evitando descargar gigas de imágenes en cada deploy o borrar fotos nuevas en un rollback) e incorporar un comando separado `backup-uploads`.
- **Frontend / Persistencia (`appMcDron3.0`)**:
  - Actualizar `src/persistencia/persistenciaSupabase/archivosPersistencia.js` (manteniendo intacta la interfaz pública y sin lógica de negocio) para subir archivos e imágenes con miniatura `_thumb.jpg` hacia `mcdron-web-php`, conservando soporte en `eliminarArchivoPersistencia` para URLs nuevas (DonWeb) y legacy (Supabase Storage) durante la transición.
  - Incluir `informe_photo_urls` en la limpieza de archivos al eliminar una reparación en `reparacionesPersistencia.js`.
- **Herramienta de migración por etapas (`appMcDron3.0/scripts/`)**:
  - Agregar script de migración con `--dry-run`, descarga local del bucket `archivos` de Supabase y actualización idempotente de prefijos de URL en las tablas `repair`, `repair_intervention` y `part` para ejecutar en las Etapas 2 y 3 sin tiempo fuera de línea.

## Impact
- Affected specs: `file-storage` (nuevo), `php-deployment` (modificado)
- Affected code:
  - `mcdron-web-php/api/upload_file.php`
  - `mcdron-web-php/api/delete_file.php`
  - `mcdron-web-php/auth/admin_auth.php`
  - `mcdron-web-php/uploads/.htaccess`
  - `mcdron-web-php/.htaccess`
  - `mcdron-web-php/deploy.sh`
  - `mcdron-web-php/DEPLOYMENT.md`
  - `appMcDron3.0/src/persistencia/persistenciaSupabase/archivosPersistencia.js`
  - `appMcDron3.0/src/persistencia/persistenciaSupabase/reparacionesPersistencia.js`
  - `appMcDron3.0/scripts/migrar_storage_donweb.js`
