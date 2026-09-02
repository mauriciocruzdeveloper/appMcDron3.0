## Why
Hoy los cambios de estado a `Enviado` y `Finalizado` no notifican al cliente por email.
Esto deja sin confirmacion formal tanto el despacho y su seguimiento como el cierre completo
de la reparacion.

## What Changes
- Al cambiar una reparacion a `Enviado`, el sistema SHALL enviar al cliente un email con los
  datos del drone, el numero de reparacion y el codigo de seguimiento.
- Si el codigo de seguimiento corresponde a Andreani, el email de envio SHALL incluir un
  enlace al seguimiento oficial, usando la misma deteccion disponible en la pagina de la
  reparacion.
- Al cambiar una reparacion a `Finalizado`, el sistema SHALL enviar al cliente un email de
  cierre, diferenciado del aviso existente de `Reparado`.
- Ambos emails SHALL usar el email de contacto del usuario cuando exista y, en caso contrario,
  el email guardado en la reparacion, siguiendo el criterio de las notificaciones actuales.
- La UI SHALL informar si la transicion y su email se completaron o si el envio del email fallo.

## Impact
- Affected specs: reparaciones-notificaciones
- Affected code:
  - `src/redux-tool-kit/app/app.actions.ts`
  - `src/redux-tool-kit/reparacion/reparacion.actions.ts`
  - `src/components/Reparacion/sections/ReparacionEntrega.tsx`
  - `src/utils/tracking.ts`
  - `mcdron-web-php/api/`
  - `mcdron-web-php/usecases/`
  - `mcdron-web-php/services/`
  - pruebas enfocadas de acciones, seguimiento y endpoints de email
