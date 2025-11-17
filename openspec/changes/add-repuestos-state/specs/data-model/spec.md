# Spec: Data Model - Campos de Repuestos

**Capability:** `data-model`  
**Change ID:** `add-repuestos-state`  
**Status:** Draft  

---

## MODIFIED Requirements

### Requirement: REQ-DM-001 - Estructura de Datos de Reparación

La interface `DataReparacion` DEBE contener todos los campos necesarios para representar el ciclo completo de una reparación, incluyendo información sobre repuestos solicitados.

**Rationale:** Mantener un modelo de datos completo y normalizado que soporte todos los estados del flujo de reparación.

#### Scenario: Reparación con observaciones de repuestos

**Given** una reparación que necesita repuestos específicos  
**When** el técnico cambia el estado a "Repuestos"  
**Then** el sistema DEBE permitir guardar observaciones en el campo `ObsRepuestos`  
**And** las observaciones DEBEN persistir en Firestore  
**And** DEBEN ser visibles en el detalle de la reparación

**Acceptance Criteria:**
- ✅ Campo `ObsRepuestos?: string` existe en `DataReparacion`
- ✅ Campo es opcional (puede ser `undefined`)
- ✅ Se persiste correctamente en Firestore
- ✅ Máximo 2000 caracteres (limitación razonable)

**Example:**
```typescript
const reparacion: DataReparacion = {
  EstadoRep: "Repuestos",
  ObsRepuestos: "Necesita: Motor delantero izquierdo DJI Mini 3 Pro, tornillos M2x6 (x4)",
  // ...otros campos
};
```

---

#### Scenario: Reparación con lista de repuestos del inventario

**Given** una reparación que necesita repuestos registrados en el inventario  
**When** el técnico selecciona los repuestos específicos  
**Then** el sistema DEBE guardar los IDs en el campo `RepuestosSolicitados`  
**And** los IDs DEBEN corresponder a documentos existentes en la colección `repuestos`  
**And** el sistema DEBE poder cargar los detalles de cada repuesto posteriormente

**Acceptance Criteria:**
- ✅ Campo `RepuestosSolicitados?: string[]` existe en `DataReparacion`
- ✅ Campo es opcional (puede ser `undefined` o array vacío)
- ✅ Cada string en el array es un ID válido de Firestore
- ✅ Se persiste como array en Firestore
- ✅ Máximo 50 repuestos por reparación (limitación razonable)

**Example:**
```typescript
const reparacion: DataReparacion = {
  EstadoRep: "Repuestos",
  RepuestosSolicitados: [
    "rep_abc123xyz",
    "rep_def456uvw",
    "rep_ghi789rst"
  ],
  // ...otros campos
};
```

---

#### Scenario: Reparación sin datos de repuestos

**Given** una reparación que nunca estuvo en estado "Repuestos"  
**When** se consultan los datos de la reparación  
**Then** los campos `ObsRepuestos` y `RepuestosSolicitados` DEBEN ser `undefined`  
**And** esto NO DEBE causar errores en la UI  
**And** otros estados DEBEN funcionar normalmente

**Acceptance Criteria:**
- ✅ Campos son opcionales (sufijo `?` en TypeScript)
- ✅ Componentes manejan `undefined` correctamente
- ✅ Reparaciones legacy sin estos campos siguen funcionando
- ✅ No se requiere migración de datos existentes

---

## ADDED Requirements

### Requirement: REQ-DM-002 - Compatibilidad con Datos Legacy

El modelo de datos DEBE mantener compatibilidad total con reparaciones existentes que no tienen los nuevos campos.

**Rationale:** Evitar breaking changes y migraciones complejas de datos en producción.

#### Scenario: Reparación legacy sin campos de repuestos

**Given** una reparación creada antes de implementar campos de repuestos  
**When** se carga desde Firestore  
**Then** la reparación DEBE cargarse sin errores  
**And** campos opcionales DEBEN ser `undefined`  
**And** todas las funcionalidades existentes DEBEN seguir funcionando

**Acceptance Criteria:**
- ✅ No se requiere valor por defecto para campos nuevos
- ✅ TypeScript permite `undefined` para campos opcionales
- ✅ Componentes verifican existencia antes de usar (`if (rep.data.ObsRepuestos)`)
- ✅ Tests incluyen casos con datos legacy

---

### Requirement: REQ-DM-003 - Validación de Datos

Los campos relacionados con repuestos DEBEN validarse antes de persistir en Firestore.

**Rationale:** Mantener integridad de datos y prevenir valores inválidos que causen problemas posteriores.

#### Scenario: Validación de observaciones de repuestos

**Given** un técnico intenta guardar observaciones de repuestos  
**When** las observaciones son demasiado largas (>2000 caracteres)  
**Then** el sistema DEBE mostrar un error de validación  
**And** NO DEBE permitir guardar hasta que se corrija

**Acceptance Criteria:**
- ✅ Máximo 2000 caracteres en `ObsRepuestos`
- ✅ Mensaje de error claro y útil
- ✅ Contador de caracteres visible en UI (opcional pero recomendado)

---

#### Scenario: Validación de IDs de repuestos

**Given** un técnico selecciona repuestos desde el inventario  
**When** algún ID no existe en la colección `repuestos`  
**Then** el sistema DEBE mostrar una advertencia  
**And** DEBERÍA permitir guardar pero marcar el ID como inválido  
**Or** alternativamente, NO permitir seleccionar IDs inválidos en UI

**Acceptance Criteria:**
- ✅ Solo IDs válidos de Firestore son aceptados
- ✅ UI solo muestra repuestos existentes en selector
- ✅ Si un repuesto es eliminado después, la reparación no falla al cargar

---

## REMOVED Requirements

_Ninguno. Esta es una adición sin remociones._

---

## TypeScript Definitions

### Updated Interface: DataReparacion

```typescript
export interface DataReparacion {
    EstadoRep: string;
    PrioridadRep: number | null;
    FeConRep: number | null;
    ModeloDroneNameRep: string;
    DescripcionUsuRep: string;
    UsuarioRep: string;
    NombreUsu?: string;
    EmailUsu?: string;
    TelefonoUsu?: string;
    ApellidoUsu?: string;
    DroneId?: string;
    DriveRep?: string;
    AnotacionesRep?: string;
    DiagnosticoRep?: string;
    FeRecRep?: number | null;
    NumeroSerieRep?: string;
    DescripcionTecRep?: string;
    PresuMoRep?: number | null;
    PresuReRep?: number | null;
    PresuFiRep?: number | null;
    PresuDiRep?: number | null;
    TxtRepuestosRep?: string;
    InformeRep?: string;
    FeFinRep?: number | null;
    FeEntRep?: number | null;
    TxtEntregaRep?: string;
    SeguimientoEntregaRep?: string;
    urlsFotos?: string[];
    urlsDocumentos?: string[];
    IntervencionesIds?: string[];
    FotoAntes?: string;
    FotoDespues?: string;
    
    // ======================================================
    // CAMPOS PARA ESTADO "REPUESTOS"
    // ======================================================
    
    /**
     * Observaciones sobre qué repuestos se necesitan.
     * Texto libre para especificar detalles.
     * @maxLength 2000
     * @example "Necesita: Motor delantero izquierdo DJI Mini 3 Pro, tornillos M2x6 (x4)"
     */
    ObsRepuestos?: string;
    
    /**
     * Lista de IDs de repuestos del inventario que se solicitaron.
     * Cada ID corresponde a un documento en la colección 'repuestos'.
     * @maxItems 50
     * @example ["rep_abc123xyz", "rep_def456uvw"]
     */
    RepuestosSolicitados?: string[];
}
```

---

## Database Schema

### Supabase (Actual)

#### Table: `repair`

**Nuevas columnas a agregar:**

```sql
-- Agregar columnas para estado Repuestos
ALTER TABLE repair 
ADD COLUMN IF NOT EXISTS parts_notes TEXT,
ADD COLUMN IF NOT EXISTS requested_parts_ids TEXT[];

-- Agregar comentarios
COMMENT ON COLUMN repair.parts_notes IS 'Observaciones sobre qué repuestos se necesitan (max 2000 chars)';
COMMENT ON COLUMN repair.requested_parts_ids IS 'Array de IDs de repuestos solicitados del inventario (max 50 items)';

-- Agregar constraint de longitud
ALTER TABLE repair
ADD CONSTRAINT parts_notes_length CHECK (LENGTH(parts_notes) <= 2000);

-- Agregar constraint de cantidad de items
ALTER TABLE repair
ADD CONSTRAINT requested_parts_count CHECK (array_length(requested_parts_ids, 1) IS NULL OR array_length(requested_parts_ids, 1) <= 50);
```

**Row Permissions (RLS):**
```sql
-- Lectura: usuarios autenticados pueden ver reparaciones
CREATE POLICY "Users can read repairs" ON repair
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Escritura: validar longitud de campos
CREATE POLICY "Users can update repair parts" ON repair
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (
    (parts_notes IS NULL OR LENGTH(parts_notes) <= 2000)
    AND
    (requested_parts_ids IS NULL OR array_length(requested_parts_ids, 1) <= 50)
  );
```

**Indexes:**
```sql
-- Index para filtrar por estado (ya existe)
CREATE INDEX IF NOT EXISTS idx_repair_state ON repair(state);

-- Index para consultas con repuestos solicitados (opcional)
CREATE INDEX IF NOT EXISTS idx_repair_requested_parts ON repair USING GIN(requested_parts_ids);
```

---

### Firebase (Legacy - Retrocompatibilidad)

Si todavía existen datos en Firebase:

#### Collection: `reparaciones`

**Document ID:** Auto-generado por Firestore  

**Fields:**
```json
{
  "EstadoRep": "Repuestos",
  "ObsRepuestos": "Motor delantero izquierdo DJI Mini 3 Pro",
  "RepuestosSolicitados": ["rep_abc123", "rep_def456"],
  // ...existing fields...
}
```

**Security Rules:**
```javascript
match /reparaciones/{repId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null 
    && (
      !("ObsRepuestos" in request.resource.data) 
      || request.resource.data.ObsRepuestos.size() <= 2000
    )
    && (
      !("RepuestosSolicitados" in request.resource.data) 
      || request.resource.data.RepuestosSolicitados.size() <= 50
    );
}
```

---

## Migration Strategy

### Supabase

**Agregar columnas a tabla existente:**

```sql
-- Migración: Agregar columnas (ejecutar UNA VEZ)
BEGIN;

-- Agregar columnas
ALTER TABLE repair 
ADD COLUMN IF NOT EXISTS parts_notes TEXT,
ADD COLUMN IF NOT EXISTS requested_parts_ids TEXT[];

-- Agregar comentarios
COMMENT ON COLUMN repair.parts_notes IS 'Observaciones sobre qué repuestos se necesitan';
COMMENT ON COLUMN repair.requested_parts_ids IS 'IDs de repuestos solicitados';

-- Agregar constraints
ALTER TABLE repair
ADD CONSTRAINT parts_notes_length CHECK (LENGTH(parts_notes) <= 2000);

ALTER TABLE repair
ADD CONSTRAINT requested_parts_count CHECK (
  array_length(requested_parts_ids, 1) IS NULL 
  OR array_length(requested_parts_ids, 1) <= 50
);

-- Crear index GIN para búsquedas en array (opcional)
CREATE INDEX IF NOT EXISTS idx_repair_requested_parts 
ON repair USING GIN(requested_parts_ids);

COMMIT;
```

**Validación:**
```sql
-- Verificar que las columnas se crearon
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'repair' 
  AND column_name IN ('parts_notes', 'requested_parts_ids');

-- Debe retornar:
-- parts_notes | text | YES
-- requested_parts_ids | ARRAY | YES
```

**Rollback (si es necesario):**
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

### Firebase (si aplica)

**NO SE REQUIERE MIGRACIÓN en Firebase.**

Razones:
- Firestore es schema-less
- Campos opcionales se agregan automáticamente
- Compatibilidad total con datos existentes

---

## Related Specs

- `state-transitions` (uso de estos campos al cambiar estados)
- `ui-representation` (visualización de estos campos)

---

## Persistence Layer Updates

### Archivo: `src/persistencia/persistenciaSupabase/reparacionesPersistencia.js`

#### 1. Actualizar Mapeo en `getReparacionesPersistencia`

Agregar mapeo de nuevos campos de BD a frontend:

```javascript
const reparaciones = data.map(item => ({
  id: String(item.id),
  data: {
    EstadoRep: item.state,
    // ...existing fields...
    FotoAntes: item.photo_before || undefined,
    FotoDespues: item.photo_after || undefined,
    
    // ⬇️ NUEVOS CAMPOS PARA REPUESTOS
    ObsRepuestos: item.parts_notes || undefined,
    RepuestosSolicitados: item.requested_parts_ids || undefined
  }
}));
```

#### 2. Actualizar Query SELECT

Agregar nuevas columnas al SELECT:

```javascript
let query = supabase.from('repair').select(`
  id,
  created_at,
  state,
  // ...existing columns...
  photo_before,
  photo_after,
  parts_notes,
  requested_parts_ids,
  drone:drone_id (id),
  owner:owner_id (id, email, first_name, last_name, telephone)
`);
```

#### 3. Actualizar Mapeo en `guardarReparacionPersistencia`

Agregar transformación de frontend a BD:

```javascript
export const guardarReparacionPersistencia = async (reparacion) => {
  // Validar campos de repuestos ANTES de guardar
  if (reparacion.data.ObsRepuestos && reparacion.data.ObsRepuestos.length > 2000) {
    throw new Error('Las observaciones de repuestos no pueden superar los 2000 caracteres');
  }
  
  if (reparacion.data.RepuestosSolicitados && reparacion.data.RepuestosSolicitados.length > 50) {
    throw new Error('No se pueden solicitar más de 50 repuestos por reparación');
  }
  
  try {
    const reparacionData = {
      state: reparacion.data.EstadoRep,
      // ...existing fields...
      photo_before: reparacion.data.FotoAntes || null,
      photo_after: reparacion.data.FotoDespues || null,
      
      // ⬇️ NUEVOS CAMPOS PARA REPUESTOS
      parts_notes: reparacion.data.ObsRepuestos || null,
      requested_parts_ids: reparacion.data.RepuestosSolicitados || null
    };
    
    // ...resto del código de INSERT/UPDATE
  }
};
```

---

## Validation

## Validation

### Database Schema Validation (Supabase)
```sql
-- Verificar que las columnas existen
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'repair' 
  AND column_name IN ('parts_notes', 'requested_parts_ids');

-- Verificar constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'repair'
  AND constraint_name LIKE '%parts%';
```

### Type Checking
```bash
npm run build
# Debe compilar sin errores de tipo
```

### Runtime Validation
```typescript
// Ejemplo de validación en componente
const validateObsRepuestos = (obs: string | undefined): boolean => {
  if (!obs) return true; // Opcional
  return obs.length <= 2000;
};

const validateRepuestosSolicitados = (ids: string[] | undefined): boolean => {
  if (!ids) return true; // Opcional
  return ids.length <= 50 && ids.every(id => typeof id === 'string' && id.length > 0);
};
```

### Supabase Integration Test
```javascript
// Test de inserción
const testReparacion = {
  id: null,
  data: {
    EstadoRep: 'Repuestos',
    ObsRepuestos: 'Motor delantero DJI Mini 3 Pro',
    RepuestosSolicitados: ['rep_123', 'rep_456'],
    // ...otros campos requeridos
  }
};

const result = await guardarReparacionPersistencia(testReparacion);
console.log('✅ Reparación guardada:', result);

// Verificar que se guardó correctamente
const { data, error } = await supabase
  .from('repair')
  .select('parts_notes, requested_parts_ids')
  .eq('id', result.id)
  .single();

console.assert(data.parts_notes === 'Motor delantero DJI Mini 3 Pro');
console.assert(data.requested_parts_ids.length === 2);
```

