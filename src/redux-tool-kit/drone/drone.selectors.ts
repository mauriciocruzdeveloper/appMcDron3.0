import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Drone, Drones } from '../../types/drone';

// Tipos para los selectores
type DroneSelector = (state: RootState) => Drone | undefined;
type DroneArraySelector = (state: RootState) => Drone[];
type BooleanSelector = (state: RootState) => boolean;
type PaginacionDroneSelector = (state: RootState) => {
  items: Drone[];
  total: number;
  hasMore: boolean;
};

// ============================================================================
// SELECTORES BASE
// ============================================================================

/**
 * Selector base para obtener el diccionario completo de drones
 * Complejidad: O(1)
 * @param state - Estado global de Redux
 * @returns Diccionario de drones
 */
export const selectDronesDictionary = (state: RootState): Drones =>
  state.drone.coleccionDrones;

/**
 * Selector base para obtener el drone seleccionado
 * Complejidad: O(1)
 * @param state - Estado global de Redux
 * @returns Drone seleccionado o null
 */
export const selectSelectedDrone = (state: RootState): Drone | null =>
  state.drone.selectedDrone;

/**
 * Selector base para obtener el filtro actual
 * Complejidad: O(1)
 * @param state - Estado global de Redux
 * @returns Filtro actual
 */
export const selectDroneFilter = (state: RootState): string =>
  state.drone.filter;

/**
 * Selector base para obtener el estado de carga
 * Complejidad: O(1)
 * @param state - Estado global de Redux
 * @returns Estado de carga
 */
export const selectIsFetchingDrone = (state: RootState): boolean =>
  state.drone.isFetchingDrone;

// ============================================================================
// SELECTORES DE ACCESO POR ID
// ============================================================================

/**
 * Selector para obtener un drone específico por ID
 * Complejidad: O(1) - Acceso directo por clave
 * @param droneId - ID del drone
 * @returns Función selector que retorna el drone o undefined
 */
export const selectDroneById = (droneId: string): DroneSelector =>
  createSelector(
    [selectDronesDictionary],
    (drones): Drone | undefined => drones[droneId]
  );

/**
 * Selector para obtener múltiples drones por IDs
 * Complejidad: O(k) donde k es la cantidad de IDs
 * @param droneIds - Array de IDs de drones
 * @returns Función selector que retorna array de drones
 */
export const selectDronesByIds = (droneIds: string[]): DroneArraySelector =>
  createSelector(
    [selectDronesDictionary],
    (drones): Drone[] =>
      droneIds
        .map(id => drones[id])
        .filter((drone): drone is Drone => drone !== undefined)
  );

// ============================================================================
// SELECTORES DE TRANSFORMACIÓN
// ============================================================================

/**
 * Selector memoizado para convertir diccionario a array
 * Complejidad: O(n) solo cuando cambia la colección
 * @returns Array de todos los drones
 */
export const selectDronesArray = createSelector(
  [selectDronesDictionary],
  (drones): Drone[] => Object.values(drones)
);

/**
 * Selector memoizado para obtener todos los IDs de drones
 * Complejidad: O(n) solo cuando cambia la colección
 * @returns Array de IDs de drones
 */
export const selectDroneIds = createSelector(
  [selectDronesDictionary],
  (drones): string[] => Object.keys(drones)
);

// ============================================================================
// SELECTORES DE FILTRADO Y BÚSQUEDA
// ============================================================================

/**
 * Selector memoizado para obtener drones filtrados
 * Complejidad: O(n) solo cuando cambian los drones o el filtro
 * @returns Array de drones filtrados
 */
export const selectDronesFiltrados = createSelector(
  [selectDronesArray, selectDroneFilter],
  (drones, filtro): Drone[] => {
    if (!filtro || filtro.trim() === '') return drones;
    
    const filterLower = filtro.toLowerCase();
    return drones.filter(drone => {
      const data = drone.data;
      return (
        drone.id.toLowerCase().includes(filterLower) ||
        data.Propietario?.toLowerCase().includes(filterLower) ||
        data.Observaciones?.toLowerCase().includes(filterLower) ||
        data.ModeloDroneId?.toLowerCase().includes(filterLower)
      );
    });
  }
);

/**
 * Selector para buscar drones por término específico
 * @param searchTerm - Término de búsqueda
 * @returns Función selector que retorna drones que coinciden
 */
export const selectDronesBySearch = (searchTerm: string): DroneArraySelector =>
  createSelector(
    [selectDronesArray],
    (drones): Drone[] => {
      if (!searchTerm || searchTerm.trim() === '') return drones;
      
      const term = searchTerm.toLowerCase();
      return drones.filter(drone => {
        const data = drone.data;
        return (
          drone.id.toLowerCase().includes(term) ||
          data.Propietario?.toLowerCase().includes(term) ||
          data.Observaciones?.toLowerCase().includes(term) ||
          data.ModeloDroneId?.toLowerCase().includes(term)
        );
      });
    }
  );

// ============================================================================
// SELECTORES DE FILTRADO POR PROPIETARIO
// ============================================================================

/**
 * Selector para drones de un propietario específico
 * @param propietario - Nombre del propietario
 * @returns Función selector que retorna drones del propietario
 */
export const selectDronesByPropietario = (propietario: string): DroneArraySelector =>
  createSelector(
    [selectDronesArray],
    (drones): Drone[] =>
      drones.filter(drone => 
        drone.data.Propietario?.toLowerCase().includes(propietario.toLowerCase())
      )
  );

// ============================================================================
// SELECTORES DE FILTRADO POR MODELO
// ============================================================================

/**
 * Selector para drones de un modelo específico
 * @param modeloId - ID del modelo de drone
 * @returns Función selector que retorna drones del modelo
 */
export const selectDronesByModelo = (modeloId: string): DroneArraySelector =>
  createSelector(
    [selectDronesArray],
    (drones): Drone[] =>
      drones.filter(drone => drone.data.ModeloDroneId === modeloId)
  );

/**
 * Selector memoizado para obtener drones agrupados por modelo
 * @returns Objeto con drones agrupados por modelo
 */
export const selectDronesGroupedByModelo = createSelector(
  [selectDronesArray],
  (drones): Record<string, Drone[]> => {
    const grouped: Record<string, Drone[]> = {};
    
    drones.forEach(drone => {
      const modeloId = drone.data.ModeloDroneId;
      if (!grouped[modeloId]) {
        grouped[modeloId] = [];
      }
      grouped[modeloId].push(drone);
    });
    
    return grouped;
  }
);

// ============================================================================
// SELECTORES DE ORDENAMIENTO
// ============================================================================

/**
 * Selector memoizado para drones ordenados por propietario
 * @returns Array de drones ordenados alfabéticamente por propietario
 */
export const selectDronesOrderedByPropietario = createSelector(
  [selectDronesFiltrados],
  (drones): Drone[] =>
    [...drones].sort((a, b) => 
      (a.data.Propietario || '').localeCompare(b.data.Propietario || '')
    )
);

/**
 * Selector memoizado para drones ordenados por ID
 * @returns Array de drones ordenados por ID
 */
export const selectDronesOrderedById = createSelector(
  [selectDronesFiltrados],
  (drones): Drone[] =>
    [...drones].sort((a, b) => a.id.localeCompare(b.id))
);

/**
 * Selector para drones ordenados por campo específico
 * @param campo - Campo por el cual ordenar
 * @param ascendente - Si el orden es ascendente (true) o descendente (false)
 * @returns Función selector que retorna drones ordenados
 */
export const selectDronesOrderBy = (
  campo: keyof Drone['data'] | 'id',
  ascendente = true
): DroneArraySelector =>
  createSelector(
    [selectDronesArray],
    (drones): Drone[] =>
      [...drones].sort((a, b) => {
        let valorA: string | undefined;
        let valorB: string | undefined;
        
        if (campo === 'id') {
          valorA = a.id;
          valorB = b.id;
        } else {
          valorA = a.data[campo];
          valorB = b.data[campo];
        }
        
        // Manejo de valores undefined/null
        if (valorA == null && valorB == null) return 0;
        if (valorA == null) return ascendente ? 1 : -1;
        if (valorB == null) return ascendente ? -1 : 1;
        
        if (valorA < valorB) return ascendente ? -1 : 1;
        if (valorA > valorB) return ascendente ? 1 : -1;
        return 0;
      })
  );

// ============================================================================
// SELECTORES DE ESTADÍSTICAS
// ============================================================================

/**
 * Selector memoizado para el total de drones
 * @returns Número total de drones
 */
export const selectTotalDrones = createSelector(
  [selectDronesDictionary],
  (drones): number => Object.keys(drones).length
);

/**
 * Selector memoizado para estadísticas por modelo
 * @returns Objeto con conteo de drones por modelo
 */
export const selectEstadisticasPorModelo = createSelector(
  [selectDronesArray],
  (drones): Record<string, number> => {
    const estadisticas: Record<string, number> = {};
    
    drones.forEach(drone => {
      const modeloId = drone.data.ModeloDroneId;
      estadisticas[modeloId] = (estadisticas[modeloId] || 0) + 1;
    });
    
    return estadisticas;
  }
);

/**
 * Selector memoizado para estadísticas por propietario
 * @returns Objeto con conteo de drones por propietario
 */
export const selectEstadisticasPorPropietario = createSelector(
  [selectDronesArray],
  (drones): Record<string, number> => {
    const estadisticas: Record<string, number> = {};
    
    drones.forEach(drone => {
      const propietario = drone.data.Propietario || 'Sin propietario';
      estadisticas[propietario] = (estadisticas[propietario] || 0) + 1;
    });
    
    return estadisticas;
  }
);

// ============================================================================
// SELECTORES DE VALIDACIÓN
// ============================================================================

/**
 * Selector para verificar si existe un drone
 * @param droneId - ID del drone
 * @returns Función selector que retorna true si existe
 */
export const selectDroneExists = (droneId: string): BooleanSelector =>
  createSelector(
    [selectDronesDictionary],
    (drones): boolean => droneId in drones
  );

/**
 * Selector memoizado para verificar si hay drones cargados
 * @returns true si hay al menos un drone
 */
export const selectHasDrones = createSelector(
  [selectDronesDictionary],
  (drones): boolean => Object.keys(drones).length > 0
);

// ============================================================================
// SELECTORES PARA COMPONENTES ESPECÍFICOS
// ============================================================================

/**
 * Selector optimizado para lista de drones con paginación
 * @param page - Número de página (base 0)
 * @param pageSize - Tamaño de página
 * @returns Función selector con drones paginados
 */
export const selectDronesPaginados = (page: number, pageSize: number): PaginacionDroneSelector =>
  createSelector(
    [selectDronesOrderedByPropietario],
    (drones): {
      items: Drone[];
      total: number;
      hasMore: boolean;
    } => {
      const startIndex = page * pageSize;
      const endIndex = startIndex + pageSize;
      const items = drones.slice(startIndex, endIndex);
      
      return {
        items,
        total: drones.length,
        hasMore: endIndex < drones.length,
      };
    }
  );

/**
 * Selector para dashboard de drones
 * @returns Objeto con datos resumidos para dashboard
 */
export const selectDronesDashboard = createSelector(
  [
    selectTotalDrones,
    selectEstadisticasPorModelo,
    selectEstadisticasPorPropietario,
  ],
  (total, estadisticasPorModelo, estadisticasPorPropietario) => ({
    total,
    estadisticasPorModelo,
    estadisticasPorPropietario,
    totalModelos: Object.keys(estadisticasPorModelo).length,
    totalPropietarios: Object.keys(estadisticasPorPropietario).length,
  })
);

// ============================================================================
// SELECTORES AVANZADOS
// ============================================================================

/**
 * Selector para drones con observaciones
 * @returns Array de drones que tienen observaciones
 */
export const selectDronesConObservaciones = createSelector(
  [selectDronesArray],
  (drones): Drone[] =>
    drones.filter(drone => 
      drone.data.Observaciones && drone.data.Observaciones.trim() !== ''
    )
);

/**
 * Selector para drones sin observaciones
 * @returns Array de drones que no tienen observaciones
 */
export const selectDronesSinObservaciones = createSelector(
  [selectDronesArray],
  (drones): Drone[] =>
    drones.filter(drone => 
      !drone.data.Observaciones || drone.data.Observaciones.trim() === ''
    )
);
