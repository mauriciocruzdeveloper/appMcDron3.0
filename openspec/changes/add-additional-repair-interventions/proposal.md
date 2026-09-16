## Why
Durante una reparación pueden realizarse intervenciones que no estaban incluidas al aceptar el presupuesto. Hoy no existe una forma explícita de distinguirlas y el consumo consulta los repuestos actuales del catálogo, por lo que una edición posterior podría alterar el stock imputado a una reparación.

## What Changes
- Permitir agregar intervenciones adicionales mientras la reparación está en `Aceptado` o `Repuestos`.
- Identificar cada asignación como `presupuestada` o `adicional`.
- Congelar en cada asignación los repuestos y cantidades definidos por la intervención al momento de agregarla.
- Reservar inmediatamente los repuestos de una intervención adicional y liberar esa reserva si se elimina antes de cerrar la reparación.
- Consumir o liberar stock usando el snapshot de la asignación y su estado `completada`/`pendiente`.
- Mostrar las intervenciones adicionales en la sección de reparación y permitir gestionarlas solo a usuarios administradores.
- Separar en el email de reparación terminada las intervenciones presupuestadas de las adicionales realizadas.
- Mantener congelado el presupuesto aceptado: las intervenciones adicionales no se muestran en la sección Presupuesto ni modifican `PresuFiRep`.
- Este cambio no agrega autorización, bonificación ni una política comercial nueva.

## Impact
- Affected specs: `reparaciones-intervenciones`, `inventario-repuestos`
- Affected code: tipos y acciones de reparación, persistencia Supabase, sección Reparar, email de reparación terminada, migración SQL y pruebas del flujo de stock
- Database: nuevas columnas `origin` y `parts_snapshot` en `repair_intervention`, con backfill para asignaciones existentes