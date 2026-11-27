## Why
Desde la sección **CONSULTA** de la ficha de reparación, el administrador puede ver o cambiar el modelo de drone, pero no cuenta con un acceso directo para abrir su ficha en el catálogo (`/inicio/modelos-drone/:id`) y editar datos como el precio de referencia (`PrecioReferencia`).

## What Changes
- Exponer en `reparacion.selectors.ts` el selector `selectModeloDroneResueltoIdByReparacionId` reutilizando la resolución existente (`DroneId -> ModeloDroneId` y respaldo por coincidencia única en `ModeloDroneNameRep`).
- Mostrar en `ReparacionConsulta`, junto al campo **Modelo del Drone** (tanto en modo selector con `DroneId` como en modo texto sin `DroneId`), un botón de enlace hacia `/inicio/modelos-drone/:id` visible únicamente para usuarios `admin` cuando exista un modelo del catálogo asociado.
- Mantener intactos la capa de persistencia y el esquema de datos.

## Impact
- Affected specs: `reparaciones-consulta`
- Affected code: `src/redux-tool-kit/reparacion/reparacion.selectors.ts`, `src/redux-tool-kit/reparacion/index.ts`, `src/components/Reparacion/sections/ReparacionConsulta.tsx` y pruebas asociadas.
