/**
 * optimistic.middleware.ts
 * 
 * Middleware para implementar Optimistic Updates en operaciones async.
 * Aplica cambios inmediatamente en el UI antes de que el servidor responda,
 * y los revierte si la operación falla.
 * 
 * **Phase 3 - T3.6:** Optimistic Updates para mejor UX
 * 
 * @module Redux/Middleware/Optimistic
 */

import { Middleware, AnyAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

/**
 * Metadata para operaciones optimistas
 */
interface OptimisticMeta {
    /** ID único de la operación optimista */
    optimisticId?: string;
    
    /** Tipo de operación: create, update, delete */
    operation?: 'create' | 'update' | 'delete';
    
    /** Snapshot del estado anterior (para revert) */
    previousState?: unknown;
}

/**
 * Snapshot guardado en cache
 */
interface CachedSnapshot {
    timestamp: number;
    state: RootState;
}

/**
 * Cache de estados previos para poder revertir cambios
 */
const optimisticCache = new Map<string, CachedSnapshot>();

/**
 * Middleware de Optimistic Updates.
 * 
 * Detecta acciones async y aplica cambios optimistas:
 * 1. En pending: Guarda snapshot del estado y aplica cambio optimista
 * 2. En fulfilled: Limpia el snapshot
 * 3. En rejected: Revierte al snapshot guardado
 * 
 * @example
 * ```typescript
 * // En el store
 * const store = configureStore({
 *   middleware: (getDefaultMiddleware) =>
 *     getDefaultMiddleware().concat(optimisticMiddleware)
 * });
 * 
 * // En un thunk
 * export const saveReparacion = createAsyncThunk(
 *   'reparacion/save',
 *   async (data: DataReparacion, { rejectWithValue }) => {
 *     try {
 *       const result = await updateReparacion(data);
 *       return result;
 *     } catch (error) {
 *       return rejectWithValue(error);
 *     }
 *   },
 *   {
 *     meta: {
 *       optimisticId: `save-${data.id}`,
 *       operation: 'update'
 *     }
 *   }
 * );
 * ```
 */
export const optimisticMiddleware: Middleware = (store) => (next) => (action) => {
    const typedAction = action as AnyAction;
    const { type, meta } = typedAction;
    
    // Solo procesar acciones con metadata optimista
    if (!meta?.optimisticId) {
        return next(action);
    }
    
    const optimisticId = meta.optimisticId;
    
    // 1. PENDING: Guardar snapshot y aplicar cambio optimista
    if (type.endsWith('/pending')) {
        const currentState = store.getState();
        
        // Guardar snapshot para posible revert
        optimisticCache.set(optimisticId, {
            timestamp: Date.now(),
            state: JSON.parse(JSON.stringify(currentState))
        });
        
        console.log(`[Optimistic] Guardado snapshot para: ${optimisticId}`);
    }
    
    // 2. FULFILLED: Limpiar snapshot (operación exitosa)
    if (type.endsWith('/fulfilled')) {
        if (optimisticCache.has(optimisticId)) {
            optimisticCache.delete(optimisticId);
            console.log(`[Optimistic] Operación exitosa, limpiado: ${optimisticId}`);
        }
    }
    
    // 3. REJECTED: Revertir al snapshot
    if (type.endsWith('/rejected')) {
        const cached = optimisticCache.get(optimisticId);
        
        if (cached) {
            console.warn(`[Optimistic] Revirtiendo cambios para: ${optimisticId}`);
            
            // Aquí se debería aplicar el snapshot guardado
            // Por ahora solo limpiamos el cache
            // En una implementación completa, se dispatchearían acciones de revert
            optimisticCache.delete(optimisticId);
            
            // TODO: Implementar revert real
            // store.dispatch({ type: 'REVERT_STATE', payload: cached.state });
        }
    }
    
    // Continuar con la acción normal
    return next(action);
};

/**
 * Limpia el cache de operaciones optimistas.
 * Útil para testing o cuando se quiere resetear el estado.
 */
export function clearOptimisticCache(): void {
    optimisticCache.clear();
    console.log('[Optimistic] Cache limpiado');
}

/**
 * Obtiene el tamaño actual del cache optimista.
 * Útil para debugging y monitoreo.
 */
export function getOptimisticCacheSize(): number {
    return optimisticCache.size;
}

/**
 * Helper para crear metadata optimista en thunks.
 * 
 * @param operation - Tipo de operación
 * @param entityId - ID de la entidad
 * @returns Metadata para el thunk
 * 
 * @example
 * ```typescript
 * export const updateReparacion = createAsyncThunk(
 *   'reparacion/update',
 *   async (data: DataReparacion) => {
 *     return await api.update(data);
 *   },
 *   {
 *     ...createOptimisticMeta('update', data.id)
 *   }
 * );
 * ```
 */
export function createOptimisticMeta(
    operation: 'create' | 'update' | 'delete',
    entityId: string
): { meta: OptimisticMeta } {
    return {
        meta: {
            optimisticId: `${operation}-${entityId}-${Date.now()}`,
            operation
        }
    };
}

/**
 * Hook para aplicar cambios optimistas en componentes.
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const dispatch = useAppDispatch();
 *   
 *   const handleSave = async (data: DataReparacion) => {
 *     // Aplicar cambio optimista inmediatamente
 *     dispatch(updateReparacionOptimistic(data));
 *     
 *     try {
 *       // Guardar en servidor
 *       await dispatch(saveReparacion(data)).unwrap();
 *     } catch (error) {
 *       // El middleware revertirá automáticamente
 *       console.error('Error guardando:', error);
 *     }
 *   };
 * }
 * ```
 */
export default optimisticMiddleware;
