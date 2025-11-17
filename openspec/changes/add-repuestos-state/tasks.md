# Tasks: Activar Estado "Repuestos"

**Change ID:** `add-repuestos-state`  
**Estimated Total:** 9-13 horas  

## Implementation Tasks

### Phase 0: Database Migration (30 min)

**⚠️ EJECUTAR PRIMERO - Requiere acceso a Supabase Dashboard**

#### T0.1: Migrar Base de Datos Supabase
**Platform:** Supabase Dashboard o SQL Editor  
**Effort:** 30 min  
**Dependencies:** Ninguna  
**Critical:** SÍ (bloquea todo lo demás)  

- [ ] Conectar a Supabase Dashboard del proyecto
- [ ] Abrir SQL Editor
- [ ] Ejecutar script de migración (ver abajo)
- [ ] Verificar que columnas se crearon
- [ ] Verificar que constraints funcionan
- [ ] Probar inserción manual de prueba

**Migration Script:**
```sql
-- ============================================
-- MIGRATION: Agregar campos para estado Repuestos
-- Date: 2025-11-16
-- ============================================

BEGIN;

-- Agregar columnas
ALTER TABLE repair 
ADD COLUMN IF NOT EXISTS parts_notes TEXT,
ADD COLUMN IF NOT EXISTS requested_parts_ids TEXT[];

-- Agregar comentarios
COMMENT ON COLUMN repair.parts_notes IS 'Observaciones sobre qué repuestos se necesitan (max 2000 chars)';
COMMENT ON COLUMN repair.requested_parts_ids IS 'IDs de repuestos solicitados del inventario (max 50 items)';

-- Agregar constraints de validación
ALTER TABLE repair
ADD CONSTRAINT parts_notes_length CHECK (LENGTH(parts_notes) <= 2000);

ALTER TABLE repair
ADD CONSTRAINT requested_parts_count CHECK (
  array_length(requested_parts_ids, 1) IS NULL 
  OR array_length(requested_parts_ids, 1) <= 50
);

-- Crear index para búsquedas en array (opcional pero recomendado)
CREATE INDEX IF NOT EXISTS idx_repair_requested_parts 
ON repair USING GIN(requested_parts_ids);

COMMIT;
```

**Verification Script:**
```sql
-- Verificar columnas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'repair' 
  AND column_name IN ('parts_notes', 'requested_parts_ids')
ORDER BY column_name;

-- Debe retornar:
-- parts_notes         | text  | YES | NULL
-- requested_parts_ids | ARRAY | YES | NULL

-- Verificar constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'repair'
  AND constraint_name LIKE '%parts%';

-- Debe incluir:
-- parts_notes_length
-- requested_parts_count

-- Test de inserción
INSERT INTO repair (state, parts_notes, requested_parts_ids, owner_id, drone_name, description)
VALUES ('Repuestos', 'Motor DJI Mini 3 Pro', ARRAY['rep_test'], 1, 'DJI Mini 3 Pro', 'Test')
RETURNING id, parts_notes, requested_parts_ids;

-- Limpiar test
DELETE FROM repair WHERE parts_notes = 'Motor DJI Mini 3 Pro';
```

**Rollback (si algo sale mal):**
```sql
BEGIN;

-- Eliminar constraints
ALTER TABLE repair DROP CONSTRAINT IF EXISTS parts_notes_length;
ALTER TABLE repair DROP CONSTRAINT IF EXISTS requested_parts_count;

-- Eliminar index
DROP INDEX IF EXISTS idx_repair_requested_parts;

-- Eliminar columnas
ALTER TABLE repair DROP COLUMN IF EXISTS parts_notes;
ALTER TABLE repair DROP COLUMN IF EXISTS requested_parts_ids;

COMMIT;
```

---

### Phase 1: Data Layer (1.5-2 horas)

#### T1.0: Migración de Base de Datos Supabase
**Database:** Supabase  
**Effort:** 30 min  
**Dependencies:** Ninguna  

- [ ] Ejecutar migration SQL para agregar columnas `parts_notes` y `requested_parts_ids`
- [ ] Agregar constraints de validación (max 2000 chars, max 50 items)
- [ ] Crear index GIN para búsquedas en array (opcional)
- [ ] Agregar comentarios a columnas
- [ ] Verificar que las columnas se crearon correctamente

**Migration Script:**
```sql
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
```

**Validation:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'repair' 
  AND column_name IN ('parts_notes', 'requested_parts_ids');
```

---

#### T1.1: Actualizar Metadata del Estado "Repuestos"
**File:** `src/datos/estados.ts`  
**Effort:** 15 min  
**Dependencies:** Ninguna  

- [ ] Cambiar `etapa: 101` → `etapa: 8` (después de "Aceptado", antes de "Reparado")
- [ ] Cambiar `prioridad: 2` → `prioridad: 1` (alta prioridad)
- [ ] Cambiar `accion: "Migrar a 'Aceptado'"` → `accion: "Esperar llegada de repuestos"`
- [ ] Mantener `color: "#009688"`
- [ ] Mantener `nombre: "Repuestos"`

**Validation:**
```bash
npm run build
# Debe compilar sin errores
```

---

#### T1.2: Actualizar Enum Etapas
**File:** `src/types/estado.ts`  
**Effort:** 10 min  
**Dependencies:** T1.1  

- [ ] Mover `Repuestos = 101` a `Repuestos = 8` en enum `Etapas`
- [ ] Ajustar números de etapas posteriores si es necesario
- [ ] Eliminar comentario "// Estados de retrocompatibilidad" de Repuestos

**Validation:**
```bash
npm run build
# Verificar que no hay errores de tipo
```

---

#### T1.3: Agregar Campos Opcionales a DataReparacion
**File:** `src/types/reparacion.ts`  
**Effort:** 10 min  
**Dependencies:** Ninguna (paralelo con T1.1-T1.2)  

- [ ] Agregar `ObsRepuestos?: string;` a interface `DataReparacion`
- [ ] Agregar `RepuestosSolicitados?: string[];` a interface `DataReparacion`
- [ ] Agregar comentarios JSDoc explicativos

**Validation:**
```bash
npm run build
# Debe compilar sin errores
```

---

#### T1.4: Tests de Tipos
**File:** `src/types/__tests__/reparacion.test.ts` (crear si no existe)  
**Effort:** 30 min  
**Dependencies:** T1.3  
**Parallelizable:** Sí (puede hacerse después si no bloquea)  

- [ ] Test: DataReparacion con ObsRepuestos es válido
- [ ] Test: DataReparacion con RepuestosSolicitados es válido
- [ ] Test: Campos son opcionales

**Validation:**
```bash
npm test -- --testPathPattern=reparacion.test
```

---

#### T1.5: Actualizar Capa de Persistencia Supabase
**File:** `src/persistencia/persistenciaSupabase/reparacionesPersistencia.js`  
**Effort:** 45 min  
**Dependencies:** T1.0, T1.3  

- [ ] Actualizar query SELECT en `getReparacionesPersistencia` para incluir `parts_notes` y `requested_parts_ids`
- [ ] Actualizar mapeo BD → Frontend (parts_notes → ObsRepuestos, requested_parts_ids → RepuestosSolicitados)
- [ ] Actualizar mapeo Frontend → BD en `guardarReparacionPersistencia`
- [ ] Agregar validación de longitud antes de guardar
- [ ] Agregar console.log para debugging (opcional)

**Code Changes:**
```javascript
// En getReparacionesPersistencia - UPDATE SELECT
let query = supabase.from('repair').select(`
  // ...existing columns...
  photo_before,
  photo_after,
  parts_notes,              // ← NUEVO
  requested_parts_ids,      // ← NUEVO
  drone:drone_id (id),
  owner:owner_id (id, email, first_name, last_name, telephone)
`);

// En mapeo de datos - UPDATE MAPPING
const reparaciones = data.map(item => ({
  id: String(item.id),
  data: {
    // ...existing fields...
    FotoAntes: item.photo_before || undefined,
    FotoDespues: item.photo_after || undefined,
    ObsRepuestos: item.parts_notes || undefined,                    // ← NUEVO
    RepuestosSolicitados: item.requested_parts_ids || undefined     // ← NUEVO
  }
}));

// En guardarReparacionPersistencia - ADD VALIDATION
export const guardarReparacionPersistencia = async (reparacion) => {
  // Validar antes de guardar
  if (reparacion.data.ObsRepuestos && reparacion.data.ObsRepuestos.length > 2000) {
    throw new Error('Las observaciones de repuestos no pueden superar los 2000 caracteres');
  }
  
  if (reparacion.data.RepuestosSolicitados && reparacion.data.RepuestosSolicitados.length > 50) {
    throw new Error('No se pueden solicitar más de 50 repuestos por reparación');
  }
  
  const reparacionData = {
    // ...existing fields...
    photo_before: reparacion.data.FotoAntes || null,
    photo_after: reparacion.data.FotoDespues || null,
    parts_notes: reparacion.data.ObsRepuestos || null,              // ← NUEVO
    requested_parts_ids: reparacion.data.RepuestosSolicitados || null  // ← NUEVO
  };
  
  // ...resto del código
};
```

**Validation:**
```bash
npm run build
# Debe compilar sin errores

# Test manual en browser console:
# 1. Crear reparación con ObsRepuestos
# 2. Verificar en Supabase que parts_notes se guardó
```

---

### Phase 2: Business Logic (2-3 horas)

#### T2.1: Crear/Actualizar Lógica de Validación de Transiciones
**File:** `src/usecases/estadosReparacion.ts` (crear si no existe)  
**Effort:** 1 hora  
**Dependencies:** T1.1, T1.2  

- [ ] Función `esTransicionValida(estadoActual: string, estadoNuevo: string): boolean`
- [ ] Definir transiciones permitidas:
  ```typescript
  Aceptado → [Repuestos, Reparado, Rechazado, Cancelado, Abandonado]
  Repuestos → [Aceptado, Cancelado, Abandonado]
  ```
- [ ] Documentar que el ciclo Aceptado ↔ Repuestos es ilimitado

**Validation:**
```typescript
// Debe retornar true
esTransicionValida("Aceptado", "Repuestos")
esTransicionValida("Repuestos", "Aceptado")

// Debe retornar false
esTransicionValida("Repuestos", "Reparado")
esTransicionValida("Consulta", "Repuestos")
```

---

#### T2.2: Crear Selector Redux para Repuestos
**File:** `src/redux-tool-kit/reparacion/reparacion.selectors.ts`  
**Effort:** 30 min  
**Dependencies:** T1.1  

- [ ] Crear `selectReparacionesEnRepuestos` usando `createSelector`
- [ ] Documentar complejidad: O(n) donde n = total de reparaciones
- [ ] Retorna array de reparaciones con `EstadoRep === "Repuestos"`

**Code:**
```typescript
export const selectReparacionesEnRepuestos = createSelector(
  [selectReparacionesArray],
  (reparaciones) => 
    reparaciones.filter(rep => rep.data.EstadoRep === "Repuestos")
);
```

**Validation:**
```bash
npm run build
# Verificar que no hay errores de tipo
```

---

#### T2.3: Actualizar Selector de Contador de Estados
**File:** `src/redux-tool-kit/reparacion/reparacion.selectors.ts`  
**Effort:** 20 min  
**Dependencies:** T2.2 (paralelo)  

- [ ] Verificar que `selectContadorEstados` incluye "Repuestos" automáticamente
- [ ] Si no existe, crear selector que cuenta por estado
- [ ] Documentar complejidad: O(n)

**Validation:**
```typescript
// Debe incluir entrada para "Repuestos"
const contadores = selectContadorEstados(state);
expect(contadores).toHaveProperty("Repuestos");
```

---

#### T2.4: Tests Unitarios de Lógica de Transiciones
**File:** `src/usecases/__tests__/estadosReparacion.test.ts`  
**Effort:** 1 hora  
**Dependencies:** T2.1  

- [ ] Test: Aceptado → Repuestos es válido
- [ ] Test: Repuestos → Aceptado es válido
- [ ] Test: Repuestos → Reparado es inválido
- [ ] Test: Consulta → Repuestos es inválido
- [ ] Test: Ciclo múltiple Aceptado ↔ Repuestos ↔ Aceptado funciona

**Validation:**
```bash
npm test -- --testPathPattern=estadosReparacion.test
# Todos los tests deben pasar
```

---

### Phase 3: UI Components (3-4 horas)

#### T3.1: Actualizar Componente de Cambio de Estado
**File:** `src/components/Reparacion/CambioEstado.component.tsx` (buscar el correcto)  
**Effort:** 2 horas  
**Dependencies:** T2.1  

- [ ] Importar `esTransicionValida` de usecases
- [ ] Filtrar estados disponibles según estado actual
- [ ] Agregar sección condicional cuando `estadoSeleccionado === "Repuestos"`:
  - Input para `ObsRepuestos` (textarea)
  - Selector múltiple para `RepuestosSolicitados` (opcional)
- [ ] Agregar mensaje informativo cuando viene de Repuestos → Aceptado

**Validation:**
```bash
npm start
# Probar manualmente en browser:
# 1. Cambiar de Aceptado a Repuestos
# 2. Ver campos adicionales
# 3. Guardar y verificar persistencia
# 4. Cambiar de Repuestos a Aceptado
```

---

#### T3.2: Crear Widget de Dashboard para Repuestos
**File:** `src/components/Dashboard/RepuestosWidget.component.tsx` (crear)  
**Effort:** 1 hora  
**Dependencies:** T2.2  

- [ ] Usar selector `selectReparacionesEnRepuestos`
- [ ] Mostrar cantidad de reparaciones en repuestos
- [ ] Listar reparaciones con:
  - Número de reparación
  - Modelo de drone
  - Observaciones de repuestos (si existen)
- [ ] Badge color #009688 con ícono `BoxSeam` de react-bootstrap-icons

**Validation:**
```bash
npm start
# Verificar que aparece en dashboard
# Agregar reparación a estado Repuestos
# Verificar que aparece en widget
```

---

#### T3.3: Actualizar Badge Visual y Estilos
**File:** `src/components/Reparacion/EstadoBadge.component.tsx` (buscar el correcto)  
**Effort:** 30 min  
**Dependencies:** Ninguna (paralelo)  

- [ ] Agregar caso para estado "Repuestos"
- [ ] Color de fondo: #009688
- [ ] Icono: `<BoxSeam />` de react-bootstrap-icons
- [ ] Texto: "Repuestos"

**Code:**
```tsx
import { BoxSeam } from 'react-bootstrap-icons';

// ...existing code...
case "Repuestos":
  return (
    <Badge bg="info" style={{ backgroundColor: "#009688" }}>
      <BoxSeam className="me-2" />
      Repuestos
    </Badge>
  );
```

**Validation:**
```bash
npm start
# Verificar badge en lista de reparaciones
```

---

#### T3.4: Agregar Filtro de Estado "Repuestos"
**File:** `src/components/Reparacion/FiltrosReparacion.component.tsx` (buscar el correcto)  
**Effort:** 30 min  
**Dependencies:** Ninguna  

- [ ] Verificar que "Repuestos" aparece en dropdown de filtros de estado
- [ ] Si no aparece, agregar explícitamente
- [ ] Verificar que filtro funciona correctamente

**Validation:**
```bash
npm start
# Ir a lista de reparaciones
# Filtrar por "Repuestos"
# Debe mostrar solo reparaciones en ese estado
```

---

### Phase 4: Integration & Testing (2-3 horas)

#### T4.1: Tests de Integración de Cambio de Estado
**File:** `src/components/Reparacion/__tests__/CambioEstado.test.tsx`  
**Effort:** 1.5 horas  
**Dependencies:** T3.1  

- [ ] Test: Cambiar de Aceptado a Repuestos guarda correctamente
- [ ] Test: Campos `ObsRepuestos` se persisten
- [ ] Test: Cambiar de Repuestos a Aceptado funciona
- [ ] Test: Transiciones inválidas están deshabilitadas

**Validation:**
```bash
npm test -- --testPathPattern=CambioEstado.test
```

---

#### T4.2: Validación en Browser
**Effort:** 1 hora  
**Dependencies:** T3.1, T3.2, T3.3, T3.4  

- [ ] Crear reparación de prueba en estado "Aceptado"
- [ ] Cambiar a "Repuestos" con observaciones
- [ ] Verificar que aparece en widget de dashboard
- [ ] Verificar badge visual
- [ ] Cambiar de vuelta a "Aceptado"
- [ ] Repetir ciclo 2-3 veces
- [ ] Verificar persistencia (refresh página)

**Validation:**
```bash
npm start
# Seguir checklist manual arriba
```

---

#### T4.3: Validación Offline (Local First)
**Effort:** 30 min  
**Dependencies:** T4.2  

- [ ] Activar modo offline en DevTools
- [ ] Cambiar estado a Repuestos
- [ ] Verificar que funciona sin conexión
- [ ] Reconectar y verificar sincronización con Firestore

**Validation:**
```bash
npm start
# Network tab: Throttling → Offline
# Realizar cambio de estado
# Online de nuevo
# Verificar en Firebase Console que se sincronizó
```

---

#### T4.4: Validación en Android (si aplica)
**Effort:** 30 min  
**Dependencies:** T4.3  
**Optional:** Sí  

- [ ] Build APK: `cordova build android`
- [ ] Instalar en dispositivo/emulador
- [ ] Probar cambio de estado a Repuestos
- [ ] Verificar persistencia offline

**Validation:**
```bash
cordova build android
adb install platforms/android/app/build/outputs/apk/debug/app-debug.apk
# Probar manualmente en dispositivo
```

---

### Phase 5: Documentation (1 hora)

#### T5.1: Actualizar openspec/project.md
**File:** `openspec/project.md`  
**Effort:** 30 min  
**Dependencies:** Todas las anteriores  

- [ ] Actualizar sección "Entidades Principales → Reparación"
  - Cambiar flujo de estados para incluir "Repuestos" en posición correcta
  - Quitar mención de "legacy" para Repuestos
- [ ] Agregar campos `ObsRepuestos` y `RepuestosSolicitados` a documentación
- [ ] Actualizar "Reglas de Negocio" con transiciones de Repuestos

**Validation:**
```bash
# Revisar que markdown es válido
markdownlint openspec/project.md
```

---

#### T5.2: Comentarios en Código
**Files:** Varios  
**Effort:** 20 min  
**Dependencies:** T5.1 (paralelo)  

- [ ] Agregar JSDoc a función `esTransicionValida`
- [ ] Agregar comentarios a selector `selectReparacionesEnRepuestos`
- [ ] Comentar lógica condicional en componente de cambio de estado

**Validation:**
```bash
# Revisar que comentarios son claros y útiles
```

---

#### T5.3: Actualizar CHANGELOG (si existe)
**File:** `CHANGELOG.md` o `openspec/changes/add-repuestos-state/CHANGELOG.md`  
**Effort:** 10 min  
**Dependencies:** T5.1  
**Optional:** Sí  

- [ ] Agregar entrada con fecha y resumen del cambio
- [ ] Listar breaking changes (ninguno esperado)
- [ ] Listar nuevas features

---

## Validation Checklist Final

Antes de considerar el cambio completo:

- [ ] `npm run build` exitoso sin warnings
- [ ] `npm test` todos los tests pasan
- [ ] Estado "Repuestos" visible en UI
- [ ] Transiciones Aceptado ↔ Repuestos funcionan
- [ ] Widget de dashboard muestra reparaciones en Repuestos
- [ ] Badge visual correcto (#009688 + ícono caja)
- [ ] Campos opcionales persisten en Firestore
- [ ] Funciona offline
- [ ] Documentación actualizada
- [ ] Code review aprobado (si aplica)

---

## Rollback Plan

Si algo sale mal:

1. **Revertir commits:**
   ```bash
   git revert <commit-hash>
   ```

2. **Datos en Firestore:**
   - No requiere migración, campos opcionales son compatibles
   - Reparaciones con estado "Repuestos" siguen siendo válidas

3. **Estado Legacy:**
   - Si se necesita rollback completo, cambiar de vuelta:
     - `etapa: 8` → `etapa: 101`
     - `prioridad: 1` → `prioridad: 2`
     - `accion` al valor legacy

---

## Notes

- **Parallelización:** T1.1-T1.3 pueden hacerse en paralelo
- **Tests opcionales:** T1.4 y T4.4 no bloquean deployment si hay presión de tiempo
- **Incremental delivery:** Se puede desplegar Phase 1-3 sin Phase 4 si es necesario (riesgoso pero posible)
