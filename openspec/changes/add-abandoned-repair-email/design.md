## Context
`Abandonado` ya es un estado terminal. Las transiciones se validan con
`transicionesPermitidas` y `cambiarEstadoReparacionAsync` concentra los efectos de dominio,
incluida la liberacion de stock al salir de `Aceptado` o `Repuestos`. Los emails de cambio
de estado se implementan como thunks en `app.actions.ts` que consumen endpoints PHP
autenticados.

Actualmente el boton de abandono vive en la seccion Entrega y no envia email. Esto hace que
la accion no este disponible en etapas tempranas como `Presupuestado`, aunque el abandono
puede ocurrir antes o despues del trabajo tecnico.

## Goals / Non-Goals
- Goals: separar aviso y cierre, exigir 3 meses calendario desde la recepcion, registrar el
  inicio del plazo de 7 dias y mantener una sola regla de transicion en dominio.
- Non-Goals: reabrir estados terminales, guardar el estado anterior, revertir consumos
  historicos de stock o automatizar el abandono sin confirmacion administrativa.

## Decisions
- Decision: habilitar `Abandonado` solo desde `Respondido`, `Transito`, `Presupuestado`,
  `Repuestos`, `Reparado`, `Diagnosticado` y `Cobrado`. La lista representa etapas en las
  que no hay una tarea operativa inmediata del administrador. La UI consultara la misma
  regla mediante el selector existente y el thunk seguira validandola antes de persistir.
- Decision: `Enviar aviso de abandono` requiere `FeRecRep` y tres meses calendario completos.
  El thunk envia el email y solo despues persiste `FechaAvisoAbandono` con la hora del envio.
- Decision: durante el plazo se ofrece `Cancelar aviso de abandono`, que limpia la fecha.
- Decision: `Marcar como abandonado` requiere siete dias completos desde el aviso, cambia
  el estado sin enviar otro email y mantiene `Abandonado` como terminal irreversible.
- Decision: el destinatario sera `EmailContacto` y, como fallback, `EmailUsu`, igual que
  las notificaciones actuales.
- Decision: el email indicara un plazo fijo de 7 dias desde la notificacion y que, vencido,
  el drone sera dispuesto por el servicio tecnico.
- Decision: la transicion reutilizara los efectos de stock existentes. Abandonar desde
  `Repuestos` libera reservas; abandonar desde `Reparado` o `Diagnosticado` no revierte
  consumos ni movimientos ya aplicados.
- Decision: si un cliente regresa luego del cierre, se crea una reparacion vinculada mediante
  la ampliacion existente; no se guarda estado anterior ni se habilita una transicion inversa.

## Risks / Trade-offs
- El texto de disposicion del equipo tiene implicancias comerciales y legales. Se mitiga
  usando exactamente la redaccion aprobada y manteniendo el plazo en un unico template.
- Si falla el email, no se registra la fecha ni se habilita el cierre, de modo que el
  administrador pueda reintentar sin dejar una notificacion ficticia.

## Migration Plan
Agregar `repair.abandonment_notice_date` nullable. Desplegar migracion y endpoint PHP antes
del frontend. Las reparaciones existentes comienzan sin aviso y no requieren backfill.