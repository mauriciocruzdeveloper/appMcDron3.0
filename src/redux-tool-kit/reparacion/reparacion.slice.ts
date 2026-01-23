// features/appSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ReparacionType, Reparaciones } from '../../types/reparacion';
import { Filtro } from '../../types/Filtro';
import { AsignacionIntervencion } from '../../types/intervencion';
import { guardarReparacionAsync, eliminarReparacionAsync } from './reparacion.actions';

// Tipos para el estado inicial
interface ReparacionState {
  coleccionReparaciones: Reparaciones;
  filter: Filtro;
  intervencionesDeReparacionActual: AsignacionIntervencion[]; // Asignaciones, no intervenciones
}

// Estado inicial
const initialState: ReparacionState = {
  filter: {
    estadosPrioritarios: true,
    search: '',
  },
  coleccionReparaciones: {},
  intervencionesDeReparacionActual: [],
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
