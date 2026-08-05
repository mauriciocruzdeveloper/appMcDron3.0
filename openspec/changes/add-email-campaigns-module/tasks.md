## 1. OpenSpec y contratos
- [ ] 1.1 Revisar y aprobar este cambio OpenSpec antes de codificar
- [ ] 1.2 Definir esquema Supabase para plantillas, campanas, ejecuciones y envios
- [ ] 1.3 Definir contrato API app <-> backend para ejecucion batch y envio manual

## 2. Datos y persistencia (Supabase)
- [ ] 2.1 Crear tablas para plantillas y campanas con soft delete
- [ ] 2.2 Crear tablas para campaign_runs y campaign_run_recipients (historial)
- [ ] 2.3 Implementar persistencia CRUD en src/persistencia/persistenciaSupabase/* sin logica de negocio
- [ ] 2.4 Exportar nuevas funciones en src/persistencia/persistenciaSupabase/index.js

## 3. Dominio y reglas de negocio (Redux/usecases)
- [ ] 3.1 Crear slice/actions/selectors de plantillas
- [ ] 3.2 Crear slice/actions/selectors de campanas
- [ ] 3.3 Implementar validador de filtros MVP combinables
- [ ] 3.4 Implementar calculo de destinatarios en tiempo de ejecucion (segmento dinamico)
- [ ] 3.5 Implementar logica de periodicidad con catch-up (si now >= next_run_at, ejecutar)
- [ ] 3.6 Implementar criterio MVP "no pagaron" como monto_restante > 0

## 4. Backend email batch (PHP)
- [ ] 4.1 Crear endpoint autenticado para ejecutar campanas vencidas
- [ ] 4.2 Implementar usecase batch con envio por PHPMailer y log por destinatario
- [ ] 4.3 Implementar idempotencia basica por campana/ventana de ejecucion
- [ ] 4.4 Devolver resumen por corrida (total, enviados, fallidos, errores)

## 5. UI y navegacion
- [ ] 5.1 Agregar rutas admin-only para Plantillas y Campanas
- [ ] 5.2 Agregar acceso en NavMcDron para el nuevo modulo
- [ ] 5.3 Pantalla Plantillas: listar, alta, editar, baja logica
- [ ] 5.4 Pantalla Campanas: filtros, periodicidad, activar/desactivar, enviar ahora
- [ ] 5.5 Pantalla Historial: ultimas corridas con estado y metricas

## 6. Seguridad y operacion
- [ ] 6.1 Restringir administracion/ejecucion a rol admin
- [ ] 6.2 Limitar tamano de lote por corrida para proteger SMTP
- [ ] 6.3 Sanitizar contenido de plantilla y placeholders permitidos
- [ ] 6.4 Definir trigger cron de hosting DonWeb y fallback desde app

## 7. Validacion manual
- [ ] 7.1 Crear plantilla y campana, ejecutar envio manual y validar destinatarios
- [ ] 7.2 Simular campana vencida para validar catch-up y recalculo de next_run_at
- [ ] 7.3 Validar soft delete de plantilla/campana sin perder historial
- [ ] 7.4 Validar permisos (admin vs no admin)
- [ ] 7.5 Validar caso "no pagaron" con monto_restante > 0
