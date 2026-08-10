## 1. Data model
- [x] 1.1 Agregar columna `professional_notes` (text, nullable) a tabla `user` en Supabase (SQL en `sql/`)
- [x] 1.2 Agregar `ObservacionesProfesionales?: string` a `Usuario['data']` en `src/types/usuario.ts`

## 2. Persistencia
- [x] 2.1 Mapear `professional_notes` <-> `ObservacionesProfesionales` en
      `getUsuariosPersistencia`, `getClientePersistencia`,
      `getClientePorEmailPersistencia` y `guardarUsuarioPersistencia`

## 3. UI
- [x] 3.1 Agregar textarea "Observaciones profesionales" en `Usuario.component.tsx`,
      visible solo si `canManageUsuarios` (admin)
- [x] 3.2 Sin límite de longitud (columna TEXT, campo de escritura libre)

## 4. Validación
- [ ] 4.1 Probar alta/edición de usuario como admin y confirmar que el campo persiste
- [ ] 4.2 Confirmar que un cliente/partner no ve el campo en su propio perfil

## 5. Recibo / Tránsito
- [x] 5.1 Agregar card roja "OBSERVACIONES PROFESIONALES CONFIDENCIALES" en
      `Presupuesto.component.tsx`, visible solo si `isAdmin`
- [x] 5.2 Propagar `ObservacionesProfesionales` en `guardarReciboAsync` y
      `guardarTransitoAsync` al construir el usuario a persistir
- [x] 5.3 Completar el campo vía update posterior cuando el usuario es nuevo
      (endpoint de registro no soporta `professional_notes`)
- [ ] 5.4 Probar alta de cliente nuevo desde Recibido y desde Tránsito y
      confirmar que la nota queda guardada en la ficha del usuario
