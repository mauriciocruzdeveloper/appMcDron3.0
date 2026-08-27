## Why
Actualmente los repuestos (`part`) en el inventario no cuentan con una foto adjunta. Esto dificulta la identificación visual rápida de piezas físicas por parte de los técnicos tanto en el listado de inventario como al momento de presupuestar e intervenir un drone.

## What Changes
- Se agrega el soporte para asociar una foto identificatoria a cada repuesto (`FotoRepu` en frontend, `photo_url` en la tabla `part` de Supabase).
- Se utiliza el flujo estandarizado de compresión y miniaturas (`subirImagenConMiniaturaPersistencia`) almacenando los archivos en la carpeta `REPUESTOS/{repuestoId}/foto/` del bucket `archivos`.
- Se actualizan las funciones de persistencia de repuestos (`repuestosPersistencia.js`) para leer y persistir `photo_url`.
- Se agregan las acciones thunk en Redux (`subirFotoRepuestoAsync` y `borrarFotoRepuestoAsync`) para gestionar la subida y eliminación física/lógica de la foto.
- En la vista de edición/creación del repuesto (`Repuesto.component.tsx`), se incorpora una sección visual para subir, previsualizar y eliminar la foto del repuesto.
- En los listados de repuestos (`ListaRepuestos.component.tsx`, `RepuestoItem.component.tsx`), se muestra una miniatura (thumbnail) junto al nombre del repuesto.

## Impact
- Affected specs: inventory-repuestos
- Affected code:
  - `src/types/repuesto.ts`
  - `src/persistencia/persistenciaSupabase/repuestosPersistencia.js`
  - `src/redux-tool-kit/repuesto/repuesto.actions.ts` (o `app.actions.ts`)
  - `src/components/Repuesto.component.tsx`
  - `src/components/ListaRepuestos.component.tsx`
  - `src/components/Inicio/items/RepuestoItem.component.tsx`
