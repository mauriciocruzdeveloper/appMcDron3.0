## Why
El "Informe de Reparación o Diagnóstico" (`DescripcionTecRep`) es hoy solo texto. El
técnico no puede adjuntar fotos que respalden el informe (por ejemplo, evidencia del
trabajo realizado o del diagnóstico), y el cliente no las recibe en el email de
"Drone Reparado" cuando la reparación finaliza.

## What Changes
- Se agrega un array de fotos dedicado al informe de reparación/diagnóstico
  (`FotosInformeRep` en frontend), independiente de `urlsFotos` (galería general
  antes/después) y de `asignacion.data.fotos` (fotos de intervenciones).
- En la sección Reparar, debajo del textarea del informe, el admin puede subir y
  eliminar fotos asociadas al informe, con el mismo patrón de UI usado para las
  fotos de asignaciones (input file, miniaturas, botón eliminar).
- Al enviar el email de "Drone Reparado" (`enviarDroneReparadoAsync`), el body
  incluye las fotos del informe (`fotos_informe`). **No** se incluyen fotos de
  intervenciones/asignaciones en este email.
- El backend (`send_drone_reparado.php`, `email_drone_reparado_template.php`)
  renderiza esas fotos en un grid `<img>`, reutilizando el patrón visual ya
  existente en `email_repair_budget_template.php`.
- La lógica de guardado/validación de fotos del informe vive en
  `reparacion.actions.ts`; la persistencia (Supabase) solo hace CRUD del nuevo
  campo, sin lógica de negocio.

## Impact
- Affected specs: reparaciones-informe (nuevo)
- Affected code:
  - src/types/reparacion.ts
  - src/redux-tool-kit/reparacion/reparacion.actions.ts
  - src/redux-tool-kit/app/app.actions.ts
  - src/persistencia/persistenciaSupabase/reparacionesPersistencia.js
  - src/components/Reparacion/sections/ReparacionReparar.tsx
  - mcdron-web-php/api/send_drone_reparado.php
  - mcdron-web-php/usecases/send_email_drone_reparado.php
  - mcdron-web-php/services/email_drone_reparado_template.php
