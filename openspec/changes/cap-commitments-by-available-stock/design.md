## Context

Las asignaciones activas expresan demanda, mientras `part.stock` expresa unidades físicas.
El compromiso visible debe representar solo unidades físicas que pueden reservarse
lógicamente para reparaciones; la diferencia entre demanda y compromiso es faltante.

## Decision

El selector mantendrá dos valores por repuesto durante el cálculo:

```text
demanda = suma de snapshots de asignaciones activas incluidas
comprometido = min(demanda, max(stock, 0))
faltante = max(demanda - comprometido - unidades_pedidas, 0)
```

El stock usado para calcular compromiso será el stock físico actual del catálogo. No se
escribirán reservas en `stock_movement`; el resultado seguirá siendo una proyección de
lectura y se recalculará al actualizar stock o asignaciones.

## Consequence

Una demanda activa con stock cero ya no aumenta `UnidadesComprometidas`. Si luego ingresa
stock, el selector podrá comprometer automáticamente hasta cubrir la demanda vigente.