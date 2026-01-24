# Estado de Asignaciones de Intervención

## Implementación

Se agregó un sistema de estado para las asignaciones de intervención que permite marcar las tareas como completadas o pendientes durante el proceso de reparación.

## Cambios en Base de Datos

**Script SQL:** `sql/agregar_estado_asignacion.sql`

```sql
ALTER TABLE repair_intervention
ADD COLUMN status VARCHAR(20) DEFAULT 'pendiente' NOT NULL;
```

**Valores permitidos:**
- `pendiente` - Tarea aún no realizada (valor por defecto)
- `completada` - Tarea finalizada

## Cambios en el Código

### 1. Tipos (`src/types/intervencion.ts`)

```typescript
export enum EstadoAsignacion {
  PENDIENTE = 'pendiente',
  COMPLETADA = 'completada'
}

export interface AsignacionIntervencionData {
  // ... otros campos
  estado: EstadoAsignacion; // Estado actual de la asignación
}
```

### 2. Persistencia

**Nueva función:** `actualizarEstadoAsignacionPersistencia(asignacionId, nuevoEstado)`

Ubicación: `src/persistencia/persistenciaSupabase/reparacionesPersistencia.js`

### 3. Redux Action

**Nueva acción:** `cambiarEstadoAsignacionAsync`

Ubicación: `src/redux-tool-kit/reparacion/reparacion.actions.ts`

```typescript
dispatch(cambiarEstadoAsignacionAsync({
  asignacionId: "123",
  nuevoEstado: EstadoAsignacion.COMPLETADA
}));
```

### 4. Componente UI

**Ubicación:** `src/components/IntervencionesReparacion.component.tsx`

**Características:**
- Checkbox para cada asignación (solo visible cuando no es readOnly)
- Label que muestra "Completada" o "Pendiente"
- Tachado visual del nombre cuando está completada
- Toggle automático al hacer click

## Uso

1. **Ejecutar script SQL** en Supabase:
   ```bash
   # Ejecutar sql/agregar_estado_asignacion.sql
   ```

2. **En la UI de Reparación:**
   - Cada asignación muestra un checkbox
   - Click en el checkbox cambia el estado
   - Las tareas completadas se tachan visualmente
   - El estado se persiste en BD automáticamente

## Beneficios

✅ Tracking de progreso de reparación en tiempo real  
✅ Visual claro de qué tareas faltan por hacer  
✅ Estado persistente en base de datos  
✅ No requiere recargar la página  
✅ Compatible con modo read-only

## Migración

Todas las asignaciones existentes se marcarán automáticamente como `pendiente` al ejecutar el script SQL.
