## Why
La app necesita una nueva seccion para gestionar envios de emails en cadena a clientes por criterios dinamicos (segmentos no fijos), incluyendo periodicidad automatica y ejecucion manual. Hoy existen envios puntuales por endpoints especificos, pero no existe una capacidad general de plantillas/campanas con filtros reutilizables e historial.

## What Changes
- Se agrega un modulo de campanas de email en la app (admin only) con:
  - Gestion de plantillas (listar, alta, edicion, baja logica)
  - Gestion de campanas (listar, alta, edicion, baja logica)
  - Filtros predefinidos combinables en MVP y base para constructor avanzado fase 2
  - Periodicidad MVP: una vez, diaria, semanal, mensual
  - Ejecucion manual "Enviar ahora"
  - Historial de ejecuciones y resultados
- Las plantillas/campanas/historial se persisten en Supabase como fuente de verdad.
- Se agrega endpoint batch en backend PHP para ejecutar campanas vencidas y enviar emails por PHPMailer.
- La periodicidad implementa catch-up: si una campana corria en T y se ejecuta tarde (T + delta), se envia igual y la siguiente corrida se agenda desde la ejecucion real.
- Criterio funcional confirmado para MVP "no pagaron": monto_restante > 0, calculado como PresuFiRep - AdelantoRep.
- Borrado de plantillas/campanas por soft delete con historial conservado.

## Impact
- Affected specs: campanas-email-clientes (nuevo)
- Affected code:
  - src/routes/Inicio.routes.js
  - src/components/NavMcDron.component.tsx
  - src/hooks/usePermissions.ts
  - src/redux-tool-kit/store.ts
  - src/redux-tool-kit/campanaEmail/* (nuevo)
  - src/redux-tool-kit/plantillaEmail/* (nuevo)
  - src/redux-tool-kit/app/app.actions.ts
  - src/persistencia/persistenciaSupabase/index.js
  - src/persistencia/persistenciaSupabase/campanasEmailPersistencia.js (nuevo)
  - src/persistencia/persistenciaSupabase/plantillasEmailPersistencia.js (nuevo)
  - mcdron-web-php/api/send_campaign_batch.php (nuevo)
  - mcdron-web-php/usecases/send_campaign_batch.php (nuevo)
  - mcdron-web-php/services/email_sender.php
