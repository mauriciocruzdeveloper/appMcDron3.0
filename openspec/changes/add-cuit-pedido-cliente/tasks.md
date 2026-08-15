## 1. Data model
- [x] 1.1 Agregar `cuit` a la tabla `user` en Supabase
- [x] 1.2 Agregar `customer_cuit` a la tabla `purchase_order` en Supabase
- [x] 1.3 Agregar `CUIT?: string` a `Usuario['data']`
- [x] 1.4 Agregar `CUIT?: string | null` a `PedidoRepuestoData`

## 2. Persistencia
- [x] 2.1 Mapear `cuit` <-> `CUIT` en `getUsuariosPersistencia`, `getClientePersistencia` y `guardarUsuarioPersistencia`
- [x] 2.2 Mapear `customer_cuit` <-> `CUIT` en `getPedidosPersistencia`, `getPedidoPersistencia` y `guardarPedidoPersistencia`

## 3. UI
- [x] 3.1 Agregar input de CUIT en `Usuario.component.tsx`
- [x] 3.2 Incluir selector de clientes con CUIT y campo manual en `Pedido.component.tsx`
- [x] 3.3 Normalizar y validar CUIT opcional en formularios

## 4. Validación
- [x] 4.1 Ejecutar pruebas unitarias del helper de normalización
- [ ] 4.2 Validar flujo de guardado de usuario y pedido con CUIT opcional
