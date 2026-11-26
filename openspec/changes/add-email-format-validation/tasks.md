## 1. Regla de dominio
- [x] 1.1 Implementar caso de uso `validarEmail` con normalización `trim`, validación de formato ASCII estándar y soporte para email obligatorio u opcional
- [x] 1.2 Rechazar tildes, letra `ñ`, espacios internos, puntos consecutivos o extremos y dominios inválidos con un mensaje legible

## 2. Acciones y UI
- [x] 2.1 Validar y normalizar `EmailUsu` en `guardarReciboAsync`, `guardarTransitoAsync` y `guardarPresupuestadoAsync` antes de persistir
- [x] 2.2 Validar y normalizar `EmailUsu` y `EmailContacto` en `guardarUsuarioAsync` antes de persistir
- [x] 2.3 Validar el formato de `EmailUsu` en `Presupuesto.component.tsx` antes de confirmar el alta y formatear mensajes de error de objetos rechazados

## 3. Verificación
- [x] 3.1 Agregar pruebas unitarias de `validarEmail` (casos válidos, con tildes, `ñ`, espacios y formatos mal formados)
- [x] 3.2 Verificar en pruebas de acciones de reparación y usuario que un email inválido bloquee la persistencia
- [x] 3.3 Ejecutar suite de pruebas focalizadas y validar OpenSpec
