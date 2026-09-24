## Why

La página de detalle de un repuesto muestra el stock actual y permite realizar ajustes,
pero no permite consultar cómo se llegó a ese saldo. El ledger `stock_movement` ya conserva
los movimientos append-only y debe exponerse en lectura sin duplicar reglas de inventario.

## What Changes

- Agregar una consulta de movimientos del ledger filtrada por repuesto y ordenada del más
  reciente al más antiguo.
- Mapear los movimientos a un tipo de dominio estable para la UI, incluyendo fecha, tipo,
  variación de stock físico, nota y referencia.
- Mostrar el historial en un desplegable dentro del detalle del repuesto, con estado vacío y
  estado de error.
- Mantener el historial como lectura; los movimientos continuarán creándose exclusivamente
  mediante el flujo existente de stock.

## Impact

- Affected specs: `inventario-repuestos`
- Affected code: `src/components/Repuesto.component.tsx`, tipos de inventario, persistencia
  Supabase/Firebase y pruebas del componente o de persistencia.
- No se modifica el cálculo de comprometidos ni la estructura del ledger.