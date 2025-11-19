# Phase 3: Redux Integration - Propuesta Detallada

## 🎯 Objetivo

Integrar el nuevo módulo de Reparación (Phases 1 y 2) con el Redux store existente, reemplazando los datos mock por datos reales del estado global y conectando todas las acciones CRUD.

---

## 📋 Estado Actual

### ✅ Ya Existe en Redux:
- ✅ **reparacion.slice.ts** - Slice principal con reducers
- ✅ **reparacion.actions.ts** - 15+ async thunks
- ✅ **RootState y AppDispatch** - Tipos exportados
- ✅ **Persistencia** - Funciones de backend
- ✅ **Tipos** - DataReparacion, ReparacionType, Reparaciones

### 🔄 Necesita Integración:
- **ReparacionContext** - Usa datos mock actualmente
- **useReparacionData** - Hook placeholder
- **useReparacionActions** - Hook placeholder
- **Todos los tabs** - Muestran datos de ejemplo

---

## 🏗️ Arquitectura Propuesta

```
┌─────────────────────────────────────────────────┐
│           React Components (Tabs)               │
│  GeneralTab | WorkflowTab | ArchivosTab |      │
│  RepuestosTab                                   │
└────────────────┬────────────────────────────────┘
                 │ useReparacion()
┌────────────────▼────────────────────────────────┐
│         ReparacionContext Provider              │
│  • Obtiene datos de Redux                       │
│  • Proporciona callbacks de acciones            │
│  • Maneja estado local (UI, forms)             │
└────────────────┬────────────────────────────────┘
                 │ useSelector, useDispatch
┌────────────────▼────────────────────────────────┐
│            Redux Store                          │
│  • reparacion.slice (state global)             │
│  • reparacion.actions (async thunks)           │
│  • Middleware para optimistic updates          │
└────────────────┬────────────────────────────────┘
                 │ Persistencia
┌────────────────▼────────────────────────────────┐
│         Backend / Database                      │
│  • Supabase / Firebase                         │
│  • API REST                                    │
└─────────────────────────────────────────────────┘
```

---

## 📝 Tareas Detalladas

### **T3.1: Crear Custom Hooks de Redux** (2-3 horas)

#### Archivos a crear:
- `hooks/useReparacionRedux.ts` - Hook para conectar con Redux

```typescript
/**
 * Hook que conecta el Context con Redux.
 * Reemplaza datos mock por estado real.
 */
export function useReparacionRedux(reparacionId: string) {
  const dispatch = useAppDispatch();
  const selector = useAppSelector;
  
  // Selectors
  const reparacion = selector(state => 
    state.reparacion.coleccionReparaciones[reparacionId]
  );
  const intervenciones = selector(state => 
    state.reparacion.intervencionesDeReparacionActual
  );
  const isLoading = selector(state => state.app.isFetching);
  
  // Actions
  const updateReparacion = useCallback((updated: ReparacionType) => {
    dispatch(guardarReparacionAsync(updated));
  }, [dispatch]);
  
  const deleteReparacion = useCallback((id: string) => {
    dispatch(eliminarReparacionAsync(id));
  }, [dispatch]);
  
  // ... más acciones
  
  return {
    reparacion,
    intervenciones,
    isLoading,
    updateReparacion,
    deleteReparacion,
    // ...
  };
}
```

#### Subtareas:
1. Crear `useReparacionRedux.ts`
2. Implementar selectors para reparación actual
3. Implementar selectors para datos relacionados (usuario, drone, modelo)
4. Crear wrappers para dispatch de acciones async
5. Agregar memoización con useCallback
6. Exportar desde hooks/index.ts

**Duración:** 2-3 horas

---

### **T3.2: Actualizar ReparacionContext** (3-4 horas)

#### Archivos a modificar:
- `ReparacionContext.tsx` - Integrar con Redux

```typescript
// Antes (mock):
const [reparacion, setReparacion] = useState(mockData);

// Después (Redux):
const {
  reparacion,
  updateReparacion,
  deleteReparacion,
  isLoading
} = useReparacionRedux(reparacionId);
```

#### Cambios necesarios:
1. **Reemplazar estado local por Redux:**
   - Remover `useState` para reparación
   - Usar `useReparacionRedux` hook
   
2. **Conectar callbacks:**
   - `onChange` → dispatch `updateReparacion`
   - `onSave` → dispatch `guardarReparacionAsync`
   - `onDelete` → dispatch `eliminarReparacionAsync`
   - `onAdvanceState` → dispatch action de cambio de estado

3. **Manejo de loading states:**
   - Usar `isLoading` de Redux
   - Agregar `isSaving` para operaciones específicas

4. **Validaciones:**
   - Implementar validación de campos
   - Errores de backend en Context

**Duración:** 3-4 horas

---

### **T3.3: Implementar Selectors Optimizados** (2-3 horas)

#### Archivos a crear:
- `redux-tool-kit/reparacion/reparacion.selectors.ts`

```typescript
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

/**
 * Selector base para reparaciones
 */
export const selectReparaciones = (state: RootState) => 
  state.reparacion.coleccionReparaciones;

/**
 * Selector memoizado para una reparación específica
 */
export const makeSelectReparacionById = () => createSelector(
  [selectReparaciones, (state: RootState, id: string) => id],
  (reparaciones, id) => reparaciones[id]
);

/**
 * Selector para reparaciones filtradas
 */
export const selectReparacionesFiltradas = createSelector(
  [selectReparaciones, (state: RootState) => state.reparacion.filter],
  (reparaciones, filter) => {
    const array = Object.values(reparaciones);
    
    // Aplicar filtros
    let filtered = array;
    
    if (filter.search) {
      filtered = filtered.filter(r => 
        r.data.DescripcionUsuRep.toLowerCase().includes(filter.search.toLowerCase())
      );
    }
    
    if (filter.estadosPrioritarios) {
      filtered = filtered.filter(r => 
        ['Recibido', 'Revisado', 'Presupuestado', 'Aceptado'].includes(r.data.EstadoRep)
      );
    }
    
    return filtered;
  }
);

/**
 * Selector para estadísticas de reparaciones
 */
export const selectReparacionesStats = createSelector(
  [selectReparaciones],
  (reparaciones) => {
    const array = Object.values(reparaciones);
    
    return {
      total: array.length,
      porEstado: array.reduce((acc, r) => {
        acc[r.data.EstadoRep] = (acc[r.data.EstadoRep] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      pendientes: array.filter(r => 
        ['Recibido', 'Revisado', 'Presupuestado'].includes(r.data.EstadoRep)
      ).length,
    };
  }
);
```

#### Beneficios:
- ✅ Memoización automática (evita re-renders innecesarios)
- ✅ Reusabilidad de lógica de selección
- ✅ Performance optimizada
- ✅ Testing más fácil

**Duración:** 2-3 horas

---

### **T3.4: Actualizar Container Component** (2-3 horas)

#### Archivos a modificar:
- `Reparacion.container.tsx` - Conectar con Redux

```typescript
// Antes:
const mockReparacion = { ... };

// Después:
const dispatch = useAppDispatch();
const reparacion = useAppSelector(state => 
  state.reparacion.coleccionReparaciones[id]
);

useEffect(() => {
  if (id) {
    dispatch(getReparacionAsync(id));
  }
}, [id, dispatch]);
```

#### Cambios:
1. **Obtener ID de la URL:**
   ```typescript
   const { id } = useParams<{ id: string }>();
   ```

2. **Cargar reparación al montar:**
   ```typescript
   useEffect(() => {
     if (id && id !== 'nueva') {
       dispatch(getReparacionAsync(id));
     }
   }, [id]);
   ```

3. **Manejar modo "nueva reparación":**
   ```typescript
   const isNew = id === 'nueva';
   const reparacion = isNew ? createEmptyReparacion() : existingReparacion;
   ```

4. **Cargar datos relacionados:**
   ```typescript
   useEffect(() => {
     if (reparacion?.data.UsuarioRep) {
       dispatch(getUsuarioAsync(reparacion.data.UsuarioRep));
     }
     if (reparacion?.data.DroneId) {
       dispatch(getDroneAsync(reparacion.data.DroneId));
     }
   }, [reparacion]);
   ```

**Duración:** 2-3 horas

---

### **T3.5: Actualizar Tabs con Datos Reales** (4-5 horas)

#### Tabs a actualizar:

**GeneralTab:**
- Conectar campos con `reparacion.data.*`
- Validación en tiempo real
- Auto-save o guardar explícito

**WorkflowTab:**
- Cargar historial de estados desde backend
- Implementar transiciones reales
- Tracking de fechas automático

**ArchivosTab:**
- Integrar con `onUploadFile` real
- Cargar archivos desde `reparacion.data.urlsFotos`
- Upload a storage (Supabase/Firebase)

**RepuestosTab:**
- Cargar de `reparacion.data.RepuestosSolicitados`
- CRUD real conectado a backend
- Cálculo de costos real

#### Por cada tab:
1. Remover datos mock
2. Usar datos de Context (que vienen de Redux)
3. Conectar eventos con callbacks
4. Agregar loading states
5. Manejar errores

**Duración:** 4-5 horas

---

### **T3.6: Optimistic Updates** (2-3 horas)

#### Archivos a crear:
- `redux-tool-kit/middleware/optimisticUpdates.ts`

```typescript
/**
 * Middleware para actualizaciones optimistas.
 * Actualiza UI inmediatamente, revierte si falla.
 */
export const optimisticUpdatesMiddleware: Middleware = 
  (store) => (next) => (action) => {
    
  if (action.type.endsWith('/pending')) {
    // Aplicar cambio optimista
    const optimisticAction = getOptimisticAction(action);
    if (optimisticAction) {
      store.dispatch(optimisticAction);
    }
  }
  
  if (action.type.endsWith('/rejected')) {
    // Revertir cambio
    const revertAction = getRevertAction(action);
    if (revertAction) {
      store.dispatch(revertAction);
    }
  }
  
  return next(action);
};
```

#### Beneficios:
- ⚡ UI responde instantáneamente
- 🔄 Revierte automáticamente si falla
- 🎯 Mejor UX para el usuario

**Duración:** 2-3 horas

---

### **T3.7: Testing de Integración** (3-4 horas)

#### Tests a crear:
1. **Redux actions:**
   ```typescript
   describe('guardarReparacionAsync', () => {
     it('should save and update state', async () => {
       const result = await dispatch(guardarReparacionAsync(reparacion));
       expect(result.type).toBe('fulfilled');
       expect(getState().reparacion.coleccionReparaciones[id]).toBeDefined();
     });
   });
   ```

2. **Selectors:**
   ```typescript
   describe('selectReparacionesFiltradas', () => {
     it('should filter by search term', () => {
       const state = createMockState();
       const result = selectReparacionesFiltradas(state);
       expect(result).toHaveLength(2);
     });
   });
   ```

3. **Hooks:**
   ```typescript
   describe('useReparacionRedux', () => {
     it('should return reparacion from Redux', () => {
       const { result } = renderHook(() => useReparacionRedux('123'));
       expect(result.current.reparacion).toBeDefined();
     });
   });
   ```

**Duración:** 3-4 horas

---

## 📊 Resumen de Tareas

| Tarea | Archivos | Duración | Prioridad |
|-------|----------|----------|-----------|
| T3.1 - Custom Hooks Redux | 2 nuevos | 2-3h | 🔴 Alta |
| T3.2 - ReparacionContext | 1 mod | 3-4h | 🔴 Alta |
| T3.3 - Selectors | 1 nuevo | 2-3h | 🟡 Media |
| T3.4 - Container | 1 mod | 2-3h | 🔴 Alta |
| T3.5 - Tabs con datos reales | 4 mod | 4-5h | 🔴 Alta |
| T3.6 - Optimistic Updates | 1 nuevo | 2-3h | 🟢 Baja |
| T3.7 - Testing | 5-6 nuevos | 3-4h | 🟡 Media |

**Total estimado:** 18-25 horas

---

## 🎯 Estrategia de Implementación

### **Fase 1: Fundamentos** (7-10 horas)
✅ T3.1 - Custom Hooks Redux  
✅ T3.2 - ReparacionContext  
✅ T3.3 - Selectors  
✅ T3.4 - Container  

**Resultado:** Infraestructura conectada a Redux

---

### **Fase 2: Funcionalidad** (4-5 horas)
✅ T3.5 - Tabs con datos reales

**Resultado:** Módulo completamente funcional

---

### **Fase 3: Optimización** (5-7 horas)
✅ T3.6 - Optimistic Updates  
✅ T3.7 - Testing  

**Resultado:** Módulo optimizado y testeado

---

## 🚀 Beneficios Esperados

### Performance:
- ✅ **Memoización** con selectors
- ✅ **O(1) lookups** con diccionarios
- ✅ **Optimistic updates** para UX instantánea
- ✅ **Code splitting** por tabs

### Mantenibilidad:
- ✅ **Separación de concerns** (UI vs Estado)
- ✅ **Testing fácil** de lógica de negocio
- ✅ **Reutilización** de selectors y acciones
- ✅ **TypeScript estricto** en toda la cadena

### Escalabilidad:
- ✅ **Caché** de datos en Redux
- ✅ **Middleware** para cross-cutting concerns
- ✅ **Normalización** de datos relacionados
- ✅ **Lazy loading** de tabs

---

## 📋 Checklist de Completitud

### Must Have (MVP):
- [ ] T3.1 - Custom Hooks Redux
- [ ] T3.2 - ReparacionContext conectado
- [ ] T3.4 - Container con Redux
- [ ] T3.5 - GeneralTab funcional
- [ ] T3.5 - WorkflowTab funcional

### Should Have:
- [ ] T3.3 - Selectors optimizados
- [ ] T3.5 - ArchivosTab funcional
- [ ] T3.5 - RepuestosTab funcional
- [ ] T3.7 - Tests básicos

### Nice to Have:
- [ ] T3.6 - Optimistic updates
- [ ] T3.7 - Tests completos
- [ ] Documentación de flujos
- [ ] Guías de troubleshooting

---

## 🎉 Resultado Final

Al completar Phase 3, tendremos:

✅ **Módulo completamente funcional** con datos reales  
✅ **CRUD completo** conectado a backend  
✅ **Performance optimizada** con memoización  
✅ **Testing** de integración  
✅ **Documentación** completa  

**El módulo estará listo para producción.** 🚀

---

## 📝 Próximos Pasos

1. **¿Comenzamos con Phase 3?**
   - Empezar por T3.1 (Custom Hooks)
   - Implementación incremental
   - Testing continuo

2. **¿O prefieres otra cosa?**
   - Documentación adicional
   - Optimizaciones de UI
   - Otra feature

---

**¿Listo para empezar con Phase 3?** 🚀
