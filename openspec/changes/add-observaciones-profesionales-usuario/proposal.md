## Why
Los administradores necesitan registrar en la ficha de usuario/cliente notas
internas sobre a qué se dedica el cliente y otros datos relevantes, para poder
evaluar más adelante si es un cliente de valor o prioritario. Hoy no existe
ningún campo para esto.

## What Changes
- Nuevo campo `ObservacionesProfesionales` (texto libre, opcional) en la
  entidad Usuario.
- Nuevo input "Observaciones profesionales" en la ficha de usuario
  (`Usuario.component.tsx`), visible y editable solo para admins
  (`canManageUsuarios`), no visible para el propio cliente/partner.
- Mismo campo agregado al formulario de recibo/tránsito de drone
  (`Presupuesto.component.tsx`), en una card roja "OBSERVACIONES
  PROFESIONALES CONFIDENCIALES" (mismo estilo que ANOTACIONES CONFIDENCIALES
  de reparación), visible solo si `isAdmin`. Permite cargar la nota apenas se
  da de alta el cliente en recepción/tránsito.
- Persistencia: nueva columna en tabla `user` (Supabase) mapeada en
  `usuariosPersistencia.js` (capa de datos, sin reglas de negocio). Para
  usuarios nuevos creados vía endpoint de registro (que no soporta el campo),
  se aplica un update posterior con el valor.
- Sin validaciones de negocio nuevas; el campo no tiene límite de longitud
  (columna TEXT).

## Impact
- Affected specs: usuarios (ficha de usuario/cliente, recibo/tránsito)
- Affected code: `src/types/usuario.ts`, `src/components/Usuario.component.tsx`,
  `src/components/Presupuesto.component.tsx`,
  `src/redux-tool-kit/reparacion/reparacion.actions.ts`,
  `src/persistencia/persistenciaSupabase/usuariosPersistencia.js`,
  migración SQL para columna nueva en `user`.
