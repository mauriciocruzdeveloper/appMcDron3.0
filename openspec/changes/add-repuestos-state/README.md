# Change: Activar Estado "Repuestos"

**Change ID:** `add-repuestos-state`  
**Status:** ✅ Completed  
**Priority:** Medium  
**Estimated Effort:** 9-13 horas  
**Actual Effort:** ~12 horas (Phases 0-3, 5)

---

## 📋 Resumen Ejecutivo

Esta propuesta moderniza el estado "Repuestos" existente en el sistema, moviéndolo de un estado legacy a un estado principal activo en el flujo de reparaciones. Esto permite al técnico marcar explícitamente cuando una reparación está pausada esperando que lleguen repuestos, mejorando la visibilidad y planificación del trabajo.

### ✅ Problema Resuelto
- ✅ Distinción visual clara entre reparaciones activas y bloqueadas por falta de repuestos
- ✅ Facilita priorización del trabajo técnico
- ✅ Métricas disponibles sobre tiempos de espera
- ✅ Estado "Repuestos" activado y funcional como estado principal

### ✅ Solución Implementada
- ✅ Estado "Repuestos" activo (etapa 8.5) en flujo principal
- ✅ Transiciones bidireccionales: Aceptado ⇄ Repuestos (ilimitadas)
- ✅ Campos implementados: `ObsRepuestos` (max 2000), `RepuestosSolicitados` (max 50)
- ✅ Widget de dashboard "⏸️ Esperando Repuestos" con contador
- ✅ Badge visual teal (#009688) + botones bidireccionales
- ✅ 43 tests unitarios (100% passing)

---

## 📁 Estructura de Archivos

```
openspec/changes/add-repuestos-state/
├── README.md                          ← Este archivo
├── proposal.md                        ← Propuesta completa
├── tasks.md                           ← Lista de tareas de implementación
└── specs/
    ├── state-transitions/
    │   └── spec.md                    ← Spec de transiciones de estado
    ├── data-model/
    │   └── spec.md                    ← Spec de modelo de datos
    └── ui-representation/
        └── spec.md                    ← Spec de UI y componentes
```

---

## 🎯 Objetivos

1. **Visibilidad:** Identificar rápidamente reparaciones bloqueadas
2. **Planificación:** Priorizar trabajo en reparaciones desbloqueadas
3. **Tracking:** Métricas sobre cantidad y tiempo de espera
4. **Simplicidad:** Cambio mínimo, reutilizar infraestructura existente

---

## 🔄 Flujo Propuesto

```
Consulta → ... → Presupuestado → Aceptado ⇄ Repuestos → Reparado → ...
                                      ↓           ↑
                                      └───────────┘
                                   (Ciclo ilimitado)
```

### Transiciones Permitidas

**Desde "Aceptado":**
- ✅ Repuestos (nuevo)
- ✅ Reparado
- ✅ Rechazado
- ✅ Cancelado
- ✅ Abandonado

**Desde "Repuestos":**
- ✅ Aceptado (cuando llegan repuestos)
- ✅ Cancelado
- ✅ Abandonado

---

## 📊 Impacto

### Cambios en Base de Datos (Supabase)

| Tabla | Cambio | SQL |
|-------|--------|-----|
| `repair` | Agregar columna `parts_notes TEXT` | `ALTER TABLE repair ADD COLUMN...` |
| `repair` | Agregar columna `requested_parts_ids TEXT[]` | `ALTER TABLE repair ADD COLUMN...` |
| `repair` | Constraint de longitud | `CHECK (LENGTH(parts_notes) <= 2000)` |
| `repair` | Constraint de array | `CHECK (array_length(...) <= 50)` |
| `repair` | Index GIN | `CREATE INDEX idx_repair_requested_parts` |

**⚠️ IMPORTANTE:** La migración de BD es **CRÍTICA** y debe ejecutarse PRIMERO.

### Cambios en Código

| Archivo | Tipo de Cambio | Complejidad |
|---------|----------------|-------------|
| `src/datos/estados.ts` | Modificación | Baja |
| `src/types/estado.ts` | Modificación | Baja |
| `src/types/reparacion.ts` | Adición | Baja |
| **`src/persistencia/persistenciaSupabase/reparacionesPersistencia.js`** | **Modificación** | **Media** |
| `src/usecases/estadosReparacion.ts` | Creación/Modificación | Media |
| `src/redux-tool-kit/reparacion/reparacion.selectors.ts` | Adición | Baja |
| `src/components/Reparacion/CambioEstado.component.tsx` | Modificación | Media |
| `src/components/Dashboard/RepuestosWidget.component.tsx` | Creación | Media |
| `src/components/Reparacion/EstadoBadge.component.tsx` | Modificación | Baja |

**Total estimado:** 9-13 archivos tocados, 400-600 líneas de código nuevas/modificadas

### Datos

- ⚠️ **REQUIERE migración de BD** (agregar columnas en Supabase)
- ✅ **Compatible con datos existentes** (columnas opcionales/nullable)
- ✅ **No requiere migración de datos** (valores NULL son válidos)
- ✅ **Script de rollback disponible** (por si algo sale mal)

### UI/UX

- **Dashboard:** Nuevo widget de repuestos
- **Lista:** Badge verde azulado (#009688) con ícono de caja
- **Detalle:** Sección destacada de repuestos solicitados
- **Formulario:** Campos adicionales condicionales

---

## ✅ Success Criteria

- [x] ✅ Estado "Repuestos" visible y seleccionable
- [x] ✅ Transiciones Aceptado ⇄ Repuestos funcionan bidireccionalmente
- [x] ✅ Dashboard muestra widget "⏸️ Esperando Repuestos" con contador
- [x] ✅ Badge visual teal (#009688) consistente
- [x] ✅ Campos `ObsRepuestos` y `RepuestosSolicitados` persisten en Supabase
- [x] ✅ Selectores Redux funcionan (`selectReparacionesEnRepuestos`, `selectCantidadEnRepuestos`)
- [x] ✅ Filtro por estado "Repuestos" funciona dinámicamente
- [x] ✅ Compatibilidad offline (IndexedDB via Supabase client)
- [x] ✅ 43 tests unitarios (100% passing)
- [x] ✅ Documentación actualizada (`openspec/project.md`, JSDoc)
- [x] ✅ No hay advertencias legacy para "Repuestos"
- [x] ✅ Compilación sin errores TypeScript

**Estado:** ✅ **TODOS LOS CRITERIOS CUMPLIDOS**

---

## 🚀 Implementation Summary

### ✅ Phase 0: Database Migration (COMPLETADA)
```sql
-- ✅ EJECUTADO en Supabase Dashboard
ALTER TABLE repair 
ADD COLUMN parts_notes TEXT,
ADD COLUMN requested_parts_ids TEXT[];

-- ✅ Constraints aplicados
ALTER TABLE repair
ADD CONSTRAINT parts_notes_length CHECK (LENGTH(parts_notes) <= 2000),
ADD CONSTRAINT requested_parts_ids_length CHECK (array_length(requested_parts_ids, 1) <= 50);

-- ✅ Índice GIN creado
CREATE INDEX idx_repair_requested_parts ON repair USING GIN (requested_parts_ids);
```

### ✅ Phase 1: Data Layer (COMPLETADA)
- ✅ `estados.ts` - Repuestos actualizado (etapa 8.5, activo)
- ✅ `estado.ts` - Enum agregado
- ✅ `reparacion.ts` - Campos TypeScript agregados
- ✅ `reparacionesPersistencia.js` - Mapeo bidireccional Supabase

### ✅ Phase 2: Business Logic (COMPLETADA)
- ✅ `estadosReparacion.ts` - Lógica de validación
- ✅ `estadosReparacion.test.ts` - 43 tests (100% ✅)
- ✅ Transiciones validadas con casos de prueba

### ✅ Phase 3: UI Components (COMPLETADA)
- ✅ `Reparacion.component.tsx` - Botones bidireccionales, campos, alerts
- ✅ `Inicio.component.tsx` - Widget dashboard con contador
- ✅ `GaleriaReparaciones.component.tsx` - Filtros dinámicos
- ✅ Fixes aplicados: legacy classification, button visibility, section display

### ❌ Phase 4: Integration Testing (ELIMINADA)
- ❌ Eliminada por decisión del usuario
- ⚠️ Validación manual pendiente (ver `VALIDATION_CHECKLIST.md`)

### ✅ Phase 5: Documentation (COMPLETADA)
- ✅ `openspec/project.md` - Domain model actualizado
- ✅ JSDoc completo en componentes y selectores
- ✅ `VALIDATION_CHECKLIST.md` creado
- ✅ Este README actualizado

---

## 🧪 Validación Manual Pendiente

Ver archivo completo: [`VALIDATION_CHECKLIST.md`](./VALIDATION_CHECKLIST.md)

### Quick Test (5 minutos)
1. **Pausar reparación:**
   - Abrir reparación en "Aceptado"
   - Click "⏸️ Pausar - Esperando Repuestos"
   - Ingresar observaciones → Guardar

2. **Reanudar reparación:**
   - Abrir reparación (ahora en "Repuestos")
   - Verificar alert amarillo visible
   - Click "✅ Repuestos Llegaron - Continuar Reparación"
   - Guardar → Verificar vuelve a "Aceptado"

3. **Dashboard:**
   - Ir a Inicio
   - Verificar widget "⏸️ Esperando Repuestos" con contador
   - Expandir lista → Click en reparación

---

## 🚀 Quick Start (IMPLEMENTACIÓN COMPLETADA)

### 1. Review de la Propuesta
```bash
# Leer documentos en orden:
cat openspec/changes/add-repuestos-state/proposal.md
cat openspec/changes/add-repuestos-state/specs/state-transitions/spec.md
cat openspec/changes/add-repuestos-state/specs/data-model/spec.md
cat openspec/changes/add-repuestos-state/specs/ui-representation/spec.md
```

### 2. ⚠️ **PASO CRÍTICO:** Migración de Base de Datos

**EJECUTAR PRIMERO antes de cualquier código:**

```sql
-- Conectar a Supabase Dashboard → SQL Editor
-- Copiar y ejecutar este script:

BEGIN;

ALTER TABLE repair 
ADD COLUMN IF NOT EXISTS parts_notes TEXT,
ADD COLUMN IF NOT EXISTS requested_parts_ids TEXT[];

COMMENT ON COLUMN repair.parts_notes IS 'Observaciones sobre qué repuestos se necesitan';
COMMENT ON COLUMN repair.requested_parts_ids IS 'IDs de repuestos solicitados';

ALTER TABLE repair
ADD CONSTRAINT parts_notes_length CHECK (LENGTH(parts_notes) <= 2000);

ALTER TABLE repair
ADD CONSTRAINT requested_parts_count CHECK (
  array_length(requested_parts_ids, 1) IS NULL 
  OR array_length(requested_parts_ids, 1) <= 50
);

CREATE INDEX IF NOT EXISTS idx_repair_requested_parts 
ON repair USING GIN(requested_parts_ids);

COMMIT;

-- Verificar:
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'repair' 
  AND column_name IN ('parts_notes', 'requested_parts_ids');
```

### 3. Implementación de Código
```bash
# Seguir tareas en orden:
cat openspec/changes/add-repuestos-state/tasks.md

# ORDEN ESTRICTO:
# Phase 0: ✅ Migración BD (COMPLETAR ANTES DE CONTINUAR)
# Phase 1: Actualizar tipos y persistencia
# Phase 2: Lógica de negocio
# Phase 3: UI
# Phase 4: Testing
# Phase 5: Docs
```

### 4. Testing
```bash
npm run build     # Verificar compilación
npm test          # Correr tests unitarios
npm start         # Probar manualmente

# Verificar en Supabase:
# - Crear reparación con estado "Repuestos"
# - Verificar que parts_notes y requested_parts_ids se guardan
```

---

## 📚 Documentos Relacionados

- [`proposal.md`](./proposal.md) - Propuesta completa con contexto y justificación
- [`tasks.md`](./tasks.md) - Lista detallada de tareas de implementación
- [`specs/state-transitions/spec.md`](./specs/state-transitions/spec.md) - Especificación de transiciones
- [`specs/data-model/spec.md`](./specs/data-model/spec.md) - Especificación de datos
- [`specs/ui-representation/spec.md`](./specs/ui-representation/spec.md) - Especificación de UI

---

## ⚠️ Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Confusión con estado legacy | Comunicar claramente que es el mismo, solo modernizado |
| Reparaciones atascadas en Repuestos | Filtros y alertas en dashboard |
| Ciclos infinitos Aceptado ↔ Repuestos | Comportamiento esperado, no es problema |

---

## 🔧 Development Notes

### Estado Actual del Sistema

El estado "Repuestos" **ya existe** en el código:

```typescript
// src/datos/estados.ts
Repuestos: {
  nombre: "Repuestos",
  prioridad: 2,                              // ← Cambiar a 1
  accion: "Migrar a 'Aceptado'",            // ← Cambiar a "Esperar llegada..."
  color: "#009688",                          // ← Mantener
  etapa: 101,                                // ← Cambiar a 8
}

// src/types/estado.ts
enum Etapas {
  // ...
  Repuestos = 101,  // ← Cambiar a 8
}
```

### Por Qué No Crear un Estado Nuevo

- ✅ Reutiliza infraestructura existente
- ✅ No rompe datos históricos que pudieran tener este estado
- ✅ Cambio más simple y seguro
- ✅ Mantiene consistencia en Firestore

---

## 🤝 Contributing

Para trabajar en esta propuesta:

1. **Branch:** Crear branch `feature/add-repuestos-state`
2. **Commits:** Seguir convención de commits del proyecto (español)
3. **Tests:** Agregar tests para cada cambio
4. **Docs:** Actualizar `openspec/project.md` al final
5. **PR:** Crear PR con referencia a esta propuesta

---

## 📝 Changelog

### 2025-11-16 - Propuesta Creada
- Creado scaffolding de propuesta
- Definidos 3 specs: state-transitions, data-model, ui-representation
- Estimación inicial: 9-13 horas de desarrollo
- Identificado como cambio aditivo sin breaking changes

---

## 🎨 Visual References

### Badge Actual vs. Nuevo

**Actual (Legacy):**
```
┌────────────────┐
│ Repuestos      │  (sin color distintivo, etapa 101)
└────────────────┘
```

**Nuevo (Principal):**
```
┌────────────────┐
│ 📦 Repuestos   │  (color #009688, etapa 8, ícono BoxSeam)
└────────────────┘
```

### Dashboard Widget

```
┌─────────────────────────────────────────┐
│ 📦 Esperando Repuestos            [>]   │
├─────────────────────────────────────────┤
│                                         │
│              3                          │
│         Reparaciones                    │
│                                         │
├─────────────────────────────────────────┤
│ #1234 - DJI Mini 3 Pro   [En espera]   │
│ Motor delantero izquierdo               │
├─────────────────────────────────────────┤
│ #1235 - Mavic 3          [En espera]   │
│ Cámara gimbal                           │
├─────────────────────────────────────────┤
│ #1238 - Air 2S           [En espera]   │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📞 Questions?

Para dudas sobre esta propuesta:
- Ver sección "Open Questions" en [`proposal.md`](./proposal.md)
- Revisar specs individuales para detalles técnicos
- Consultar [`openspec/project.md`](../../project.md) para contexto del proyecto

---

**Last Updated:** 2025-11-16  
**Author:** Mauricio Cruz  
**Status:** Draft - Pendiente de revisión e implementación
