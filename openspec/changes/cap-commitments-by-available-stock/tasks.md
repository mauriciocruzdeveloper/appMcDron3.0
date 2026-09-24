## 1. Regla derivada

- [x] 1.1 Derivar demanda activa por repuesto sin perder el total solicitado.
- [x] 1.2 Calcular compromiso parcial como mínimo entre demanda y stock físico.
- [x] 1.3 Mantener faltante como demanda no cubierta por stock o pedidos activos.

## 2. Presentación y compatibilidad

- [x] 2.1 Actualizar estados y etiquetas para no mostrar compromiso cuando el stock sea cero.
- [x] 2.2 Preservar pedidos de compra como fuente independiente de `En Pedido`.

## 3. Validación

- [x] 3.1 Probar stock cero, stock suficiente y demanda superior al stock.
- [x] 3.2 Probar que snapshots, catálogo y ledger no se modifican.
- [x] 3.3 Ejecutar suite completa y build.