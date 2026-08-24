// features/appSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ReparacionRelacionada, ReparacionType, Reparaciones } from '../../types/reparacion';
import { Filtro } from '../../types/Filtro';
import { AsignacionIntervencion } from '../../types/intervencion';
import {
  eliminarReparacionAsync,
  getReparacionesPorIntervencionAsync,
  guardarReparacionAsync,
} from './reparacion.actions';

// Tipos para el estado inicial
interface ReparacionState {
  coleccionReparaciones: Reparaciones;
  filter: Filtro;
  intervencionesDeReparacionActual: AsignacionIntervencion[]; // Asignaciones, no intervenciones
  reparacionesPorIntervencion: Record<string, {
    reparaciones: ReparacionRelacionada[];
    status: 'loading' | 'succeeded' | 'failed';
    requestId: string;
  }>;
}

// Estado inicial
const initialState: ReparacionState = {
  filter: {
    estadosPrioritarios: true,
    search: '',
    estadosReparacion: [],
  },
  coleccionReparaciones: {},
  intervencionesDeReparacionActual: [],
  reparacionesPorIntervencion: {},
};

// ---------------------------------------------------------
// SLICE PRINCIPAL
// ---------------------------------------------------------
const reparacionSlice = createSlice({
  name: 'reparacion',
  initialState,
  reducers: {
    setReparaciones: (state, action: PayloadAction<ReparacionType[]>) => {
      // Convierte array a diccionario para optimización O(1)
      state.coleccionReparaciones = action.payload.reduce((acc, reparacion) => {
        acc[reparacion.id] = reparacion;
        return acc;
      }, {} as Reparaciones);
    },
    setReparacionesDictionary: (state, action: PayloadAction<Reparaciones>) => {
      state.coleccionReparaciones = action.payload;
    },
    setFilter: (state, action: PayloadAction<Filtro>) => {
      state.filter = action.payload;
    },
    setIntervencionesDeReparacionActual: (state, action: PayloadAction<AsignacionIntervencion[]>) => {
      state.intervencionesDeReparacionActual = action.payload;
    },
    addReparacion: (state, action: PayloadAction<ReparacionType>) => {
      state.coleccionReparaciones[action.payload.id] = action.payload;
    },
    updateReparacion: (state, action: PayloadAction<ReparacionType>) => {
      if (state.coleccionReparaciones[action.payload.id]) {
        state.coleccionReparaciones[action.payload.id] = action.payload;
      }
    },
    removeReparacion: (state, action: PayloadAction<string>) => {
      delete state.coleccionReparaciones[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(guardarReparacionAsync.fulfilled, (state, action) => {
      // Acceso O(1) por ID en lugar de findIndex O(n)
      state.coleccionReparaciones[action.payload.id] = action.payload;
    });
    builder.addCase(eliminarReparacionAsync.fulfilled, (state, action) => {
      // Eliminación O(1) por ID en lugar de filter O(n)
      delete state.coleccionReparaciones[action.payload];
    });
    builder.addCase(getReparacionesPorIntervencionAsync.pending, (state, action) => {
      state.reparacionesPorIntervencion[action.meta.arg] = {
        reparaciones: [],
        status: 'loading',
        requestId: action.meta.requestId,
      };
    });
    builder.addCase(getReparacionesPorIntervencionAsync.fulfilled, (state, action) => {
      const resultadoActual = state.reparacionesPorIntervencion[action.payload.intervencionId];
      if (resultadoActual?.requestId !== action.meta.requestId) return;

      resultadoActual.reparaciones = action.payload.reparaciones;
      resultadoActual.status = 'succeeded';
    });
    builder.addCase(getReparacionesPorIntervencionAsync.rejected, (state, action) => {
      const resultadoActual = state.reparacionesPorIntervencion[action.meta.arg];
      if (resultadoActual?.requestId !== action.meta.requestId) return;

      resultadoActual.reparaciones = [];
      resultadoActual.status = 'failed';
    });
  },
});

// Exportar acciones síncronas
export const {
  setReparaciones,
  setReparacionesDictionary,
  setFilter,
  setIntervencionesDeReparacionActual,
  addReparacion,
  updateReparacion,
  removeReparacion,
} = reparacionSlice.actions;

// Exportar el reducer por defecto
export default reparacionSlice.reducer;
