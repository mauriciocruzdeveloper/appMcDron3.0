## Why
Al presupuestar una reparación, el administrador necesita saber qué porcentaje representa el monto cobrado (`PresuFiRep`) respecto al valor de referencia del modelo de drone (`PrecioReferencia`), para evaluar rápidamente si el presupuesto es razonable frente al valor del equipo o advertir cuando olvidó cargar el precio del modelo.

## What Changes
- Resolver el `ModeloDrone` asociado a la reparación priorizando `DroneId -> ModeloDroneId` y usando como respaldo coincidencia única por nombre normalizado con `ModeloDroneNameRep`.
- Calcular en capa de dominio/selectores la relación porcentual entre el monto de `Presupuesto Final $` y `PrecioReferencia` del `ModeloDrone`, contemplando los estados: modelo con precio cargado, modelo sin precio cargado (`<= 0`) y reparación sin modelo de catálogo asociado.
- Mostrar en `ReparacionPresupuesto` (solo para usuarios `admin`, debajo de `Presupuesto Final $`) el porcentaje junto al precio de referencia del modelo, o una leyenda clara cuando falte el precio de referencia (con enlace directo a editar el modelo) o no haya modelo asociado.
- No modificar emails, PDFs de presupuesto, esquema de base de datos ni capa de persistencia.

## Impact
- Affected specs: `reparaciones-presupuesto`
- Affected code: `src/redux-tool-kit/reparacion/reparacion.selectors.ts`, `src/components/Reparacion/sections/ReparacionPresupuesto.tsx` y sus pruebas unitarias/de componente.
- Database: sin cambios (reutiliza `drone_model.price_ref` -> `ModeloDrone.data.PrecioReferencia`).
