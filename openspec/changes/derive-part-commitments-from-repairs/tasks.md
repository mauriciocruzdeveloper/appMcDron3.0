## 1. Datos y migracion

- [x] 1.1 Agregar a `repair_intervention` la marca explicita de repuestos provistos por el taller, con default y constraint.
- [x] 1.2 Backfillear la marca por origen, snapshot y costo, y generar consulta de filas ambiguas para revision manual.
- [ ] 1.3 Documentar mediciones base: cantidad de asignaciones activas, tamano de respuesta y diferencias entre derivado, cache y ledger.

## 2. Read model y selectores

- [x] 2.1 Agregar tipos para la asignacion candidata de compromiso y estado global de carga/error.
- [x] 2.2 Implementar en cada backend soportado una consulta de datos crudos para los estados solicitados, limitada a columnas necesarias.
- [x] 2.3 Cargar y refrescar el read model global desde actions/usecases, reutilizando el patron unsubscribe-then-resubscribe y el scheduler realtime.
- [x] 2.4 Crear selector memoizado que consolide `parts_snapshot.quantity` por repuesto para `Aceptado`/`Repuestos` e inclusion explicita.
- [x] 2.5 Hacer que los selectores de disponibilidad, faltantes y vistas de repuesto consuman exclusivamente el compromiso derivado.

## 3. Mutaciones de reparacion e inventario

- [x] 3.1 Persistir y editar la marca explicita desde los flujos de asignaciones presupuestadas y adicionales.
- [x] 3.2 Retirar movimientos `reservation` y `release` de cambios de estado, altas/bajas de asignaciones y eliminacion de reparaciones.
- [x] 3.3 Mantener `consumption` solo para stock fisico, con `committed_delta = 0`, respetando completadas, pendientes y repuestos sin stock.
- [x] 3.4 Dejar de mapear `part.committed_units` como fuente de `UnidadesComprometidas`; conservar compatibilidad temporal de esquema.

## 4. Validacion

- [x] 4.1 Probar el selector con cantidades, repuestos compartidos, asignaciones excluidas, adicionales y snapshots vacios.
- [x] 4.2 Probar que aceptar/salir/reintentar concurrentemente no acumula compromiso ni emite reservas/liberaciones.
- [x] 4.3 Probar que agregar, excluir y eliminar asignaciones actualiza el derivado y que cambios de catalogo no alteran snapshots.
- [x] 4.4 Probar que pasar a `Reparado` descuenta una sola vez el stock correspondiente y elimina la reparacion del compromiso derivado.
- [ ] 4.5 Validar carga inicial, errores, realtime y recuperacion de visibilidad sin canales duplicados.
- [ ] 4.6 Ejecutar la consulta de reconciliacion y resolver todas las filas ambiguas antes del corte.

## 5. Despliegue y limpieza posterior

- [ ] 5.1 Desplegar por fases, verificar egress y comparar temporalmente valor derivado contra cache/ledger.
- [ ] 5.2 Confirmar el alcance de versiones Cordova antiguas antes de bloquear deltas comprometidos.
- [ ] 5.3 Crear un cambio posterior para restringir `committed_delta` y eliminar `part.committed_units` cuando termine la compatibilidad.
