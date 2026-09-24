## Why

El compromiso derivado actualmente suma toda la demanda de reparaciones activas aunque el
repuesto tenga stock cero o insuficiente. Eso hace que una reparación sin unidades físicas
disponibles aparezca como comprometida, mezclando faltante con stock reservado.

## What Changes

- Limitar el compromiso derivado de cada repuesto al stock físico disponible.
- Permitir compromiso parcial: si la demanda supera el stock, se compromete el stock
  disponible y el excedente queda como faltante.
- Mantener la demanda activa completa para calcular faltantes y no modificar snapshots ni el
  ledger histórico.
- Ajustar estados y pruebas para distinguir `Disponible`, `Comprometido`, `En Pedido` y
  `Agotado` sin tratar una demanda sin stock como compromiso.

## Impact

- Affected specs: `inventario-repuestos`, `reparaciones-intervenciones`
- Affected code: selectores de compromiso/disponibilidad y pruebas relacionadas.
- No se agregan movimientos de reserva ni se modifica `stock_movement`.