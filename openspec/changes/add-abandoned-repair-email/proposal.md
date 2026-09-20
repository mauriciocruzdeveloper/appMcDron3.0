## Why
La reparacion ya contempla el estado terminal `Abandonado`, pero el cliente debe ser
notificado antes del cierre definitivo. Se necesita un flujo en dos pasos que respete la
antiguedad del ingreso, otorgue un plazo de retiro y evite reabrir reparaciones abandonadas.

## What Changes
- Mostrar `Enviar aviso de abandono` cuando hayan transcurrido 3 meses calendario desde
  `FeRecRep` y la reparacion este en `Respondido`, `Transito`, `Presupuestado`, `Repuestos`,
  `Reparado`, `Diagnosticado` o `Cobrado`.
- Mostrar en el inicio administrativo una lista de reparaciones listas para enviar el aviso,
  obtenida mediante un selector memoizado de Reselect y con acceso al detalle.
- Enviar el email sin cambiar el estado actual y guardar `FechaAvisoAbandono` solo cuando
  el envio se complete correctamente.
- Durante los 7 dias siguientes permitir cancelar el aviso, limpiando su fecha y
  conservando el estado de la reparacion.
- Habilitar `Marcar como abandonado` solo al cumplirse 7 dias desde el aviso; esta accion
  cambia el estado definitivamente y no envia un segundo email.
- Mantener `Abandonado` como estado terminal irreversible. Si el cliente regresa, el flujo
  continua mediante una nueva reparacion vinculada, no reabriendo la anterior.
- Permitir la transicion a `Abandonado` solo desde `Respondido`, `Transito`,
  `Presupuestado`, `Repuestos`, `Reparado`, `Diagnosticado` y `Cobrado`.
- Excluir la accion en estados donde el administrador todavia debe responder, revisar,
  presupuestar, reparar, diagnosticar, cobrar o enviar; tambien en estados terminales y
  legacy.
- Enviar al cliente un email de aviso previo, informando que dispone de 7 dias
  para retirar el drone y que, vencido ese plazo, el equipo sera dispuesto por el servicio
  tecnico.
- Informar el exito o fallo del aviso sin marcar la reparacion como abandonada cuando el
  email no pudo enviarse.
- Reemplazar la accion de abandono ubicada actualmente en la seccion de entrega para evitar
  accesos duplicados con reglas de visibilidad diferentes.

## Impact
- Affected specs: `reparaciones-intervenciones`, `reparaciones-notificaciones`.
- Affected code: mapa de estados y tests en `src/usecases/`, orquestacion Redux en
  `src/redux-tool-kit/`, acciones del detalle y dashboard en `src/components/`, y nuevo
  endpoint/caso de uso/plantilla en `mcdron-web-php`.
- Database: nueva columna nullable `abandonment_notice_date` en `repair`.
- La regla temporal vive en selectores/acciones; `persistencia/` solo mapea y guarda la fecha.