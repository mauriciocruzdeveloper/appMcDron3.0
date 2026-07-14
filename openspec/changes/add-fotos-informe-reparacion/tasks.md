## 1. Datos y persistencia
- [x] 1.1 Agregar campo `FotosInformeRep?: string[]` a `DataReparacion` (src/types/reparacion.ts)
- [x] 1.2 Agregar columna `informe_photo_urls` (array de texto) en la tabla de reparaciones (Supabase)
- [x] 1.3 Mapear lectura/escritura `informe_photo_urls` <-> `FotosInformeRep` en `reparacionesPersistencia.js` (solo CRUD, sin lógica de negocio)

## 2. Acciones de dominio
- [x] 2.1 Crear `subirFotoInformeAsync` (app.actions.ts) siguiendo el patrón de `subirFotoAsignacionAsync`: subir imagen a storage y actualizar `FotosInformeRep`
- [x] 2.2 Crear/extender acción para eliminar una foto del informe (borrar de storage + actualizar array)
- [x] 2.3 Incluir `fotos_informe: reparacion.data.FotosInformeRep || []` en el body de `enviarDroneReparadoAsync`, sin agregar fotos de intervenciones

## 3. Frontend UI
- [x] 3.1 En `ReparacionReparar.tsx`, agregar debajo del textarea del informe una sección de fotos: input para subir, grid de miniaturas, botón eliminar por foto (reutilizar estilo/lógica de `AsignacionIntervencionDetalle.component.tsx`)
- [x] 3.2 Deshabilitar subida/eliminación cuando `!isAdmin`
- [x] 3.3 Mostrar estado de carga ("Subiendo...") durante la subida

## 4. Backend / Email
- [x] 4.1 Extender `send_drone_reparado.php` (y `send_drone_diagnosticado.php`) para aceptar y sanitizar `fotos_informe` (array de URLs)
- [x] 4.2 Extender `send_email_drone_reparado.php` (y `send_email_drone_diagnosticado.php`) para armar el HTML de fotos (grid `<img>`) reutilizando CSS `.foto-grid`/`.foto-item`
- [x] 4.3 Extender `email_drone_reparado_template.php` (y `email_drone_diagnosticado_template.php`) con el placeholder `{{fotos_informe}}` (vacío si no hay fotos)

## 5. Validación manual
- [ ] 5.1 Subir/eliminar fotos del informe como admin y verificar persistencia tras recargar
- [ ] 5.2 Marcar reparación como Reparado/Diagnosticado y verificar que el email incluye las fotos del informe y NO incluye fotos de intervenciones
- [ ] 5.3 Verificar comportamiento cuando no hay fotos cargadas (sección/placeholder oculto en el email)
- [ ] 5.4 Ejecutar `ALTER TABLE` de `sql/migration_add_informe_photo_urls.sql` en Supabase (dev/prod)
