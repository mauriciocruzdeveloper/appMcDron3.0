import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Intervenciones, Intervencion } from '../../types/intervencion';

// Selector base para el estado de intervenciones
const selectIntervencionState = (state: RootState) => state.intervencion;

// ---------------------------------------------------------
// SELECTORES BÁSICOS DE ESTADO
// ---------------------------------------------------------

// Selector para el filtro actual
export const selectIntervencionFilter = createSelector(
  [selectIntervencionState],
  (intervencionState) => intervencionState.filter
);

// Selector para la intervención seleccionada
export const selectSelectedIntervencion = createSelector(
  [selectIntervencionState],
  (intervencionState) => intervencionState.selectedIntervencion
);

// Selector para el estado de carga
export const selectIsFetchingIntervencion = createSelector(
  [selectIntervencionState],
  (intervencionState) => intervencionState.isFetchingIntervencion
);

// ---------------------------------------------------------
// SELECTORES DE COLECCIÓN
// ---------------------------------------------------------

// Selector para la colección de intervenciones (diccionario)
export const selectColeccionIntervenciones = createSelector(
  [selectIntervencionState],
  (intervencionState) => intervencionState.coleccionIntervenciones
);

// ---------------------------------------------------------
// SELECTOR CON PRECIOS CALCULADOS
// ---------------------------------------------------------

// Tipo extendido para intervenciones con precio calculado
export interface IntervencionConPrecio extends Intervencion {
  precioCalculado: number; // PrecioTotal calculado desde repuestos actuales
}

// Selector que enriquece intervenciones con precio total calculado
export const selectIntervencionesConPrecios = createSelector(
  [selectColeccionIntervenciones, (state: RootState) => state.repuesto.coleccionRepuestos],
  (intervenciones, repuestos): IntervencionConPrecio[] => {
    return Object.values(intervenciones).map(intervencion => {
      // Calcular precio de repuestos desde Redux
      const precioRepuestos = (intervencion.data.RepuestosIds || []).reduce((total, repuestoId) => {
        const repuesto = repuestos[repuestoId];
        const precio = repuesto?.data?.PrecioRepu || 0;
        return total + precio;
      }, 0);
      
      const precioCalculado = (intervencion.data.PrecioManoObra || 0) + precioRepuestos;
      
      return {
        ...intervencion,
        precioCalculado
      };
    });
  }
);

// Selector para la colección como array (mantiene compatibilidad)
export const selectIntervencionesArray = selectIntervencionesConPrecios;

// Selector para obtener una intervención por ID
export const selectIntervencionPorId = createSelector(
  [selectColeccionIntervenciones, (state: RootState, intervencionId: string) => intervencionId],
  (coleccionIntervenciones, intervencionId) => {
    return coleccionIntervenciones[intervencionId] || null;
  }
);

// Selector para intervenciones filtradas por el filtro del estado
export const selectIntervencionesFiltradasPorEstado = createSelector(
  [selectIntervencionesArray, selectIntervencionFilter],
  (intervenciones, filtro) => {
    if (!filtro) return intervenciones;
    
    return intervenciones.filter(intervencion =>
      intervencion.data.NombreInt.toLowerCase().includes(filtro.toLowerCase()) ||
      intervencion.data.DescripcionInt.toLowerCase().includes(filtro.toLowerCase())
    );
  }
);

// ---------------------------------------------------------
// SELECTORES AVANZADOS Y UTILITARIOS
// ---------------------------------------------------------

// Selector para verificar si hay intervenciones cargadas
export const selectTieneIntervenciones = createSelector(
  [selectIntervencionesArray],
  (intervenciones) => intervenciones.length > 0
);

// Selector para intervenciones ordenadas por nombre
export const selectIntervencionesOrdenadas = createSelector(
  [selectIntervencionesArray],
  (intervenciones) => 
    [...intervenciones].sort((a, b) => 
      a.data.NombreInt.localeCompare(b.data.NombreInt)
    )
);

// Selector para intervenciones ordenadas por precio
export const selectIntervencionesOrdendasPorPrecio = createSelector(
  [selectIntervencionesArray],
  (intervenciones) => 
    [...intervenciones].sort((a, b) => a.precioCalculado - b.precioCalculado)
);

// Selector para intervenciones ordenadas por duración
export const selectIntervencionesOrdenadasPorDuracion = createSelector(
  [selectIntervencionesArray],
  (intervenciones) => 
    [...intervenciones].sort((a, b) => a.data.DuracionEstimada - b.data.DuracionEstimada)
);

// Selector para opciones de select de intervenciones
export const selectIntervencionesSelectOptions = createSelector(
  [selectIntervencionesOrdenadas],
  (intervenciones) => 
    intervenciones.map(intervencion => ({
      value: intervencion.id,
      label: `${intervencion.data.NombreInt} - $${intervencion.precioCalculado}`
    }))
);

// Selector para buscar intervenciones por texto
export const selectIntervencionesPorBusqueda = createSelector(
  [selectIntervencionesArray, (state: RootState, busqueda: string) => busqueda],
  (intervenciones, busqueda) => {
    if (!busqueda) return intervenciones;
    
    return intervenciones.filter(intervencion =>
      intervencion.data.NombreInt.toLowerCase().includes(busqueda.toLowerCase()) ||
      intervencion.data.DescripcionInt.toLowerCase().includes(busqueda.toLowerCase())
    );
  }
);

// Selector para intervenciones filtradas por texto
export const selectIntervencionesFiltradas = createSelector(
  [selectIntervencionesArray, (state: RootState, filtro?: string) => filtro],
  (intervenciones, filtro) => {
    if (!filtro) return intervenciones;
    
    return intervenciones.filter(intervencion =>
      intervencion.data.NombreInt.toLowerCase().includes(filtro.toLowerCase()) ||
      intervencion.data.DescripcionInt.toLowerCase().includes(filtro.toLowerCase())
    );
  }
);

// Selector para intervenciones por modelo de drone
export const selectIntervencionesPorModeloDrone = createSelector(
  [selectIntervencionesArray, (state: RootState, modeloDroneId: string) => modeloDroneId],
  (intervenciones, modeloDroneId) => {
    if (!modeloDroneId) return intervenciones;
    
    return intervenciones.filter(intervencion => 
      intervencion.data.ModeloDroneId === modeloDroneId
    );
  }
);

// Selector para intervenciones por rango de precio
export const selectIntervencionesPorRangoPrecio = createSelector(
  [selectIntervencionesArray, (state: RootState, minPrecio: number, maxPrecio: number) => ({ minPrecio, maxPrecio })],
  (intervenciones, { minPrecio, maxPrecio }) => {
    return intervenciones.filter(intervencion => 
      intervencion.precioCalculado >= minPrecio && 
      intervencion.precioCalculado <= maxPrecio
    );
  }
);

// Selector para intervenciones por rango de duración
export const selectIntervencionesPorRangoDuracion = createSelector(
  [selectIntervencionesArray, (state: RootState, minDuracion: number, maxDuracion: number) => ({ minDuracion, maxDuracion })],
  (intervenciones, { minDuracion, maxDuracion }) => {
    return intervenciones.filter(intervencion => 
      intervencion.data.DuracionEstimada >= minDuracion && 
      intervencion.data.DuracionEstimada <= maxDuracion
    );
  }
);

// Selector para intervenciones que requieren repuestos específicos
export const selectIntervencionesPorRepuesto = createSelector(
  [selectIntervencionesArray, (state: RootState, repuestoId: string) => repuestoId],
  (intervenciones, repuestoId) => {
    if (!repuestoId) return intervenciones;
    
    return intervenciones.filter(intervencion => 
      intervencion.data.RepuestosIds.includes(repuestoId)
    );
  }
);

// Selector para intervenciones sin repuestos (solo mano de obra)
export const selectIntervencionesSoloManoObra = createSelector(
  [selectIntervencionesArray],
  (intervenciones) => 
    intervenciones.filter(intervencion => 
      intervencion.data.RepuestosIds.length === 0
    )
);

// Selector para intervenciones con repuestos
export const selectIntervencionesConRepuestos = createSelector(
  [selectIntervencionesArray],
  (intervenciones) => 
    intervenciones.filter(intervencion => 
      intervencion.data.RepuestosIds.length > 0
    )
);

// Selector para estadísticas de intervenciones
export const selectEstadisticasIntervenciones = createSelector(
  [selectIntervencionesArray],
  (intervenciones) => {
    const total = intervenciones.length;
    
    if (total === 0) {
      return {
        total: 0,
        conRepuestos: 0,
        soloManoObra: 0,
        precioPromedio: 0,
        duracionPromedio: 0,
        precioMinimo: 0,
        precioMaximo: 0,
        duracionMinima: 0,
        duracionMaxima: 0,
        porModeloDrone: {}
      };
    }

    // Calcular estadísticas
    const conRepuestos = intervenciones.filter(i => i.data.RepuestosIds.length > 0).length;
    const soloManoObra = total - conRepuestos;
    
    const precios = intervenciones.map(i => i.data.PrecioTotal);
    const duraciones = intervenciones.map(i => i.data.DuracionEstimada);
    
    const precioPromedio = precios.reduce((sum, precio) => sum + precio, 0) / total;
    const duracionPromedio = duraciones.reduce((sum, duracion) => sum + duracion, 0) / total;
    
    const precioMinimo = Math.min(...precios);
    const precioMaximo = Math.max(...precios);
    const duracionMinima = Math.min(...duraciones);
    const duracionMaxima = Math.max(...duraciones);

    // Agrupar por modelo de drone
    const porModeloDrone = intervenciones.reduce((acc, intervencion) => {
      const modeloId = intervencion.data.ModeloDroneId || 'Sin modelo';
      acc[modeloId] = (acc[modeloId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      conRepuestos,
      soloManoObra,
      precioPromedio: Math.round(precioPromedio * 100) / 100,
      duracionPromedio: Math.round(duracionPromedio),
      precioMinimo,
      precioMaximo,
      duracionMinima,
      duracionMaxima,
      porModeloDrone
    };
  }
);

// Selector para buscar intervención por nombre exacto
export const selectIntervencionPorNombreExacto = createSelector(
  [selectIntervencionesArray, (state: RootState, nombre: string) => nombre],
  (intervenciones, nombre) => 
    intervenciones.find(intervencion => 
      intervencion.data.NombreInt.toLowerCase() === nombre.toLowerCase()
    )
);

// Selector para total de todos los selectores disponibles
export const selectTotalIntervenciones = createSelector(
  [selectIntervencionesArray],
  (intervenciones) => intervenciones.length
);

// Selector para verificar si existe una intervención
export const selectExisteIntervencion = createSelector(
  [selectColeccionIntervenciones, (state: RootState, intervencionId: string) => intervencionId],
  (coleccionIntervenciones, intervencionId) => {
    return !!coleccionIntervenciones[intervencionId];
  }
);
