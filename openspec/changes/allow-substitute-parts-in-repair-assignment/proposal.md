## Why
Al presupuestar una reparación se asignan intervenciones estándar del catálogo (por ejemplo, cambiar un brazo completo), pero durante el trabajo en taller puede ocurrir que ese repuesto no se consiga y la falla se resuelva sustituyéndolo por otro repuesto disponible en inventario (por ejemplo, trasplantar solo el motor o usar una pieza equivalente) o reparando el componente sin consumir stock. Hoy `parts_snapshot` queda fijo al crear la asignación, lo que mantiene demanda/faltantes irreales sobre el repuesto original, impide descontar el repuesto realmente utilizado al cerrar la reparación y obliga a recordar aclararlo manualmente en el informe.

## What Changes
- Permitir a administradores editar los repuestos efectivos (`parts_snapshot` e `includes_workshop_parts`) de cualquier asignación en estado `pendiente` desde la sección `REPARAR` mientras la reparación esté en `Aceptado` o `Repuestos`:
  - Reemplazar por uno o más repuestos activos de todo el inventario (sin restringir al modelo del drone, priorizando los compatibles en el selector) con sus cantidades.
  - Dejar la asignación sin repuestos de stock (`parts_snapshot = []`, `includes_workshop_parts = false`) cuando se resuelve reparando la pieza original o con material fuera de inventario.
  - Restaurar los repuestos originales definidos en el catálogo de la intervención.
- Mantener intactos los precios congelados (`PrecioManoObra`, `PrecioPiezas`, `PrecioTotal`) y `PresuFiRep` en las asignaciones `presupuestada` al ajustar sus repuestos efectivos (en asignaciones `adicional` se recalcula solo su costo interno de piezas sin tocar `PresuFiRep`).
- Derivar automáticamente en tiempo real el nuevo compromiso, faltantes y lista de compras a partir del `parts_snapshot` actualizado, y descontar el repuesto sustituto (dejando nota de sustitución en `stock_movement.note`) al pasar a `Reparado`.
- Mostrar en `Tareas a Realizar` los repuestos efectivos de cada asignación, un indicador cuando difieren del catálogo de la intervención y la acción para editarlos o restaurarlos.
- Actualizar automáticamente de forma no destructiva el campo editable `DescripcionTecRep` (`Informe de Reparación o Diagnóstico`) agregando, actualizando o quitando (si se restaura el original) una línea aclaratoria por la asignación ajustada, preservando cualquier texto libre del técnico para que pueda revisarlo o pulirlo antes de enviar el email de finalización.

## Impact
- Affected specs: `reparaciones-intervenciones`
- Affected code:
  - `src/usecases/` (comparación contra catálogo de intervención y sincronización no destructiva de nota en `DescripcionTecRep`)
  - `src/redux-tool-kit/reparacion/reparacion.actions.ts` (thunk de actualización/restauración de repuestos de asignación y nota de trazabilidad al consumir stock)
  - `src/persistencia/` (`actualizarRepuestosAsignacionPersistencia` en Supabase y paridad Firebase, solo escritura de datos)
  - `src/components/Reparacion/sections/ReparacionReparar.tsx` (UI de edición/restauración de repuestos efectivos por tarea pendiente)
- Database: sin migraciones nuevas (reutiliza `repair_intervention.parts_snapshot`, `repair_intervention.includes_workshop_parts`, `repair.repair_resume` y `stock_movement.note`).
