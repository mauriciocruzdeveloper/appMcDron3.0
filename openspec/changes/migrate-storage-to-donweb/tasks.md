## 1. Backend de archivos en mcdron-web-php (Etapa 1)
- [x] 1.1 Crear helper de autenticación `auth/admin_auth.php` que valide `X-API-KEY`, verifique el Bearer token contra Supabase Auth y confirme `role = 'admin'` en la tabla `user`.
- [x] 1.2 Crear `api/upload_file.php` (validación de path lógico sin `..`, MIME real con `finfo`, tamaño máximo, escritura en `uploads/archivos/<path>` y retorno de `publicUrl`).
- [x] 1.3 Crear `api/delete_file.php` (eliminación segura de archivo e intento de borrado de su `_thumb.jpg` asociado dentro de `uploads/archivos/`).
- [x] 1.4 Agregar `uploads/.htaccess` (bloqueo de ejecución PHP/scripts, `X-Content-Type-Options: nosniff` y `Cache-Control` para estáticos) y actualizar `.htaccess` raíz con rutas y CORS (`Authorization`, `X-Supabase-Auth`).
- [x] 1.5 Optimizar `usecases/generate_budget_pdf.php` para leer desde disco local cuando la URL de la foto pertenece a `/uploads/archivos/` del propio servidor (con fallback HTTP).
- [x] 1.6 Ajustar `deploy.sh` y `DEPLOYMENT.md` para excluir `uploads/` del backup/rollback de código y agregar el subcomando `backup-uploads`.

## 2. Capa de persistencia en appMcDron3.0 (Etapa 1)
- [x] 2.1 Actualizar `src/persistencia/persistenciaSupabase/archivosPersistencia.js` para subir archivos y pares original + `_thumb.jpg` al endpoint PHP enviando el JWT de sesión actual.
- [x] 2.2 Soportar en `eliminarArchivoPersistencia` tanto URLs de DonWeb (`/uploads/archivos/...`) como URLs legacy de Supabase Storage (`/object/public/...`).
- [x] 2.3 Incluir `informe_photo_urls` al eliminar archivos asociados en `eliminarReparacionPersistencia` (`reparacionesPersistencia.js`).
- [x] 2.4 Agregar tests unitarios de `archivosPersistencia` cubriendo subida, generación de miniatura, borrado en DonWeb y fallback de borrado legacy en Supabase.

## 3. Script de migración y pruebas (Etapas 2 y 3)
- [x] 3.1 Crear `scripts/migrar_storage_donweb.js` con modos `--dry-run`, `--download` (descarga completa del bucket `archivos`), `--verify-urls` y `--update-db` (reemplazo idempotente de URLs en `repair`, `repair_intervention` y `part`).
- [x] 3.2 Probar flujo completo en ramas `feat/storage-donweb` (subida de foto de reparación, informe, intervención, repuesto, documento, miniatura y borrado) sin tocar datos de producción.
