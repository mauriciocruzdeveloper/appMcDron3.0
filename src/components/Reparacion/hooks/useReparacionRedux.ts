/**
 * useReparacionRedux.ts
 * 
 * Hook personalizado para integrar el módulo de Reparación con Redux.
 * Proporciona datos desde Redux y callbacks para acciones asíncronas.
 * 
 * Este hook actúa como puente entre ReparacionContext y Redux Store.
 * 
 * @module Reparacion/hooks
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../redux-tool-kit/redux.hooks';
import { ReparacionType } from '../../../types/reparacion';
import { Intervencion } from '../../../types/intervencion';
import { 
  guardarReparacionAsync,
  eliminarReparacionAsync,
  getReparacionAsync,
  getIntervencionesPorReparacionAsync,
  agregarIntervencionAReparacionAsync,
  eliminarIntervencionDeReparacionAsync
} from '../../../redux-tool-kit/reparacion/reparacion.actions';
import { 
  selectReparacionById,
  selectIntervencionesDeReparacionActual 
} from '../../../redux-tool-kit/reparacion/reparacion.selectors';
import { RootState } from '../../../redux-tool-kit/store';

/**
 * Props para el hook useReparacionRedux
 */
interface UseReparacionReduxProps {
  /** ID de la reparación a cargar */
  reparacionId?: string;
  
  /** Si se debe cargar automáticamente al montar */
  autoLoad?: boolean;
}

/**
 * Valor de retorno del hook
 */
interface UseReparacionReduxReturn {
  // Datos
  reparacion: ReparacionType | undefined;
  intervenciones: Intervencion[];
  
  // Estados
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  
  // Acciones
  loadReparacion: (id: string) => Promise<void>;
  saveReparacion: (reparacion: ReparacionType) => Promise<ReparacionType | undefined>;
  deleteReparacion: (id: string) => Promise<string | undefined>;
  loadIntervenciones: (reparacionId: string) => Promise<void>;
  addIntervencion: (reparacionId: string, intervencionId: string) => Promise<void>;
  removeIntervencion: (reparacionId: string, intervencionId: string) => Promise<void>;
}

/**
 * Hook para integrar Reparación con Redux.
 * 
 * Proporciona acceso a datos de Redux y funciones para despachar acciones.
 * Maneja loading states y errores automáticamente.
 * 
 * @param props - Configuración del hook
 * @returns Datos y acciones para la reparación
 * 
 * @example
 * ```tsx
 * function ReparacionDetail({ id }) {
 *   const {
 *     reparacion,
 *     isLoading,
 *     saveReparacion,
 *     deleteReparacion
 *   } = useReparacionRedux({ reparacionId: id, autoLoad: true });
 *   
 *   if (isLoading) return <Spinner />;
 *   if (!reparacion) return <NotFound />;
 *   
 *   return <ReparacionForm reparacion={reparacion} onSave={saveReparacion} />;
 * }
 * ```
 */
export function useReparacionRedux({
  reparacionId,
  autoLoad = false
}: UseReparacionReduxProps = {}): UseReparacionReduxReturn {
  
  const dispatch = useAppDispatch();
  
  // ============================================================================
  // SELECTORES
  // ============================================================================
  
  /**
   * Obtiene la reparación del estado de Redux
   */
  const reparacion = useAppSelector((state: RootState) => {
    if (!reparacionId) return undefined;
    return selectReparacionById(reparacionId)(state);
  });
  
  /**
   * Obtiene las intervenciones de la reparación actual
   */
  const intervenciones = useAppSelector(selectIntervencionesDeReparacionActual);
  
  /**
   * Obtiene el estado de carga global
   */
  const isLoading = useAppSelector((state: RootState) => state.app.isFetching);
  
  // ============================================================================
  // ESTADO LOCAL
  // ============================================================================
  
  /**
   * Estado de guardado específico
   * TODO: Implementar tracking de operaciones específicas
   */
  const isSaving = useMemo(() => false, []);
  
  /**
   * Error específico de esta reparación
   * TODO: Implementar manejo de errores por reparación
   */
  const error = useMemo(() => null, []);
  
  // ============================================================================
  // ACCIONES
  // ============================================================================
  
  /**
   * Carga una reparación por ID desde el backend
   */
  const loadReparacion = useCallback(async (id: string) => {
    try {
      await dispatch(getReparacionAsync(id)).unwrap();
    } catch (err) {
      console.error('Error loading reparacion:', err);
      throw err;
    }
  }, [dispatch]);
  
  /**
   * Guarda (crea o actualiza) una reparación
   */
  const saveReparacion = useCallback(async (rep: ReparacionType) => {
    try {
      const result = await dispatch(guardarReparacionAsync(rep)).unwrap();
      return result;
    } catch (err) {
      console.error('Error saving reparacion:', err);
      throw err;
    }
  }, [dispatch]);
  
  /**
   * Elimina una reparación
   */
  const deleteReparacion = useCallback(async (id: string) => {
    try {
      const result = await dispatch(eliminarReparacionAsync(id)).unwrap();
      return result;
    } catch (err) {
      console.error('Error deleting reparacion:', err);
      throw err;
    }
  }, [dispatch]);
  
  /**
   * Carga las intervenciones de una reparación
   */
  const loadIntervenciones = useCallback(async (repId: string) => {
    try {
      await dispatch(getIntervencionesPorReparacionAsync(repId)).unwrap();
    } catch (err) {
      console.error('Error loading intervenciones:', err);
      throw err;
    }
  }, [dispatch]);
  
  /**
   * Agrega una intervención a una reparación
   */
  const addIntervencion = useCallback(async (repId: string, intId: string) => {
    try {
      await dispatch(agregarIntervencionAReparacionAsync({ 
        reparacionId: repId, 
        intervencionId: intId 
      })).unwrap();
    } catch (err) {
      console.error('Error adding intervencion:', err);
      throw err;
    }
  }, [dispatch]);
  
  /**
   * Elimina una intervención de una reparación
   */
  const removeIntervencion = useCallback(async (repId: string, intId: string) => {
    try {
      await dispatch(eliminarIntervencionDeReparacionAsync({ 
        reparacionId: repId, 
        intervencionId: intId 
      })).unwrap();
    } catch (err) {
      console.error('Error removing intervencion:', err);
      throw err;
    }
  }, [dispatch]);
  
  // ============================================================================
  // EFECTOS
  // ============================================================================
  
  /**
   * Carga automática de la reparación al montar o cambiar ID
   */
  useEffect(() => {
    if (autoLoad && reparacionId && !reparacion) {
      loadReparacion(reparacionId);
    }
  }, [autoLoad, reparacionId, reparacion, loadReparacion]);
  
  // ============================================================================
  // RETORNO
  // ============================================================================
  
  return {
    // Datos
    reparacion,
    intervenciones,
    
    // Estados
    isLoading,
    isSaving,
    error,
    
    // Acciones
    loadReparacion,
    saveReparacion,
    deleteReparacion,
    loadIntervenciones,
    addIntervencion,
    removeIntervencion,
  };
}
