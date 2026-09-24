## Context

El compromiso actual se almacena en `part.committed_units` y se mantiene con deltas en
`stock_movement`. La aplicacion no puede garantizar que esos deltas se ejecuten exactamente
una vez junto con el cambio de estado o de asignacion que los origina.

Un selector Redux solo puede derivar valores correctos si dispone de todas las asignaciones
relevantes. Hoy `intervencionesDeReparacionActual` contiene unicamente la reparacion abierta,
por lo que no sirve como fuente global.

## Goals / Non-Goals

### Goals

- Hacer que el compromiso sea una proyeccion determinista de datos funcionales vigentes.
- Mantener la regla de negocio y el calculo en Redux/selectores o usecases.
- Usar snapshots y cantidades de asignacion, no el catalogo mutable.
- Separar compromiso logico de stock fisico y de pedidos de compra.
- Permitir auditoria y despliegue gradual sin borrar el ledger historico.

### Non-Goals

- Reemplazar el ledger del stock fisico.
- Recalcular consumos historicos de reparaciones ya cerradas.
- Resolver en este cambio la idempotencia de todos los movimientos fisicos.
- Cambiar el flujo de estados de reparacion.

## Decisions

### Decision: read model global y calculo en selector

Persistencia expondra una consulta de asignaciones candidatas que devuelva datos crudos:
`repairId`, `repairState`, `assignmentId`, `origin`, `includesWorkshopParts` y
`partsSnapshot`. Los estados elegibles se deciden en la accion/usecase y se pasan a la
consulta; persistencia solo ejecuta la query, mapea DTOs y mantiene la suscripcion.

Redux almacenara ese conjunto global separado de `intervencionesDeReparacionActual`. Un
selector memoizado filtrara `Aceptado` y `Repuestos`, descartara asignaciones no provistas
por el taller y consolidara cantidades por `partId`:

```text
compromiso[partId] = sum(
  snapshot.quantity
  for assignment in assignments
  if assignment.repairState in {Aceptado, Repuestos}
  and assignment.includesWorkshopParts
)
```

Los selectores de repuestos combinaran el catalogo con ese diccionario para exponer
`UnidadesComprometidas`, `stockLibre` y faltantes. No leeran `part.committed_units`.

Alternativa descartada: calcular en una vista SQL. Reduciria datos transferidos, pero
colocaria una regla de negocio en persistencia y dificultaria compartirla con otros backends.

Alternativa descartada: usar `intervencionesDeReparacionActual`. Produce un total parcial
que cambia segun la reparacion abierta.

### Decision: inclusion explicita de repuestos del taller

Se agregara a `repair_intervention` una marca booleana explicita, con nombre definitivo a
resolver durante implementacion, que indique si el taller provee los repuestos del snapshot.
`parts_cost` seguira siendo un importe y no decidira compromiso.

La migracion inicial inferira:

- asignaciones adicionales con snapshot no vacio: incluidas;
- asignaciones presupuestadas con `parts_cost > 0`: incluidas;
- asignaciones presupuestadas con `parts_cost = 0`: no incluidas.

La migracion emitira una consulta de auditoria para revisar snapshots con precio cero, ya que
una pieza gratuita historica es indistinguible de una pieza aportada por el cliente.

### Decision: ledger reservado para stock fisico

Los nuevos flujos no emitiran `reservation` ni `release`. `consumption` conservara
`on_hand_delta` y usara `committed_delta = 0`. Los movimientos historicos permanecen
append-only para auditoria.

`part.committed_units` se mantiene temporalmente como columna deprecada, pero deja de
mapearse como fuente operativa. Tras verificar el despliegue y controlar clientes moviles
antiguos, una migracion posterior podra retirar la columna y restringir nuevos movimientos
con `committed_delta != 0`.

### Decision: sincronizacion del read model

La carga inicial obtiene todas las asignaciones candidatas en una consulta. Eventos realtime
de `repair` o `repair_intervention` invalidan y recargan el read model mediante el scheduler
existente, evitando suscripciones duplicadas y tormentas de consultas.

Las actualizaciones locales pueden reflejarse de forma optimista, pero la recarga desde
persistencia confirma el resultado. El calculo es idempotente: leer dos veces los mismos
registros no duplica compromiso.

## Risks / Trade-offs

- La consulta global transfiere mas datos que un agregado SQL. Se mitiga seleccionando solo
  columnas necesarias y estados candidatos, y midiendo cantidad de filas/egress.
- Clientes Cordova antiguos pueden seguir escribiendo deltas de compromiso. El valor derivado
  no se altera, pero el ledger historico recibira ruido hasta completar el rollout.
- El backfill de inclusion puede clasificar mal piezas historicas gratuitas. La auditoria
  previa al corte debe listar y resolver esas filas.
- Un retraso de realtime puede mostrar brevemente un valor anterior. Una recarga tras cada
  mutacion local y al recuperar visibilidad limita esa ventana.

## Migration Plan

1. Agregar la marca explicita, realizar backfill y revisar filas ambiguas.
2. Incorporar consulta global, estado Redux y selector derivado sin retirar el contador viejo.
3. Comparar durante un periodo el derivado contra `part.committed_units` y el ledger.
4. Cambiar toda la UI y reglas de disponibilidad al valor derivado.
5. Dejar de emitir `reservation`, `release` y deltas comprometidos de `consumption`.
6. Desplegar web/movil, observar diferencias y clientes antiguos.
7. En un cambio posterior, restringir deltas comprometidos y eliminar la columna cacheada.

Rollback: mientras la columna y los movimientos historicos existan, se puede volver
transitoriamente a la lectura anterior sin reconstruir datos. Los nuevos cambios ocurridos
durante el periodo derivado deberan reconciliarse antes de ese rollback.

## Open Questions

- Cuanto tiempo debe mantenerse compatibilidad con versiones Cordova antiguas.
- Si la marca de inclusion debe ser por asignacion completa o por item del snapshot. La UI
  actual decide por asignacion; esta propuesta conserva ese alcance.
- Umbral de volumen/egress a partir del cual convendria materializar un read model agregado
  sin mover la regla de negocio fuera del dominio.
