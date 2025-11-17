# Proposal: Activar Estado "Repuestos" en Flujo Principal de Reparaciones

**Change ID:** `add-repuestos-state`  
**Status:** Draft  
**Created:** 2025-11-16  
**Author:** Mauricio Cruz  
**Priority:** Medium  

## Context

Actualmente existe un estado "Repuestos" en el sistema pero está marcado como **legacy** (retrocompatibilidad) con `etapa: 101` y acción de migración. Sin embargo, en el flujo de trabajo real del taller, es necesario poder indicar explícitamente cuando una reparación está pausada esperando que lleguen repuestos.

El flujo actual no diferencia entre:
- ✅ Reparaciones activas en progreso ("Aceptado")
- ⏸️ Reparaciones bloqueadas esperando partes ("Repuestos")

Esto causa:
- **Confusión visual**: Todas aparecen como "Aceptado" aunque algunas estén pausadas
- **Mala planificación**: El técnico no puede priorizar rápidamente qué trabajar
- **Falta de tracking**: No hay visibilidad de cuántas reparaciones están esperando repuestos
- **Seguimiento manual**: Se requieren notas externas para recordar qué está bloqueado

## Problem Statement

**Como técnico del taller**, necesito poder marcar explícitamente cuando una reparación está esperando repuestos para:
- Ver de un vistazo qué reparaciones están bloqueadas vs. activas
- Priorizar mi trabajo en reparaciones que sí puedo completar
- Retomar rápidamente cuando lleguen las piezas faltantes
- Generar reportes sobre tiempos de espera y bottlenecks

**Como administrador**, necesito:
- Ver cuántas reparaciones están pausadas por falta de repuestos
- Priorizar pedidos de partes según cantidad de reparaciones afectadas
- Métricas sobre tiempos promedio de espera de repuestos

**Actualmente**, el estado "Repuestos" existe pero:
- Está marcado como legacy y se sugiere migrar a "Aceptado"
- No está integrado en el flujo principal
- No tiene transiciones definidas desde/hacia él
- Falta UI específica para manejarlo

## Proposed Solution

**Activar y modernizar** el estado "Repuestos" existente como parte del flujo principal:

### 1. Reclasificación del Estado
- ✅ Mover "Repuestos" de etapa legacy (101) a etapa principal (entre Aceptado y Reparado)
- ✅ Cambiar prioridad de 2 a 1 (alta prioridad de atención)
- ✅ Actualizar acción de "Migrar a 'Aceptado'" a "Esperar llegada de repuestos"
- ✅ Mantener color distintivo (#009688 - verde azulado)

### 2. Transiciones Permitidas
```
Aceptado → Repuestos (cuando se descubre falta de partes)
Repuestos → Aceptado (cuando llegan los repuestos)
Repuestos → Cancelado (si el cliente cancela mientras espera)
Repuestos → Abandonado (si se abandona por tiempo de espera)
```

**Ciclo bidireccional ilimitado:** Una reparación puede volver a "Repuestos" múltiples veces si se necesitan más partes en diferentes etapas.

### 3. Campos Adicionales Opcionales
Agregar a `DataReparacion`:
```typescript
ObsRepuestos?: string;           // Qué repuestos se necesitan
RepuestosSolicitados?: string[]; // IDs de repuestos del inventario
```

**Nota:** NO se agrega fecha de solicitud - se mantiene simple.

### 4. Representación Visual
- **Badge**: Color warning (#009688) con ícono de caja (`BoxSeam`)
- **Dashboard**: Widget mostrando cantidad de reparaciones en "Repuestos"
- **Lista**: Filtro específico para este estado
- **Detalle**: Botones de transición "Solicitar Repuestos" / "Repuestos Llegaron"

### 5. Redux & Selectores
```typescript
// Nuevo selector
selectReparacionesEnRepuestos: Reparacion[]

// Actualizar contador de estados
selectContadorEstados: Record<string, number>
```

## Scope

### ✅ In Scope
- **Base de datos:** Agregar columnas `parts_notes` y `requested_parts_ids` a tabla `repair` en Supabase
- Actualizar archivo `estados.ts` (cambiar etapa y metadatos)
- Actualizar enum `Etapas` en `estado.ts`
- Agregar campos opcionales `ObsRepuestos` y `RepuestosSolicitados` a `DataReparacion`
- **Capa de persistencia:** Actualizar mapeos en `reparacionesPersistencia.js` (Supabase)
- Crear/actualizar validación de transiciones de estado
- Actualizar componente de cambio de estado para incluir UI de "Repuestos"
- Crear selector Redux `selectReparacionesEnRepuestos`
- Agregar widget de dashboard para tracking
- Actualizar filtros en vistas de lista
- Documentar en `openspec/project.md`

### ❌ Out of Scope
- Sistema avanzado de inventario de repuestos (existe separadamente)
- Notificaciones push cuando llegan repuestos
- Tracking automático de fechas (se mantiene simple)
- Integración con proveedores externos
- Reportes financieros de costos
- Predicción de tiempos de llegada
- Workflow de aprobación de compras
- Migración de datos de Firebase a Supabase (fuera del alcance)

## Dependencies

### Prerequisites
- **T0.1:** Migración de base de datos Supabase (agregar columnas `parts_notes` y `requested_parts_ids`)

### Related Systems
- Sistema de repuestos existente (módulo separado)
- Sistema de notificaciones (fase 2 - futuro)
- Redux state management
- **Supabase PostgreSQL** (base de datos principal)
- Capa de persistencia (`src/persistencia/persistenciaSupabase/`)

### Blocking Issues
- Migración de BD debe ejecutarse ANTES de implementar código (T0.1 es crítico)

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Confusión con estado legacy "Repuestos" | Baja | Media | Comunicar claramente que es el mismo estado, solo modernizado |
| Reparaciones pueden quedar "atascadas" en Repuestos | Media | Baja | Agregar filtro y alertas visuales en dashboard |
| Ciclos infinitos Aceptado ⇄ Repuestos | Baja | Baja | Es comportamiento esperado (puede pasar en la realidad) |
| Datos históricos con estado Repuestos legacy | Baja | Baja | Se mantiene compatible, solo cambia la semántica |
| **Migración de BD falla en Supabase** | **Baja** | **Alta** | **Script de rollback preparado, backup antes de ejecutar** |
| **Constraints de BD rechazan datos válidos** | **Baja** | **Media** | **Validación en frontend antes de enviar, mensajes de error claros** |

## Success Criteria

- [x] Estado "Repuestos" visible y seleccionable en dropdown de estados
- [x] Transiciones Aceptado ↔ Repuestos funcionan correctamente
- [x] Dashboard muestra contador de reparaciones en "Repuestos"
- [x] Badge visual con color #009688 y ícono de caja
- [x] Campos `ObsRepuestos` y `RepuestosSolicitados` persisten en Firestore
- [x] Selector `selectReparacionesEnRepuestos` retorna lista filtrada
- [x] Filtro "Repuestos" funciona en vista de lista
- [x] Funciona offline (Local First garantizado)
- [x] Documentación actualizada en `openspec/project.md`

## Alternatives Considered

### 1. Crear un nuevo estado "EsperandoRepuestos" 
❌ **Rechazado**: El estado "Repuestos" ya existe, solo necesita reactivación.

### 2. Usar campo booleano `esperandoRepuestos` en estado "Aceptado"
❌ **Rechazado**: Menos explícito en UI, requiere lógica condicional en múltiples lugares.

### 3. Subtipo de estado (ej: "Aceptado.Repuestos")
❌ **Rechazado**: Cambio arquitectónico mayor, rompe tipado actual.

### 4. Mantener como legacy y usar "Aceptado" + notas
❌ **Rechazado**: Pérdida de información valiosa y visibilidad reducida.

### ✅ 5. Modernizar estado "Repuestos" existente
**SELECCIONADO**: Reutiliza infraestructura, cambios mínimos, compatible con datos históricos.

## Implementation Strategy

1. **Phase 0: Database Migration** (30 min) **⚠️ EJECUTAR PRIMERO**
   - Conectar a Supabase Dashboard
   - Ejecutar script SQL de migración
   - Agregar columnas `parts_notes` y `requested_parts_ids`
   - Agregar constraints de validación
   - Crear índices
   - Verificar con queries de prueba

2. **Phase 1: Data Layer** (1.5-2 horas)
   - Actualizar `estados.ts` y `estado.ts`
   - Agregar campos a interface `DataReparacion`
   - **Actualizar capa de persistencia Supabase** (mapeos BD ↔ Frontend)
   - Tests de tipos TypeScript

3. **Phase 2: Business Logic** (2-3 horas)
   - Crear/actualizar lógica de validación de transiciones
   - Implementar selectores Redux
   - Tests unitarios de lógica

4. **Phase 3: UI Components** (3-4 horas)
   - Actualizar componente de cambio de estado
   - Agregar campos condicionales para "Repuestos"
   - Widget de dashboard
   - Badge y estilos visuales

5. **Phase 4: Integration & Testing** (2-3 horas)
   - Tests de integración
   - Validación en browser y Android
   - **Verificar persistencia en Supabase**
   - Probar sincronización en tiempo real

6. **Phase 5: Documentation** (1 hora)
   - Actualizar `openspec/project.md`
   - Agregar comentarios en código
   - Documentar migración de BD
   - README si necesario

**Total estimado:** 10-14 horas de desarrollo (actualizado con BD)

## Open Questions

- [ ] ¿Se necesita notificación push cuando se cambia a/desde "Repuestos"? → **Respuesta:** No en esta fase, se agregará en fase 2 de notificaciones
- [ ] ¿El campo `RepuestosSolicitados` debe ser obligatorio? → **Respuesta:** No, es opcional
- [ ] ¿Se debe mostrar histórico de veces que entró/salió de "Repuestos"? → **Respuesta:** No en esta fase, es out of scope

---

## Next Steps

1. ✅ Crear esta propuesta
2. ⏳ Review y aprobación
3. ⏳ Crear spec deltas para cada capability
4. ⏳ Implementar según `tasks.md`
5. ⏳ Validar con `openspec validate add-repuestos-state --strict`
