import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { ModelosDrone } from '../../types/modeloDrone';

// Selector base para el estado de modelos de drone
const selectModeloDroneState = (state: RootState) => state.modeloDrone;

// ---------------------------------------------------------
// SELECTORES BÁSICOS DE ESTADO
// ---------------------------------------------------------

// Selector para el filtro actual
export const selectModeloDroneFilter = createSelector(
  [selectModeloDroneState],
  (modeloDroneState) => modeloDroneState.filter
);

// Selector para el modelo seleccionado
export const selectSelectedModeloDrone = createSelector(
  [selectModeloDroneState],
  (modeloDroneState) => modeloDroneState.selectedModeloDrone
);

// Selector para el estado de carga
export const selectIsFetchingModeloDrone = createSelector(
  [selectModeloDroneState],
  (modeloDroneState) => modeloDroneState.isFetchingModeloDrone
);

// ---------------------------------------------------------
// SELECTORES DE COLECCIÓN
// ---------------------------------------------------------

// Selector para la colección de modelos de drone (diccionario)
export const selectColeccionModelosDrone = createSelector(
  [selectModeloDroneState],
  (modeloDroneState) => modeloDroneState.coleccionModelosDrone
);

// Selector para la colección como array
export const selectModelosDroneArray = createSelector(
  [selectColeccionModelosDrone],
  (coleccionModelosDrone: ModelosDrone) => Object.values(coleccionModelosDrone)
);

// Selector para obtener un modelo por ID
export const selectModeloDronePorId = createSelector(
  [selectColeccionModelosDrone, (state: RootState, modeloId: string) => modeloId],
  (coleccionModelosDrone, modeloId) => {
    return coleccionModelosDrone[modeloId] || null;
  }
);

// Selector para modelos ordenados por nombre
export const selectModelosDroneOrdenados = createSelector(
  [selectModelosDroneArray],
  (modelos) => 
    [...modelos].sort((a, b) => 
      a.data.NombreModelo.localeCompare(b.data.NombreModelo)
    )
);

// Selector para verificar si hay modelos cargados
export const selectTieneModelosDrone = createSelector(
  [selectModelosDroneArray],
  (modelos) => modelos.length > 0
);

// Selector para opciones de select de modelos
export const selectModelosDroneSelect = createSelector(
  [selectModelosDroneOrdenados],
  (modelos) => 
    modelos.map(modelo => ({
      value: modelo.id,
      label: modelo.data.NombreModelo
    }))
);

// Selector para buscar modelos por nombre
export const selectModelosDronePorNombre = createSelector(
  [selectModelosDroneArray, (state: RootState, busqueda: string) => busqueda],
  (modelos, busqueda) => {
    if (!busqueda) return modelos;
    
    return modelos.filter(modelo =>
      modelo.data.NombreModelo.toLowerCase().includes(busqueda.toLowerCase()) ||
      modelo.data.DescripcionModelo?.toLowerCase().includes(busqueda.toLowerCase())
    );
  }
);

// Selector para modelos filtrados por texto
export const selectModelosDroneFiltrados = createSelector(
  [selectModelosDroneArray, (state: RootState, filtro?: string) => filtro],
  (modelos, filtro) => {
    if (!filtro) return modelos;
    
    return modelos.filter(modelo =>
      modelo.data.NombreModelo.toLowerCase().includes(filtro.toLowerCase()) ||
      modelo.data.DescripcionModelo?.toLowerCase().includes(filtro.toLowerCase()) ||
      modelo.data.Fabricante?.toLowerCase().includes(filtro.toLowerCase())
    );
  }
);

// Selector para modelos filtrados por el filtro del estado
export const selectModelosDroneFiltradosPorEstado = createSelector(
  [selectModelosDroneArray, selectModeloDroneFilter],
  (modelos, filtro) => {
    if (!filtro) return modelos;
    
    return modelos.filter(modelo =>
      modelo.data.NombreModelo.toLowerCase().includes(filtro.toLowerCase()) ||
      modelo.data.DescripcionModelo?.toLowerCase().includes(filtro.toLowerCase()) ||
      modelo.data.Fabricante?.toLowerCase().includes(filtro.toLowerCase())
    );
  }
);

// ---------------------------------------------------------
// SELECTORES AVANZADOS Y UTILITARIOS
// ---------------------------------------------------------

// Selector para modelos más caros
export const selectModelosMasCaros = createSelector(
  [selectModelosDroneArray, (state: RootState, limite = 10) => limite],
  (modelos, limite) => 
    [...modelos]
      .sort((a, b) => b.data.PrecioReferencia - a.data.PrecioReferencia)
      .slice(0, limite)
);

// Selector para modelos más baratos
export const selectModelosMasBaratos = createSelector(
  [selectModelosDroneArray, (state: RootState, limite = 10) => limite],
  (modelos, limite) => 
    [...modelos]
      .filter(modelo => modelo.data.PrecioReferencia > 0)
      .sort((a, b) => a.data.PrecioReferencia - b.data.PrecioReferencia)
      .slice(0, limite)
);

// Selector para modelos profesionales (precio alto)
export const selectModelosProfesionales = createSelector(
  [selectModelosDroneArray, (state: RootState, umbralPrecio = 100000) => umbralPrecio],
  (modelos, umbralPrecio) => 
    modelos.filter(modelo => modelo.data.PrecioReferencia >= umbralPrecio)
);

// Selector para modelos económicos
export const selectModelosEconomicos = createSelector(
  [selectModelosDroneArray, (state: RootState, umbralPrecio = 50000) => umbralPrecio],
  (modelos, umbralPrecio) => 
    modelos.filter(modelo => 
      modelo.data.PrecioReferencia > 0 && modelo.data.PrecioReferencia <= umbralPrecio
    )
);

// Selector para modelos recomendados (criterios múltiples)
export const selectModelosRecomendados = createSelector(
  [
    selectModelosDroneArray,
    (state: RootState) => state.repuesto.coleccionRepuestos
  ],
  (modelos, repuestos) => {
    return modelos.filter(modelo => {
      // Criterios para recomendar:
      // 1. Precio razonable (entre 20k y 100k)
      const precioRazonable = modelo.data.PrecioReferencia >= 20000 && 
                              modelo.data.PrecioReferencia <= 100000;
      
      // 2. Tiene repuestos disponibles
      const tieneRepuestos = Object.values(repuestos).some(repuesto =>
        repuesto.data.ModelosDroneIds?.includes(modelo.id) && 
        repuesto.data.StockRepu > 0
      );
      
      return precioRazonable && tieneRepuestos;
    });
  }
);

// Selector para modelos sin repuestos disponibles
export const selectModelosSinRepuestos = createSelector(
  [
    selectModelosDroneArray,
    (state: RootState) => state.repuesto.coleccionRepuestos
  ],
  (modelos, repuestos) => {
    return modelos.filter(modelo => {
      const tieneRepuestosDisponibles = Object.values(repuestos).some(repuesto =>
        repuesto.data.ModelosDroneIds?.includes(modelo.id) && 
        repuesto.data.StockRepu > 0
      );
      
      return !tieneRepuestosDisponibles;
    });
  }
);

// Selector para modelos con descripción completa
export const selectModelosConDescripcionCompleta = createSelector(
  [selectModelosDroneArray],
  (modelos) => 
    modelos.filter(modelo => 
      modelo.data.DescripcionModelo && 
      modelo.data.DescripcionModelo.trim() !== '' &&
      modelo.data.DescripcionModelo.length > 20
    )
);

// Selector para estadísticas de modelos
export const selectEstadisticasModelosDrone = createSelector(
  [selectModelosDroneArray],
  (modelos) => {
    const total = modelos.length;
    
    // Agrupar por fabricante
    const porFabricante = modelos.reduce((acc, modelo) => {
      const fabricante = modelo.data.Fabricante || 'Sin fabricante';
      acc[fabricante] = (acc[fabricante] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calcular precio promedio
    const precioPromedio = total > 0 
      ? modelos.reduce((sum, modelo) => sum + (modelo.data.PrecioReferencia || 0), 0) / total
      : 0;

    // Encontrar el más caro y más barato
    const precios = modelos.map(m => m.data.PrecioReferencia || 0).filter(p => p > 0);
    const precioMinimo = precios.length > 0 ? Math.min(...precios) : 0;
    const precioMaximo = precios.length > 0 ? Math.max(...precios) : 0;

    return {
      total,
      porFabricante,
      fabricantesUnicos: Object.keys(porFabricante).length,
      precioPromedio,
      precioMinimo,
      precioMaximo
    };
  }
);

// Selector para modelos más populares (por número de repuestos asociados)
export const selectModelosMasPopulares = createSelector(
  [
    selectModelosDroneArray,
    (state: RootState) => state.repuesto.coleccionRepuestos,
    (state: RootState, limite = 10) => limite
  ],
  (modelos, repuestos, limite) => {
    // Contar repuestos por modelo
    const conteoRepuestos = modelos.map(modelo => {
      const cantidadRepuestos = Object.values(repuestos).filter(repuesto =>
        repuesto.data.ModelosDroneIds?.includes(modelo.id)
      ).length;

      return {
        ...modelo,
        cantidadRepuestos
      };
    });

    // Ordenar por cantidad de repuestos y tomar los primeros
    return conteoRepuestos
      .sort((a, b) => b.cantidadRepuestos - a.cantidadRepuestos)
      .slice(0, limite);
  }
);

// Selector para verificar si un modelo tiene repuestos disponibles
export const selectModeloTieneRepuestosDisponibles = createSelector(
  [
    (state: RootState, modeloId: string) => modeloId,
    (state: RootState) => state.repuesto.coleccionRepuestos
  ],
  (modeloId, repuestos) => {
    return Object.values(repuestos).some(repuesto =>
      repuesto.data.ModelosDroneIds?.includes(modeloId) && repuesto.data.StockRepu > 0
    );
  }
);

// Selector para obtener repuestos de un modelo específico
export const selectRepuestosDeModelo = createSelector(
  [
    (state: RootState, modeloId: string) => modeloId,
    (state: RootState) => state.repuesto.coleccionRepuestos
  ],
  (modeloId, repuestos) => {
    return Object.values(repuestos).filter(repuesto =>
      repuesto.data.ModelosDroneIds?.includes(modeloId)
    );
  }
);

// Selector para modelos con descripción
export const selectModelosConDescripcion = createSelector(
  [selectModelosDroneArray],
  (modelos) => 
    modelos.filter(modelo => 
      modelo.data.DescripcionModelo && modelo.data.DescripcionModelo.trim() !== ''
    )
);

// Selector para buscar modelo por nombre exacto
export const selectModeloPorNombreExacto = createSelector(
  [selectModelosDroneArray, (state: RootState, nombre: string) => nombre],
  (modelos, nombre) => 
    modelos.find(modelo => 
      modelo.data.NombreModelo.toLowerCase() === nombre.toLowerCase()
    )
);
