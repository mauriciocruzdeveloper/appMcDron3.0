## Context
El cambio de estado se orquesta en `cambiarEstadoReparacionAsync`. Los emails actuales se
construyen desde thunks de `app.actions.ts` que llaman endpoints PHP autenticados. La seccion
de entrega ya guarda `SeguimientoEntregaRep` y usa `buildAndreaniTrackingUrl` para reconocer
codigos Andreani de 15 digitos.

El aviso existente de `Reparado` comunica que termino el trabajo tecnico y que el drone esta
listo para retirar. El nuevo aviso de `Finalizado` representa el cierre posterior del proceso,
por lo que no debe reutilizar ese contenido como si ambos eventos fueran equivalentes.

## Goals / Non-Goals
- Goals: enviar automaticamente los avisos de `Enviado` y `Finalizado`; incluir seguimiento
  en el primero; mantener estilo, destinatario y seguridad de los emails actuales.
- Non-Goals: cambiar las transiciones permitidas, modificar el formato de los codigos de
  seguimiento, reenviar historicamente emails o reemplazar el email actual de `Reparado`.

## Decisions
- Decision: la decision de enviar cada email permanecera en el thunk de cambio de estado y
  no en persistencia. Esto mantiene las reglas y efectos de negocio en Redux.
- Decision: se crearan endpoints y plantillas separados para `Enviado` y `Finalizado`. Los
  eventos tienen contenido y significado distintos y deben poder evolucionar por separado.
- Decision: el frontend construira el enlace Andreani con `buildAndreaniTrackingUrl`. El
  backend verificara nuevamente el codigo y generara o aceptara solamente una URL bajo
  `https://www.andreani.com/envio/` para evitar enlaces arbitrarios en el email.
- Decision: un seguimiento de otro proveedor aparecera como texto, sin boton Andreani.
- Decision: la resolucion del destinatario conservara la precedencia existente:
  `EmailContacto` del usuario y luego `EmailUsu` de la reparacion.

## Risks / Trade-offs
- La reparacion se persiste antes de llamar al endpoint, como ocurre en las transiciones con
  email actuales. Si el correo falla, la accion informa el error pero no revierte el estado;
  la UI debe comunicarlo sin afirmar que el email fue enviado.
- Los clientes de correo interpretan HTML de forma diferente. Las plantillas usaran tablas o
  bloques y estilos inline compatibles con el patron existente.

## Migration Plan
No requiere cambios de base de datos. Se despliega primero el backend PHP con los endpoints
nuevos y luego la aplicacion que los invoca. El rollback consiste en desactivar `enviarEmail`
para estas dos transiciones y retirar las nuevas rutas.
