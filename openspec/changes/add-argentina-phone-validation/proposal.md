## Why
Los clientes pueden guardarse hoy con cualquier texto en `TelefonoUsu`, tanto desde su ficha como desde los flujos de recepción, tránsito y presupuesto. Esto deja datos de contacto inutilizables y traslada el error a comunicaciones posteriores por llamada o SMS.

## What Changes
- Se valida todo teléfono no vacío como número argentino antes de guardar un cliente.
- Se aceptan los formatos nacionales e internacionales habituales, incluidos `3416559834`, `03416559834`, `+543416559834` y `+5493416559834`, además de separadores visuales comunes.
- Se contempla el formato móvil nacional tradicional con prefijos `0` y `15`, eliminados al marcar internacionalmente.
- La regla se centraliza en un caso de uso de dominio y es invocada por las acciones de usuario, recepción, tránsito y presupuesto antes de cualquier escritura.
- Un teléfono inválido bloquea el guardado y muestra un mensaje con ejemplos válidos; un teléfono vacío continúa siendo opcional.
- La validación no cambia el valor almacenado ni agrega lógica de negocio a `persistencia/`.

## Impact
- Affected specs: clientes y altas de reparación
- Affected code: `src/usecases/`, `src/redux-tool-kit/usuario/usuario.actions.ts`, `src/redux-tool-kit/reparacion/reparacion.actions.ts` y pruebas unitarias asociadas.
- No requiere cambios de base de datos ni dependencias externas.