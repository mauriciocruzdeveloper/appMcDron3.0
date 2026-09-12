## Context
El hosting no ofrece acceso SSH desde el entorno actual. El mecanismo disponible es
FTPS mediante `lftp`. El directorio remoto contiene codigo, configuracion privada y
posibles archivos mutables, por lo que no es seguro reemplazarlo sin snapshot.

## Goals / Non-Goals
- Goals: backup remoto completo, despliegue reproducible, proteccion de secretos,
  verificacion posterior y rollback operable.
- Non-Goals: despliegue sin interrupcion por intercambio atomico de directorios,
  provisionamiento automatico de credenciales o rotacion automatica de secretos.

## Decisions
- El script SHALL leer credenciales desde un archivo privado fuera del repositorio,
  con permisos restrictivos, y nunca imprimirlas.
- Los backups SHALL almacenarse por defecto en
  `$HOME/mcdron-deploy-backups/mcdron-web-php/<timestamp>/remote/` con permisos
  restrictivos. No habra borrado automatico de backups en la primera version.
- El backup SHALL descargar el contenido completo del directorio remoto, incluido
  `.env`, y generar metadata con fecha, host, ruta remota, commit, cantidad de
  archivos, bytes y checksums locales. Un intento incompleto SHALL eliminarse para
  no conservar copias parciales con secretos.
- El deploy SHALL crear un staging local con `git archive HEAD`. Solo archivos
  versionados podran entrar al paquete; `.env` nunca se incluira.
- El deploy SHALL ser aditivo: actualiza archivos del paquete pero no elimina por
  defecto archivos remotos ausentes. Esto preserva `.env`, logs y datos mutables.
- El rollback SHALL aceptar un snapshot concreto, validar su metadata y requerir
  confirmacion. Restaurara el snapshot completo para recuperar el estado previo.
- El modo `--dry-run` SHALL mostrar operaciones previstas sin modificar el servidor.
- El script SHALL rechazar un arbol Git sucio, una rama distinta de `main` o un HEAD
  no sincronizado con `origin/main`.
- FTPS SHALL verificar el certificado. El script no incluira una opcion silenciosa
  para deshabilitar esa verificacion.

## Risks / Trade-offs
- Un backup completo contiene secretos. Mitigacion: ubicacion fuera del repo,
  permisos `700/600`, salida sin valores y advertencia de no sincronizarlo a nubes.
- FTPS no permite un intercambio atomico tan robusto como SSH. Mitigacion: backup
  obligatorio, despliegue aditivo, validaciones previas y rollback independiente.
- Un despliegue aditivo puede dejar archivos obsoletos. Mitigacion: no borrarlos
  automaticamente; registrar el inventario para una limpieza manual revisada.
- Restaurar un snapshot completo puede sobrescribir cambios producidos despues del
  backup. Mitigacion: confirmacion explicita y metadata visible antes del rollback.

## Migration Plan
1. Crear configuracion privada de despliegue y probar conexion en modo lectura.
2. Ejecutar `--dry-run` y revisar destino, backup y lista de archivos.
3. Ejecutar un backup sin despliegue y validar su integridad local.
4. Ejecutar el primer deploy con backup obligatorio.
5. Verificar HTTP, formularios y endpoints antes de retirar credenciales antiguas.

## Confirmed Environment
- El sitio principal corresponde a `public_html`.
- El servidor acepta FTPS explicito en el puerto `21` con certificado valido.
