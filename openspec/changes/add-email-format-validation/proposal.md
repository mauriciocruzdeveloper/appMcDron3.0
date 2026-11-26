## Why
Al dar de alta una reparación (recepción, tránsito o presupuesto) o un cliente, si el correo electrónico contiene tildes, letra `ñ`, espacios o un formato inválido, el frontend intenta igualmente el guardado y recién falla en el backend PHP (`FILTER_VALIDATE_EMAIL`) o al enviar el recibo, devolviendo un error poco claro o dejando registros a mitad de flujo.

## What Changes
- Se crea un caso de uso reutilizable `validarEmail` que valida direcciones de correo electrónico en formato ASCII estándar compatible con el backend y normaliza espacios laterales (`trim`).
- Se rechazan explícitamente correos con tildes/diacríticos, `ñ`, espacios internos, dobles puntos o dominios sin TLD válido, devolviendo un mensaje claro al usuario.
- Se valida `EmailUsu` antes de cualquier escritura en `guardarReciboAsync`, `guardarTransitoAsync`, `guardarPresupuestadoAsync` y `guardarUsuarioAsync` (además de `EmailContacto` cuando se informa).
- En `Presupuesto.component.tsx` se valida el formato de email antes de abrir el modal de confirmación y se mejora la visualización de errores rechazados con objetos.

## Impact
- Affected specs: `clientes`
- Affected code: `src/usecases/validarEmail.ts`, `src/redux-tool-kit/reparacion/reparacion.actions.ts`, `src/redux-tool-kit/usuario/usuario.actions.ts`, `src/components/Presupuesto.component.tsx` y pruebas unitarias asociadas.
- No requiere cambios en base de datos ni en `persistencia/`.
