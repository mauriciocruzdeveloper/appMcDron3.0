## Why
Una reparacion con presupuesto aceptado puede quedar pausada hasta cobrar el
adelanto. Mezclarla con las reparaciones en Aceptado genera ruido en la lista de
trabajo y no distingue la espera de pago de la espera de repuestos.

## What Changes
- Agregar el estado principal `Esperando adelanto`, accesible solo desde `Aceptado`.
- Permitir el ciclo manual y opcional `Aceptado -> Esperando adelanto -> Aceptado`.
- Mantener las salidas de cierre `Cancelado` y `Abandonado`, como en `Repuestos`,
  respetando las condiciones existentes para cada cierre.
- Mantener disponibles `Aceptado -> Repuestos` y `Aceptado -> Reparado` sin exigir
  adelanto cuando el administrador decide avanzar sin cobrarlo.
- Mostrar el nuevo estado en la ficha, progreso, filtros y contadores, separado
  de `Aceptado` y `Repuestos`, con controles para pausar y reanudar.
- Excluir esta espera de la demanda y compromiso de repuestos y de alertas de
  faltantes que requieren accion; recalcular al volver a `Aceptado`.
- No agregar campos de pago, automatismos de cobro, emails ni nuevas columnas.

## Impact
- Affected specs: reparaciones-intervenciones, inventario-repuestos.
- Affected code: `src/usecases/estadosReparacion.ts`, `src/datos/estados.ts`,
  `src/types/estado.ts`, acciones y selectores de reparaciones, componentes de
  reparacion y sus filtros/contadores.
- Las reglas de negocio permanecen en usecases, acciones y selectores. La capa
  de persistencia solo guarda y consulta el estado.
- Revisar restricciones existentes de base de datos antes de implementar;
  solo ajustar una restriccion de estados si efectivamente existe.
- Estado de la propuesta: aprobada por el usuario el 2026-10-14 e implementada.

## Validation
- `openspec validate add-esperando-adelanto-state --strict --no-interactive`: valida.
- `CI=true npm test -- --watchAll=false --runInBand`: 33 suites y 290 pruebas pasan.
- El servidor de desarrollo compila con advertencias de lint preexistentes.
- Controles, permisos, filtrado y detalle de repuestos verificados en pruebas de componentes.
- Pausa y retorno verificados con el thunk real y persistencia simulada; sin consumo
  de stock, envio de correos ni cambios en presupuesto, adelanto o intervenciones.
- Navegador verificado hasta login en `http://localhost:3001`; la inspeccion visual
  de una ficha autenticada queda pendiente. No se modificaron reparaciones reales.
- No se encontraron restricciones de estados en el SQL disponible. No se agrego
  migracion ni se inspecciono el esquema remoto; verificar restricciones externas
  si el ambiente desplegado rechaza el nuevo valor de estado.