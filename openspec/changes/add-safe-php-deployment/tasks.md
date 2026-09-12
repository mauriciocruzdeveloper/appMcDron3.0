## 1. Configuracion segura
- [x] 1.1 Crear `.deploy.env.example` sin credenciales reales y excluir la configuracion privada.
- [x] 1.2 Validar dependencias, permisos del archivo privado, rama, limpieza y sincronizacion Git.
- [x] 1.3 Verificar conexion FTPS y ruta remota sin modificar el servidor.

## 2. Backup y paquete
- [x] 2.1 Descargar un snapshot completo y fechado del directorio remoto antes de cada deploy.
- [x] 2.2 Validar marcadores, cantidad, tamano y checksums del snapshot; abortar ante cualquier falla.
- [x] 2.3 Construir el staging exclusivamente desde `git archive HEAD` y excluir archivos de desarrollo.

## 3. Deploy y rollback
- [x] 3.1 Implementar `--dry-run` sin escrituras remotas.
- [x] 3.2 Implementar deploy aditivo que preserve `.env`, logs y datos remotos no versionados.
- [x] 3.3 Implementar rollback explicito desde un snapshot validado.
- [x] 3.4 Verificar sitio publicado y denegacion HTTP de `.env`.
- [x] 3.5 Verificar por SHA-256 cada archivo publicado y ofrecer un comando `verify` de solo lectura.

## 4. Verificacion y documentacion
- [ ] 4.1 Probar fallas de conexion, backup vacio, repo sucio y destino incorrecto.
- [ ] 4.2 Probar backup, dry-run y rollback contra un directorio remoto de prueba antes de produccion.
- [x] 4.3 Documentar configuracion, uso normal, restauracion y manejo seguro de backups.
