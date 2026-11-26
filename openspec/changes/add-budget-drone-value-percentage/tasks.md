## 1. Dominio y Selectores
- [x] 1.1 Agregar función pura y selector en `reparacion.selectors.ts` para resolver el `ModeloDrone` de una reparación (`DroneId -> ModeloDroneId` con fallback único por `ModeloDroneNameRep`) y calcular el porcentaje del presupuesto respecto a `PrecioReferencia`.
- [x] 1.2 Cubrir los casos borde: modelo sin `PrecioReferencia` (`0`/vacío), reparación sin modelo resoluble y presupuesto en `0` o editado manualmente en vivo.

## 2. Interfaz de Usuario (`ReparacionPresupuesto`)
- [x] 2.1 Mostrar debajo de `Presupuesto Final $` (solo cuando `isAdmin` es `true`) el porcentaje respecto al valor del modelo y su precio de referencia formateado en ARS, reactivo al valor actual del campo.
- [x] 2.2 Mostrar leyenda informativa cuando el modelo no tenga precio de referencia cargado (incluyendo enlace rápido a `/inicio/modelos-drone/:id`) o cuando no pueda resolverse el modelo.

## 3. Validación
- [x] 3.1 Agregar pruebas unitarias del cálculo/selector en `reparacion.selectors.test.ts`.
- [x] 3.2 Agregar pruebas de componente en `ReparacionPresupuesto.test.tsx` (porcentaje con precio cargado, leyenda sin precio, ocultamiento para no-admin).
- [x] 3.3 Validar con `openspec validate add-budget-drone-value-percentage --strict --no-interactive` y ejecutar tests.
