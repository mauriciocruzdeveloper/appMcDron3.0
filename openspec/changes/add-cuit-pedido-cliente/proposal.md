## Why
Los pedidos de repuestos para compras internacionales requieren registrar el CUIT de la empresa o cliente asociado al pedido. Hoy ese dato no existe ni en la entidad cliente ni en la entidad pedido, por lo que el ingreso manual es repetitivo, frágil y poco recordable.

## What Changes
- Se agrega un CUIT opcional al perfil del cliente/usuario para recordar el dato una sola vez.
- Se agrega un CUIT opcional al pedido de repuestos para soportar compras internacionales sin bloquear el flujo habitual.
- En el formulario del pedido se ofrece un selector de clientes que ya tienen CUIT cargado y, además, un campo manual para casos excepcionales.
- Al seleccionar un cliente con CUIT, el pedido lo precarga automáticamente y mantiene el valor normalizado.
- La persistencia se extiende con columnas en la tabla `user` y `purchase_order`, sin logicar reglas de negocio en la capa de datos.

## Impact
- Affected specs: clientes/usuarios y pedidos de repuestos
- Affected code: `src/types/usuario.ts`, `src/types/pedidoRepuesto.ts`, `src/components/Usuario.component.tsx`, `src/components/Pedido.component.tsx`, `src/persistencia/persistenciaSupabase/usuariosPersistencia.js`, `src/persistencia/persistenciaSupabase/pedidosPersistencia.js`, y migraciones SQL para `user.cuit` y `purchase_order.customer_cuit`.
