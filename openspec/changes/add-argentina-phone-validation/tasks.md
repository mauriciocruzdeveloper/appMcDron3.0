## 1. Regla de dominio
- [x] 1.1 Implementar un caso de uso reutilizable que valide teléfonos argentinos opcionales sin modificar el valor recibido
- [x] 1.2 Cubrir formatos nacionales, internacionales, móvil internacional y móvil nacional tradicional
- [x] 1.3 Rechazar caracteres, prefijos, longitudes y ubicaciones del signo `+` no admitidos

## 2. Acciones
- [x] 2.1 Validar `TelefonoUsu` en `guardarUsuarioAsync` antes de llamar a persistencia
- [x] 2.2 Aplicar la misma validación en `guardarReciboAsync`, `guardarTransitoAsync` y `guardarPresupuestadoAsync`
- [x] 2.3 Devolver un mensaje de error legible con ejemplos de formatos válidos

## 3. Verificación
- [x] 3.1 Probar unitariamente los formatos válidos e inválidos de la regla argentina
- [x] 3.2 Verificar que `guardarUsuarioAsync` no persista un teléfono inválido
- [x] 3.3 Verificar que las altas de reparación no creen usuario, drone ni reparación cuando el teléfono es inválido
- [x] 3.4 Ejecutar las pruebas enfocadas de usuario, reparación y caso de uso