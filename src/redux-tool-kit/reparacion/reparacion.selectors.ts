import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { ReparacionType, Reparaciones } from '../../types/reparacion';
import { Filtro } from '../../types/Filtro';
import { Intervencion } from '../../types/intervencion';
import { estados } from '../../datos/estados';

// Tipos para los selectores
type ReparacionSelector = (state: RootState) => ReparacionType | undefined;
type ReparacionArraySelector = (state: RootState) => ReparacionType[];
type BooleanSelector = (state: RootState) => boolean;
type PaginacionSelector = (state: RootState) => {
  items: ReparacionType[];
  total: number;
  hasMore: boolean;
};

// ============================================================================
// SELECTORES BASE
// ============================================================================

/**
 * Selector base para obtener el diccionario completo de reparaciones
 * Complejidad: O(1)
 * @param state - Estado global de Redux
 * @returns Diccionario de reparaciones
 */
export const selectReparacionesDictionary = (state: RootState): Reparaciones =>
  state.reparacion.coleccionReparaciones;

/**
 * Selector base para obtener el filtro actual
 * Complejidad: O(1)
 * @param state - Estado global de Redux
 * @returns Filtro actual
 */
export const selectReparacionFilter = (state: RootState): Filtro =>
  state.reparacion.filter;

/**
 * Selector base para obtener las intervenciones de la reparación actual
 * Complejidad: O(1)
 * @param state - Estado global de Redux
 * @returns Array de intervenciones de la reparación actual
 */
export const selectIntervencionesDeReparacionActual = (state: RootState): Intervencion[] =>
  state.reparacion.intervencionesDeReparacionActual;

// ============================================================================
// SELECTORES DE ACCESO POR ID
// ============================================================================

/**
 * Selector para obtener una reparación específica por ID
 * Complejidad: O(1) - Acceso directo por clave
 * @param reparacionId - ID de la reparación
 * @returns Función selector que retorna la reparación o undefined
 */
export const selectReparacionById = (reparacionId: string): ReparacionSelector =>
  createSelector(
    [selectReparacionesDictionary],
    (reparaciones): ReparacionType | undefined => reparaciones[reparacionId]
  );

/**
 * Selector para obtener múltiples reparaciones por IDs
 * Complejidad: O(k) donde k es la cantidad de IDs
 * @param reparacionIds - Array de IDs de reparaciones
 * @returns Función selector que retorna array de reparaciones
 */
export const selectReparacionesByIds = (reparacionIds: string[]): ReparacionArraySelector =>
  createSelector(
    [selectReparacionesDictionary],
    (reparaciones): ReparacionType[] =>
      reparacionIds
        .map(id => reparaciones[id])
        .filter((reparacion): reparacion is ReparacionType => reparacion !== undefined)
  );

// ============================================================================
// SELECTORES DE TRANSFORMACIÓN
// ============================================================================

/**
 * Selector memoizado para convertir diccionario a array
 * Complejidad: O(n) solo cuando cambia la colección
 * @returns Array de todas las reparaciones
 */
export const selectReparacionesArray = createSelector(
  [selectReparacionesDictionary],
  (reparaciones): ReparacionType[] => Object.values(reparaciones)
);

/**
 * Selector memoizado para obtener todos los IDs de reparaciones
 * Complejidad: O(n) solo cuando cambia la colección
 * @returns Array de IDs de reparaciones
 */
export const selectReparacionIds = createSelector(
  [selectReparacionesDictionary],
  (reparaciones): string[] => Object.keys(reparaciones)
);

// ============================================================================
// SELECTORES DE FILTRADO Y BÚSQUEDA
// ============================================================================

/**
 * Selector memoizado para obtener reparaciones filtradas
 * Complejidad: O(n) solo cuando cambian las reparaciones o el filtro
 * @returns Array de reparaciones filtradas
 */
export const selectReparacionesFiltradas = createSelector(
  [selectReparacionesArray, selectReparacionFilter],
  (reparaciones, filtro): ReparacionType[] => {
    let reparacionesFiltradas = [...reparaciones];

    // Filtro por estados prioritarios
    if (filtro.estadosPrioritarios) {
      const noPrioritarios = ["Entregado", "Liquidación", "Trabado", "Respondido"];
      reparacionesFiltradas = reparacionesFiltradas.filter(reparacion =>
        !noPrioritarios.includes(reparacion.data.EstadoRep)
      );
    }

    // Filtro por búsqueda de texto
    if (filtro.search && filtro.search.trim() !== '') {
      const searchTerm = filtro.search.toLowerCase();
      reparacionesFiltradas = reparacionesFiltradas.filter(reparacion => {
        const data = reparacion.data;
        return (
          data.ModeloDroneNameRep?.toLowerCase().includes(searchTerm) ||
          data.NombreUsu?.toLowerCase().includes(searchTerm) ||
          data.ApellidoUsu?.toLowerCase().includes(searchTerm) ||
          data.EmailUsu?.toLowerCase().includes(searchTerm) ||
          data.NumeroSerieRep?.toLowerCase().includes(searchTerm) ||
          data.DescripcionUsuRep?.toLowerCase().includes(searchTerm) ||
          data.DiagnosticoRep?.toLowerCase().includes(searchTerm) ||
          data.EstadoRep?.toLowerCase().includes(searchTerm)
        );
      });
    }

    return reparacionesFiltradas;
  }
);

/**
 * Selector memoizado para reparaciones filtradas y ordenadas por prioridad de estado
 * Combina filtrado y ordenamiento en una sola operación memoizada
 * Complejidad: O(n log n) solo cuando cambian las reparaciones, filtro o estados
 * @returns Array de reparaciones filtradas y ordenadas por prioridad de estado
 */
export const selectReparacionesFitradasYOrdenadas = createSelector(
  [selectReparacionesFiltradas],
  (reparacionesFiltradas): ReparacionType[] => {
    return [...reparacionesFiltradas].sort((a, b) => {
      const prioridadA = estados[a.data.EstadoRep]?.prioridad || 999;
      const prioridadB = estados[b.data.EstadoRep]?.prioridad || 999;
      return prioridadA - prioridadB;
    });
  }
);

/**
 * Selector para buscar reparaciones por término específico
 * @param searchTerm - Término de búsqueda
 * @returns Función selector que retorna reparaciones que coinciden
 */
export const selectReparacionesBySearch = (searchTerm: string): ReparacionArraySelector =>
  createSelector(
    [selectReparacionesArray],
    (reparaciones): ReparacionType[] => {
      if (!searchTerm || searchTerm.trim() === '') return reparaciones;
      
      const term = searchTerm.toLowerCase();
      return reparaciones.filter(reparacion => {
        const data = reparacion.data;
        return (
          data.ModeloDroneNameRep?.toLowerCase().includes(term) ||
          data.NombreUsu?.toLowerCase().includes(term) ||
          data.ApellidoUsu?.toLowerCase().includes(term) ||
          data.EmailUsu?.toLowerCase().includes(term) ||
          data.NumeroSerieRep?.toLowerCase().includes(term) ||
          data.DescripcionUsuRep?.toLowerCase().includes(term) ||
          data.DiagnosticoRep?.toLowerCase().includes(term) ||
          data.EstadoRep?.toLowerCase().includes(term)
        );
      });
    }
  );

// ============================================================================
// SELECTORES DE FILTRADO POR ESTADO
// ============================================================================

/**
 * Selector para reparaciones por estado específico
 * @param estado - Estado de la reparación
 * @returns Función selector que retorna reparaciones con el estado especificado
 */
export const selectReparacionesByEstado = (estado: string): ReparacionArraySelector =>
  createSelector(
    [selectReparacionesArray],
    (reparaciones): ReparacionType[] =>
      reparaciones.filter(reparacion => reparacion.data.EstadoRep === estado)
  );

/**
 * Selector memoizado para reparaciones por estados prioritarios
 * @returns Array de reparaciones con estados prioritarios
 */
export const selectReparacionesEstadosPrioritarios = createSelector(
  [selectReparacionesArray],
  (reparaciones): ReparacionType[] => {
    const noPrioritarios = ["Entregado", "Liquidación", "Trabado", "Respondido"];
    return reparaciones.filter(reparacion =>
      !noPrioritarios.includes(reparacion.data.EstadoRep)
    );
  }
);

/**
 * Selector memoizado para reparaciones que requieren acción inmediata
 * @returns Array de reparaciones en estados Recibido, Revisado o Reparar
 */
export const selectReparacionesAccionInmediata = createSelector(
  [selectReparacionesArray],
  (reparaciones): ReparacionType[] => {
    const estadosAccion = ["Recibido", "Revisado", "Reparar"];
    return reparaciones
      .filter(reparacion => estadosAccion.includes(reparacion.data.EstadoRep))
      .sort((a, b) => {
        const prioridadA = estados[a.data.EstadoRep]?.prioridad || 999;
        const prioridadB = estados[b.data.EstadoRep]?.prioridad || 999;
        return prioridadA - prioridadB;
      });
  }
);

/**
 * Selector para obtener el nombre del modelo de drone de una reparación
 * @param reparacionId - ID de la reparación
 * @returns Función selector que retorna el nombre del modelo o null
 */
export const selectModeloNombreByReparacionId = (reparacionId: string) =>
  createSelector(
    [
      (state: RootState) => selectReparacionById(reparacionId)(state),
      (state: RootState) => state.drone.coleccionDrones,
      (state: RootState) => state.modeloDrone.coleccionModelosDrone
    ],
    (reparacion, drones, modelos) => {
      if (!reparacion?.data.DroneId) return null;
      
      const drone = drones[reparacion.data.DroneId];
      if (!drone?.data.ModeloDroneId) return null;
      
      const modelo = modelos[drone.data.ModeloDroneId];
      return modelo?.data.NombreModelo || null;
    }
  );

/**
 * Selector memoizado para reparaciones pendientes
 * @returns Array de reparaciones pendientes
 */
export const selectReparacionesPendientes = createSelector(
  [selectReparacionesArray],
  (reparaciones): ReparacionType[] =>
    reparaciones.filter(reparacion =>
      !['Entregado', 'Cancelado'].includes(reparacion.data.EstadoRep)
    )
);

/**
 * Selector memoizado para reparaciones completadas
 * @returns Array de reparaciones completadas
 */
export const selectReparacionesCompletadas = createSelector(
  [selectReparacionesArray],
  (reparaciones): ReparacionType[] =>
    reparaciones.filter(reparacion =>
      ['Entregado', 'Reparado'].includes(reparacion.data.EstadoRep)
    )
);

// ============================================================================
// SELECTORES DE FILTRADO POR USUARIO
// ============================================================================

/**
 * Selector para reparaciones de un usuario específico
 * @param usuarioId - ID del usuario
 * @returns Función selector que retorna reparaciones del usuario
 */
export const selectReparacionesByUsuario = (usuarioId: string): ReparacionArraySelector =>
  createSelector(
    [selectReparacionesArray],
    (reparaciones): ReparacionType[] =>
      reparaciones.filter(reparacion => reparacion.data.UsuarioRep === usuarioId)
  );

/**
 * Selector para reparaciones por email de usuario
 * @param email - Email del usuario
 * @returns Función selector que retorna reparaciones del usuario
 */
export const selectReparacionesByEmail = (email: string): ReparacionArraySelector =>
  createSelector(
    [selectReparacionesArray],
    (reparaciones): ReparacionType[] =>
      reparaciones.filter(reparacion => reparacion.data.EmailUsu === email)
  );

// ============================================================================
// SELECTORES DE FILTRADO POR DRONE
// ============================================================================

/**
 * Selector para reparaciones de un drone específico
 * @param droneId - ID del drone
 * @returns Función selector que retorna reparaciones del drone
 */
export const selectReparacionesByDrone = (droneId: string): ReparacionArraySelector =>
  createSelector(
    [selectReparacionesArray],
    (reparaciones): ReparacionType[] =>
      reparaciones.filter(reparacion => reparacion.data.DroneId === droneId)
  );

/**
 * Selector para reparaciones por número de serie
 * @param numeroSerie - Número de serie del drone
 * @returns Función selector que retorna reparaciones del drone
 */
export const selectReparacionesByNumeroSerie = (numeroSerie: string): ReparacionArraySelector =>
  createSelector(
    [selectReparacionesArray],
    (reparaciones): ReparacionType[] =>
      reparaciones.filter(reparacion => reparacion.data.NumeroSerieRep === numeroSerie)
  );

// ============================================================================
// SELECTORES DE ORDENAMIENTO
// ============================================================================

/**
 * Selector memoizado para reparaciones ordenadas por fecha de creación (más recientes primero)
 * @returns Array de reparaciones ordenadas
 */
export const selectReparacionesOrdenadas = createSelector(
  [selectReparacionesFiltradas],
  (reparaciones): ReparacionType[] =>
    [...reparaciones].sort((a, b) => b.data.FeConRep as number - (a.data.FeConRep as number))
);

/**
 * Selector memoizado para reparaciones ordenadas por prioridad
 * @returns Array de reparaciones ordenadas por prioridad
 */
export const selectReparacionesByPrioridad = createSelector(
  [selectReparacionesArray],
  (reparaciones): ReparacionType[] =>
    [...reparaciones].sort((a, b) => b.data.PrioridadRep as number - (a.data.PrioridadRep as number))
);

/**
 * Selector para reparaciones ordenadas por campo específico
 * @param campo - Campo por el cual ordenar
 * @param ascendente - Si el orden es ascendente (true) o descendente (false)
 * @returns Función selector que retorna reparaciones ordenadas
 */
export const selectReparacionesOrderBy = (
  campo: keyof ReparacionType['data'],
  ascendente = true
): ReparacionArraySelector =>
  createSelector(
    [selectReparacionesArray],
    (reparaciones): ReparacionType[] =>
      [...reparaciones].sort((a, b) => {
        const valorA = a.data[campo];
        const valorB = b.data[campo];
        
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
 * Selector memoizado para el total de reparaciones
 * @returns Número total de reparaciones
 */
export const selectTotalReparaciones = createSelector(
  [selectReparacionesDictionary],
  (reparaciones): number => Object.keys(reparaciones).length
);

/**
 * Selector memoizado para estadísticas por estado
 * @returns Objeto con conteo de reparaciones por estado
 */
export const selectEstadisticasPorEstado = createSelector(
  [selectReparacionesArray],
  (reparaciones): Record<string, number> => {
    const estadisticas: Record<string, number> = {};
    
    reparaciones.forEach(reparacion => {
      const estado = reparacion.data.EstadoRep;
      estadisticas[estado] = (estadisticas[estado] || 0) + 1;
    });
    
    return estadisticas;
  }
);

/**
 * Selector memoizado para estadísticas de prioridad
 * @returns Objeto con conteo de reparaciones por nivel de prioridad
 */
export const selectEstadisticasPorPrioridad = createSelector(
  [selectReparacionesArray],
  (reparaciones): Record<number, number> => {
    const estadisticas: Record<number, number> = {};
    
    reparaciones.forEach(reparacion => {
      const prioridad = reparacion.data.PrioridadRep;
      estadisticas[prioridad as number] = (estadisticas[prioridad as number] || 0) + 1;
    });
    
    return estadisticas;
  }
);

/**
 * Selector memoizado para total de presupuestos
 * @returns Suma total de todos los presupuestos finales
 */
export const selectTotalPresupuestos = createSelector(
  [selectReparacionesArray],
  (reparaciones): number =>
    reparaciones.reduce((total, reparacion) => total + (reparacion.data.PresuFiRep || 0), 0)
);

// ============================================================================
// SELECTORES DE FILTRADO POR FECHAS
// ============================================================================

/**
 * Selector para reparaciones en rango de fechas
 * @param fechaInicio - Fecha de inicio (timestamp)
 * @param fechaFin - Fecha de fin (timestamp)
 * @returns Función selector que retorna reparaciones en el rango
 */
export const selectReparacionesByFechas = (fechaInicio: number, fechaFin: number): ReparacionArraySelector =>
  createSelector(
    [selectReparacionesArray],
    (reparaciones): ReparacionType[] =>
      reparaciones.filter(reparacion => {
        const fecha = reparacion.data.FeConRep;
        return fecha as number >= fechaInicio && fecha as number <= fechaFin;
      })
  );

/**
 * Selector memoizado para reparaciones del mes actual
 * @returns Array de reparaciones del mes actual
 */
export const selectReparacionesMesActual = createSelector(
  [selectReparacionesArray],
  (reparaciones): ReparacionType[] => {
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).getTime();
    const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59).getTime();
    
    return reparaciones.filter(reparacion => {
      const fecha = reparacion.data.FeConRep;
      return fecha as number >= inicioMes && fecha as number <= finMes;
    });
  }
);

// ============================================================================
// SELECTORES DE VALIDACIÓN
// ============================================================================

/**
 * Selector para verificar si existe una reparación
 * @param reparacionId - ID de la reparación
 * @returns Función selector que retorna true si existe
 */
export const selectReparacionExists = (reparacionId: string): BooleanSelector =>
  createSelector(
    [selectReparacionesDictionary],
    (reparaciones): boolean => reparacionId in reparaciones
  );

/**
 * Selector memoizado para verificar si hay reparaciones cargadas
 * @returns true si hay al menos una reparación
 */
export const selectHasReparaciones = createSelector(
  [selectReparacionesDictionary],
  (reparaciones): boolean => Object.keys(reparaciones).length > 0
);

// ============================================================================
// SELECTORES PARA COMPONENTES ESPECÍFICOS
// ============================================================================

/**
 * Selector optimizado para lista de reparaciones con paginación
 * @param page - Número de página (base 0)
 * @param pageSize - Tamaño de página
 * @returns Función selector con reparaciones paginadas
 */
export const selectReparacionesPaginadas = (page: number, pageSize: number): PaginacionSelector =>
  createSelector(
    [selectReparacionesOrdenadas],
    (reparaciones): {
      items: ReparacionType[];
      total: number;
      hasMore: boolean;
    } => {
      const startIndex = page * pageSize;
      const endIndex = startIndex + pageSize;
      const items = reparaciones.slice(startIndex, endIndex);
      
      return {
        items,
        total: reparaciones.length,
        hasMore: endIndex < reparaciones.length,
      };
    }
  );

/**
 * Selector para dashboard de reparaciones
 * @returns Objeto con datos resumidos para dashboard
 */
export const selectReparacionesDashboard = createSelector(
  [
    selectTotalReparaciones,
    selectReparacionesPendientes,
    selectReparacionesCompletadas,
    selectEstadisticasPorEstado,
    selectTotalPresupuestos,
  ],
  (total, pendientes, completadas, estadisticasPorEstado, totalPresupuestos) => ({
    total,
    pendientes: pendientes.length,
    completadas: completadas.length,
    estadisticasPorEstado,
    totalPresupuestos,
    porcentajeCompletadas: total > 0 ? Math.round((completadas.length / total) * 100) : 0,
  })
);
