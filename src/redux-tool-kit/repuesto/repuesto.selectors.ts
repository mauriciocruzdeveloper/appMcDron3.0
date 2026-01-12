import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Selector base para el estado de repuestos
const selectRepuestoState = (state: RootState) => state.repuesto;

// Selector para la colección de repuestos (objeto)
export const selectColeccionRepuestos = createSelector(
  [selectRepuestoState],
  (repuestoState) => repuestoState.coleccionRepuestos
);

// Selector para convertir la colección a array
export const selectRepuestosArray = createSelector(
  [selectColeccionRepuestos],
  (coleccionRepuestos) => Object.values(coleccionRepuestos)
);

// Selector para el filtro actual
export const selectRepuestoFilter = createSelector(
  [selectRepuestoState],
  (repuestoState) => repuestoState.filter
);

// Selector para los modelos de drone select
export const selectModelosDroneSelect = createSelector(
  [selectRepuestoState],
  (repuestoState) => repuestoState.modelosDroneSelect
);

// Selector para los proveedores select
export const selectProveedoresSelect = createSelector(
  [selectRepuestoState],
  (repuestoState) => repuestoState.proveedoresSelect
);

// Selector para obtener un repuesto por ID
export const selectRepuestoPorId = createSelector(
  [selectColeccionRepuestos, (state: RootState, repuestoId: string) => repuestoId],
  (coleccionRepuestos, repuestoId) => coleccionRepuestos[repuestoId]
);

// Selector para repuestos filtrados por texto
export const selectRepuestosFiltradosPorTexto = createSelector(
  [selectRepuestosArray, selectRepuestoFilter],
  (repuestos, filter) => {
    if (!filter) return repuestos;
    
    return repuestos.filter(repuesto => 
      repuesto.data?.NombreRepu?.toLowerCase().includes(filter.toLowerCase()) ||
      repuesto.data?.ProveedorRepu?.toLowerCase().includes(filter.toLowerCase())
    );
  }
);

// Selector para repuestos filtrados por modelo de drone
export const selectRepuestosPorModeloDrone = createSelector(
  [selectRepuestosArray, (state: RootState, modeloId: string) => modeloId],
  (repuestos, modeloId) => {
    if (!modeloId) return repuestos;
    
    return repuestos.filter(repuesto => 
      repuesto.data.ModelosDroneIds?.includes(modeloId) || false
    );
  }
);

// Función para calcular el estado del repuesto
const calcularEstadoRepuesto = (stock: number, unidadesPedidas: number): string => {
  if (stock > 0) return 'Disponible';
  return unidadesPedidas > 0 ? 'En Pedido' : 'Agotado';
};

// Selector combinado para repuestos filtrados (texto + modelo + estado)
export const selectRepuestosFiltrados = createSelector(
  [
    selectRepuestosArray, 
    selectRepuestoFilter,
    (state: RootState, filtroModeloDrone?: string, filtroEstado?: string) => ({ filtroModeloDrone, filtroEstado })
  ],
  (repuestos, textFilter, { filtroModeloDrone, filtroEstado }) => {
    return repuestos.filter(repuesto => {
      let incluirPorTexto = true;
      let incluirPorModelo = true;
      let incluirPorEstado = true;
      
      // Filtro por texto
      if (textFilter) {
        incluirPorTexto =
          repuesto.data?.NombreRepu?.toLowerCase().includes(textFilter.toLowerCase()) ||
          repuesto.data?.ProveedorRepu?.toLowerCase().includes(textFilter.toLowerCase());
      }
      
      // Filtro por modelo de drone
      if (filtroModeloDrone) {
        incluirPorModelo = repuesto.data.ModelosDroneIds?.includes(filtroModeloDrone) || false;
      }
      
      // Filtro por estado
      if (filtroEstado) {
        const estado = calcularEstadoRepuesto(repuesto.data.StockRepu, repuesto.data.UnidadesPedidas || 0);
        incluirPorEstado = estado === filtroEstado;
      }
      
      return incluirPorTexto && incluirPorModelo && incluirPorEstado;
    });
  }
);

// Selector para repuestos con stock disponible
export const selectRepuestosDisponibles = createSelector(
  [selectRepuestosArray],
  (repuestos) => repuestos.filter(repuesto => repuesto.data.StockRepu > 0)
);

// Selector para repuestos agotados
export const selectRepuestosAgotados = createSelector(
  [selectRepuestosArray],
  (repuestos) => repuestos.filter(repuesto => 
    repuesto.data.StockRepu === 0 && (repuesto.data.UnidadesPedidas || 0) === 0
  )
);

// Selector para repuestos en pedido
export const selectRepuestosEnPedido = createSelector(
  [selectRepuestosArray],
  (repuestos) => repuestos.filter(repuesto => 
    repuesto.data.StockRepu === 0 && (repuesto.data.UnidadesPedidas || 0) > 0
  )
);

// Selector para estadísticas de repuestos
export const selectEstadisticasRepuestos = createSelector(
  [selectRepuestosArray],
  (repuestos) => {
    const total = repuestos.length;
    const disponibles = repuestos.filter(r => r.data.StockRepu > 0).length;
    const agotados = repuestos.filter(r => 
      r.data.StockRepu === 0 && (r.data.UnidadesPedidas || 0) === 0
    ).length;
    const enPedido = repuestos.filter(r => 
      r.data.StockRepu === 0 && (r.data.UnidadesPedidas || 0) > 0
    ).length;
    
    return {
      total,
      disponibles,
      agotados,
      enPedido,
      porcentajeDisponibles: total > 0 ? (disponibles / total) * 100 : 0
    };
  }
);

// Selector para obtener proveedores únicos
export const selectProveedoresUnicos = createSelector(
  [selectRepuestosArray],
  (repuestos) => {
    const proveedores = new Set(
      repuestos
        .map(repuesto => repuesto.data.ProveedorRepu)
        .filter(proveedor => proveedor && proveedor.trim() !== '')
    );
    
    return Array.from(proveedores).sort();
  }
);

// Selector para verificar si hay repuestos cargados
export const selectTieneRepuestos = createSelector(
  [selectRepuestosArray],
  (repuestos) => repuestos.length > 0
);

// Selectores específicos para casos de uso comunes

// Selector para buscar repuestos por nombre exacto
export const selectRepuestoPorNombre = createSelector(
  [selectRepuestosArray, (state: RootState, nombre: string) => nombre],
  (repuestos, nombre) => 
    repuestos.find(repuesto => 
      repuesto.data.NombreRepu.toLowerCase() === nombre.toLowerCase()
    )
);

// Selector para repuestos de un proveedor específico
export const selectRepuestosPorProveedor = createSelector(
  [selectRepuestosArray, (state: RootState, proveedor: string) => proveedor],
  (repuestos, proveedor) => 
    repuestos.filter(repuesto => 
      repuesto.data.ProveedorRepu?.toLowerCase() === proveedor.toLowerCase()
    )
);

// Selector para repuestos con stock bajo (menos de un umbral)
export const selectRepuestosStockBajo = createSelector(
  [selectRepuestosArray, (state: RootState, umbral = 5) => umbral],
  (repuestos, umbral) => 
    repuestos.filter(repuesto => 
      repuesto.data.StockRepu > 0 && repuesto.data.StockRepu <= umbral
    )
);

// Selector para contar el uso de cada repuesto en las intervenciones de las reparaciones
export const selectConteoUsoRepuestos = createSelector(
  [
    (state: RootState) => state.intervencion.coleccionIntervenciones,
  ],
  (intervenciones) => {
    const conteoUso: { [repuestoId: string]: number } = {};
    
    // Iterar sobre todas las intervenciones y contar los repuestos usados
    Object.values(intervenciones).forEach((intervencion) => {
      if (intervencion && intervencion.data.RepuestosIds) {
        intervencion.data.RepuestosIds.forEach((repuestoId) => {
          conteoUso[repuestoId] = (conteoUso[repuestoId] || 0) + 1;
        });
      }
    });
    
    return conteoUso;
  }
);

// Selector para repuestos agotados (stock = 0) ordenados por cantidad de uso
export const selectRepuestosFaltantes = createSelector(
  [selectRepuestosArray, selectConteoUsoRepuestos],
  (repuestos, conteoUso) => {
    const repuestosFaltantes = repuestos.filter(repuesto => 
      repuesto.data.StockRepu === 0 && (repuesto.data.UnidadesPedidas || 0) === 0 // Solo repuestos agotados (sin stock ni pedidos)
    );
    
    // Ordenar por cantidad de uso (de mayor a menor)
    return repuestosFaltantes
      .map(repuesto => ({
        ...repuesto,
        vecesUsado: conteoUso[repuesto.id] || 0
      }))
      .sort((a, b) => b.vecesUsado - a.vecesUsado);
  }
);

// Selector para repuestos en pedido ordenados por cantidad de uso
export const selectRepuestosPedidos = createSelector(
  [selectRepuestosArray, selectConteoUsoRepuestos],
  (repuestos, conteoUso) => {
    const repuestosPedidos = repuestos.filter(repuesto => 
      (repuesto.data.UnidadesPedidas || 0) > 0 // Repuestos con unidades pedidas
    );
    
    // Ordenar por cantidad de uso (de mayor a menor)
    return repuestosPedidos
      .map(repuesto => ({
        ...repuesto,
        vecesUsado: conteoUso[repuesto.id] || 0
      }))
      .sort((a, b) => b.vecesUsado - a.vecesUsado);
  }
);

// Selector para el valor total del inventario
export const selectValorTotalInventario = createSelector(
  [selectRepuestosArray],
  (repuestos) => 
    repuestos.reduce((total, repuesto) => 
      total + (repuesto.data.StockRepu * repuesto.data.PrecioRepu), 0
    )
);

// Selector para repuestos más caros
export const selectRepuestosMasCaros = createSelector(
  [selectRepuestosArray, (state: RootState, limite = 10) => limite],
  (repuestos, limite) => 
    [...repuestos]
      .sort((a, b) => b.data.PrecioRepu - a.data.PrecioRepu)
      .slice(0, limite)
);

// Selector para verificar si un modelo de drone tiene repuestos disponibles
export const selectModeloTieneRepuestos = createSelector(
  [selectRepuestosArray, (state: RootState, modeloId: string) => modeloId],
  (repuestos, modeloId) => 
    repuestos.some(repuesto => 
      repuesto.data.ModelosDroneIds?.includes(modeloId) && repuesto.data.StockRepu > 0
    )
);

// Selector para obtener nombres de modelos de drone de un repuesto
export const selectModelosNombresByRepuestoId = (repuestoId: string) =>
  createSelector(
    [
      (state: RootState) => selectRepuestoPorId(state, repuestoId),
      (state: RootState) => state.modeloDrone.coleccionModelosDrone
    ],
    (repuesto, modelos) => {
      if (!repuesto?.data.ModelosDroneIds) return [];
      
      return repuesto.data.ModelosDroneIds
        .map(modeloId => modelos[modeloId]?.data.NombreModelo)
        .filter(nombre => nombre !== undefined);
    }
  );
