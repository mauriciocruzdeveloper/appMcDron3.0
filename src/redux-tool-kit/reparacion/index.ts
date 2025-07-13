/**
 * Exportaciones centralizadas del módulo de reparaciones
 * 
 * Este archivo facilita la importación de acciones y selectores del módulo de reparaciones
 * desde otros componentes y módulos de la aplicación.
 * 
 * Ejemplo de uso:
 * ```typescript
 * import { 
 *   selectReparacionById,
 *   selectReparacionesFiltradas,
 *   setReparaciones,
 *   addReparacion 
 * } from '../redux-tool-kit/reparacion';
 * ```
 */

// Re-exportar todas las acciones del slice
export {
  setReparaciones,
  setReparacionesDictionary,
  setFilter,
  setIntervencionesDeReparacionActual,
  addReparacion,
  updateReparacion,
  removeReparacion,
} from './reparacion.slice';

// Re-exportar acciones asíncronas
export {
  guardarReparacionAsync,
  eliminarReparacionAsync,
} from './reparacion.actions';

// Re-exportar todos los selectores
export {
  // Selectores base
  selectReparacionesDictionary,
  selectReparacionFilter,
  selectIntervencionesDeReparacionActual,
  
  // Selectores de acceso por ID
  selectReparacionById,
  selectReparacionesByIds,
  
  // Selectores de transformación
  selectReparacionesArray,
  selectReparacionIds,
  
  // Selectores de filtrado y búsqueda
  selectReparacionesFiltradas,
  selectReparacionesFitradasYOrdenadas,
  selectReparacionesBySearch,
  
  // Selectores de filtrado por estado
  selectReparacionesByEstado,
  selectReparacionesEstadosPrioritarios,
  selectReparacionesPendientes,
  selectReparacionesCompletadas,
  
  // Selectores de filtrado por usuario
  selectReparacionesByUsuario,
  selectReparacionesByEmail,
  
  // Selectores de filtrado por drone
  selectReparacionesByDrone,
  selectReparacionesByNumeroSerie,
  
  // Selectores de ordenamiento
  selectReparacionesOrdenadas,
  selectReparacionesByPrioridad,
  selectReparacionesOrderBy,
  
  // Selectores de estadísticas
  selectTotalReparaciones,
  selectEstadisticasPorEstado,
  selectEstadisticasPorPrioridad,
  selectTotalPresupuestos,
  
  // Selectores de filtrado por fechas
  selectReparacionesByFechas,
  selectReparacionesMesActual,
  
  // Selectores de validación
  selectReparacionExists,
  selectHasReparaciones,
  
  // Selectores para componentes específicos
  selectReparacionesPaginadas,
  selectReparacionesDashboard,
} from './reparacion.selectors';

// Re-exportar el reducer por defecto
export { default as reparacionReducer } from './reparacion.slice';
