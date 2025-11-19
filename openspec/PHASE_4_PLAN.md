# Phase 4: Advanced Features - Plan de Trabajo

**Fecha de inicio:** 19 de noviembre de 2025  
**Estimación:** 15-20 horas  
**Estado:** En progreso 🔄  

---

## 📋 Objetivos de Phase 4

Agregar funcionalidades avanzadas al módulo de Reparación para mejorar la experiencia de usuario y la productividad del negocio.

---

## 🎯 Tareas Planificadas

### T4.1: Sistema de Notificaciones (4-5h)

**Prioridad:** Alta  
**Descripción:** Implementar notificaciones por email y SMS para eventos importantes.

**Sub-tareas:**
1. **Email Service Integration**
   - Configurar PHPMailer en backend
   - Templates HTML para emails
   - Endpoints: `/api/send_email.php`
   - Eventos: Presupuesto enviado, Estado cambiado, Drone recibido, etc.

2. **SMS Service Integration**
   - Integrar con cordova-sms-plugin
   - Mensajes cortos formatados
   - Eventos críticos: Presupuesto aceptado, Reparación lista

3. **Notification Manager Component**
   - Panel de preferencias de notificaciones
   - Toggle email/SMS por evento
   - History de notificaciones enviadas

**Archivos a crear:**
- `src/components/Reparacion/components/NotificationManager/`
- `src/services/notification.service.ts`
- `src/types/notification.types.ts`

---

### T4.2: Dashboard de Métricas (3-4h)

**Prioridad:** Media  
**Descripción:** Panel de estadísticas y KPIs para el negocio.

**Features:**
1. **Métricas en Tiempo Real**
   - Reparaciones por estado (gráfico de dona)
   - Ingresos del mes (line chart)
   - Promedio de días por reparación
   - Tasa de aceptación de presupuestos

2. **Filtros Avanzados**
   - Por rango de fechas
   - Por técnico/usuario
   - Por modelo de drone
   - Por estado

3. **Widgets Personalizables**
   - Drag & drop para reordenar
   - Configuración de qué mostrar
   - Persistencia en localStorage

**Componentes:**
- `DashboardMetrics.component.tsx`
- `MetricCard.component.tsx`
- `ChartWidget.component.tsx`
- `FilterPanel.component.tsx`

---

### T4.3: Exportación de Reportes (2-3h)

**Prioridad:** Media  
**Descripción:** Generar reportes en PDF y Excel.

**Tipos de Reportes:**
1. **Reporte de Reparación Individual**
   - Datos completos
   - Timeline de estados
   - Lista de repuestos
   - Fotos antes/después
   - Formato PDF

2. **Reporte de Reparaciones (Lista)**
   - Filtros aplicados
   - Tabla con todas las reparaciones
   - Totales y subtotales
   - Formato Excel/CSV

3. **Reporte Financiero**
   - Ingresos por período
   - Desglose por estado
   - Gráficos incluidos
   - Formato PDF

**Librerías:**
- `jsPDF` para PDF
- `xlsx` para Excel
- `html2canvas` para capturas

**Archivos:**
- `src/services/export.service.ts`
- `src/components/Reparacion/components/ExportButton/`

---

### T4.4: Búsqueda y Filtros Avanzados (2-3h)

**Prioridad:** Alta  
**Descripción:** Sistema de búsqueda potente con múltiples criterios.

**Features:**
1. **Búsqueda Global**
   - Por texto (cliente, drone, número de serie)
   - Búsqueda incremental (debounced)
   - Highlighting de resultados

2. **Filtros Combinables**
   - Por estado (múltiple)
   - Por rango de fechas
   - Por modelo de drone
   - Por técnico asignado
   - Por monto (presupuesto)

3. **Vistas Guardadas**
   - Guardar combinaciones de filtros
   - Filtros predefinidos útiles
   - Compartir filtros entre usuarios

**Componentes:**
- `SearchBar.component.tsx`
- `AdvancedFilters.component.tsx`
- `SavedViews.component.tsx`

---

### T4.5: Sistema de Permisos Granular (2-3h)

**Prioridad:** Media  
**Descripción:** Control fino de permisos por acción y rol.

**Roles:**
- **Admin:** Acceso total
- **Técnico:** Ver/Editar asignadas, no eliminar
- **Recepción:** Crear consultas, ver todas, no editar técnicas
- **Cliente:** Ver solo propias, comentar

**Permisos por Acción:**
```typescript
{
  'reparacion.create': ['admin', 'recepcion'],
  'reparacion.edit': ['admin', 'tecnico'],
  'reparacion.delete': ['admin'],
  'reparacion.changeState': ['admin', 'tecnico'],
  'reparacion.viewAll': ['admin', 'recepcion'],
  'presupuesto.approve': ['admin'],
  // ... etc
}
```

**Componentes:**
- `PermissionGuard.component.tsx`
- `usePermissions.hook.ts`
- `permissions.config.ts`

---

### T4.6: Historial de Cambios (Audit Log) (2-3h)

**Prioridad:** Baja  
**Descripción:** Registro de todos los cambios en reparaciones.

**Información Capturada:**
- Quién hizo el cambio
- Qué cambió (campo, valor anterior, valor nuevo)
- Cuándo se hizo el cambio
- Desde dónde (IP, dispositivo)

**Features:**
- Timeline visual de cambios
- Filtrar por usuario/fecha
- Exportar audit log
- Revert changes (admin only)

**Archivos:**
- `src/types/auditLog.types.ts`
- `src/components/Reparacion/components/AuditLog/`
- Redux slice para audit logs

---

### T4.7: Comentarios y Chat Interno (3-4h)

**Prioridad:** Media  
**Descripción:** Sistema de comentarios entre técnicos/admin.

**Features:**
1. **Comentarios en Reparación**
   - Thread de comentarios
   - Menciones @usuario
   - Adjuntar archivos
   - Markdown support

2. **Notificaciones de Comentarios**
   - Badge en app
   - Push notification
   - Email digest diario

3. **Panel de Comentarios**
   - Ver todos los comentarios
   - Filtrar por reparación
   - Marcar como leído

**Componentes:**
- `CommentsSection.component.tsx`
- `CommentItem.component.tsx`
- `CommentForm.component.tsx`

---

## 📊 Roadmap Visual

```
Semana 1 (8-10h):
├─ T4.1: Notificaciones (4-5h)
└─ T4.2: Dashboard (3-4h)

Semana 2 (7-10h):
├─ T4.3: Reportes (2-3h)
├─ T4.4: Búsqueda (2-3h)
└─ T4.5: Permisos (2-3h)

Opcional:
├─ T4.6: Audit Log (2-3h)
└─ T4.7: Comentarios (3-4h)
```

---

## 🎯 Prioridades Sugeridas

### Fase 4A - Críticas (10-12h)
1. ✅ T4.1: Notificaciones (email/SMS)
2. ✅ T4.4: Búsqueda avanzada
3. ✅ T4.5: Permisos granulares

### Fase 4B - Importantes (7-9h)
4. ⏳ T4.2: Dashboard de métricas
5. ⏳ T4.3: Exportación reportes
6. ⏳ T4.7: Comentarios internos

### Fase 4C - Opcionales (2-3h)
7. ⏳ T4.6: Audit log

---

## 🚀 Comenzamos con T4.1: Notificaciones

**Siguiente paso:** Implementar el servicio de notificaciones y los componentes necesarios.

¿Listo para comenzar? 🎯
