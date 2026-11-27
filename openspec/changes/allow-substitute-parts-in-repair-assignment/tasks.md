## 1. Dominio y Casos de Uso
- [x] 1.1 Crear helper puro en `src/usecases/` para comparar los repuestos efectivos de una asignación (`repuestosSnapshot` + `incluyeRepuestosTaller`) contra los repuestos base de la intervención en catálogo, determinando si hubo sustitución o resolución sin repuesto de stock.
- [x] 1.2 Crear helper puro en `src/usecases/` para insertar, actualizar o eliminar de manera idempotente la línea aclaratoria automática de una asignación dentro de `DescripcionTecRep`, sin pisar el resto del texto libre del técnico.

## 2. Persistencia (solo acceso a datos)
- [x] 2.1 Agregar `actualizarRepuestosAsignacionPersistencia` en `src/persistencia/persistenciaSupabase/reparacionesPersistencia.js` (y paridad en `persistenciaFirebase.js` + re-exports) para persistir `parts_snapshot`, `includes_workshop_parts` y costos opcionales ya calculados por la capa de acciones.

## 3. Reglas de Negocio (Redux Actions)
- [x] 3.1 Implementar `actualizarRepuestosAsignacionAsync` (y soporte de restauración al catálogo) en `src/redux-tool-kit/reparacion/reparacion.actions.ts` validando estado `Aceptado`/`Repuestos`, asignación `pendiente` y repuestos no obsoletos, preservando precios y `PresuFiRep` en asignaciones `presupuestada`, recargando asignaciones/compromiso y actualizando `DescripcionTecRep`.
- [x] 3.2 Incluir nota descriptiva en `stock_movement.note` durante `consumirRepuestosDeReparacion` cuando el consumo provenga de una asignación cuyos repuestos fueron sustituidos respecto del catálogo.

## 4. Interfaz de Usuario (`ReparacionReparar`)
- [x] 4.1 Mostrar en cada ítem de `Tareas a Realizar` los repuestos efectivos actuales y un badge cuando difieran de los repuestos estándar de la intervención (sustituto o sin repuesto de stock).
- [x] 4.2 Incorporar editor inline por asignación `pendiente` (solo admin en `Aceptado`/`Repuestos`) con selector buscable de todo el inventario activo (priorizando compatibles con el modelo del drone), cantidades, opción de dejar sin repuestos de stock y botón `Restaurar original`, sincronizado con el campo `DescripcionTecRep`.

## 5. Validación
- [x] 5.1 Agregar pruebas unitarias de helpers (`usecases`), thunks (`reparacion.actions`) y componente (`ReparacionReparar.test.tsx`) cubriendo sustitución, resolución sin repuesto, restauración, preservación de `PresuFiRep`, nota en `DescripcionTecRep` y consumo de stock al pasar a `Reparado`.
- [x] 5.2 Ejecutar `openspec validate allow-substitute-parts-in-repair-assignment --strict` y suite de tests con `npx react-scripts test --watchAll=false`.
