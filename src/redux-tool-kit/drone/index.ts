/**
 * Exportaciones centralizadas del módulo de drones
 * 
 * Este archivo facilita la importación de acciones y selectores del módulo de drones
 * desde otros componentes y módulos de la aplicación.
 * 
 * Ejemplo de uso:
 * ```typescript
 * import { 
 *   selectDroneById,
 *   selectDronesFiltrados,
 *   setDrones,
 *   addDrone 
 * } from '../redux-tool-kit/drone';
 * ```
 */

// Re-exportar todas las acciones del slice
export {
  setDrones,
  setDronesDictionary,
  setSelectedDrone,
  setFilter,
  setIsFetchingDrone,
  addDrone,
  updateDrone,
  removeDrone,
} from './drone.slice';

// Re-exportar acciones asíncronas
export {
  guardarDroneAsync,
  eliminarDroneAsync,
  getDroneAsync,
  getDronesPorModeloDroneAsync,
  getDronesPorPropietarioAsync,
} from './drone.actions';

// Re-exportar todos los selectores
export {
  // Selectores base
  selectDronesDictionary,
  selectSelectedDrone,
  selectDroneFilter,
  selectIsFetchingDrone,
  
  // Selectores de acceso por ID
  selectDroneById,
  selectDronesByIds,
  
  // Selectores de transformación
  selectDronesArray,
  selectDroneIds,
  
  // Selectores de filtrado y búsqueda
  selectDronesFiltrados,
  selectDronesBySearch,
  
  // Selectores de filtrado por propietario
  selectDronesByPropietario,
  
  // Selectores de filtrado por modelo
  selectDronesByModelo,
  selectDronesGroupedByModelo,
  
  // Selectores de ordenamiento
  selectDronesOrderedByPropietario,
  selectDronesOrderedById,
  selectDronesOrderBy,
  
  // Selectores de estadísticas
  selectTotalDrones,
  selectEstadisticasPorModelo,
  selectEstadisticasPorPropietario,
  
  // Selectores de validación
  selectDroneExists,
  selectHasDrones,
  
  // Selectores para componentes específicos
  selectDronesPaginados,
  selectDronesDashboard,
  
  // Selectores avanzados
  selectDronesConObservaciones,
  selectDronesSinObservaciones,
} from './drone.selectors';

// Re-exportar el reducer por defecto
export { default as droneReducer } from './drone.slice';
