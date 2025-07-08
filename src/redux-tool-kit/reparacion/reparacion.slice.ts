// features/appSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ReparacionType } from '../../types/reparacion';
import { Filtro } from '../../types/Filtro';
import { Intervencion } from '../../types/intervencion';
import { guardarReparacionAsync, eliminarReparacionAsync } from './reparacion.actions';

// Tipos para el estado inicial
interface ReparacionState {
  coleccionReparaciones: ReparacionType[];
  filter: Filtro;
  intervencionesDeReparacionActual: Intervencion[];
}

// Estado inicial
const initialState: ReparacionState = {
  filter: {
    estadosPrioritarios: true,
    search: '',
  },
  coleccionReparaciones: [],
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
      state.coleccionReparaciones = action.payload;
    },
    setFilter: (state, action: PayloadAction<Filtro>) => {
      state.filter = action.payload;
    },
    setIntervencionesDeReparacionActual: (state, action: PayloadAction<Intervencion[]>) => {
      state.intervencionesDeReparacionActual = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(guardarReparacionAsync.fulfilled, (state, action) => {
      const index = state.coleccionReparaciones.findIndex(reparacion => reparacion.id === action.payload.id);
      if (index !== -1) {
        state.coleccionReparaciones[index] = action.payload;
      } else {
        state.coleccionReparaciones.push(action.payload);
      }
    });
    builder.addCase(eliminarReparacionAsync.fulfilled, (state, action) => {
      state.coleccionReparaciones = state.coleccionReparaciones.filter(
        reparacion => reparacion.id !== action.payload
      );
    });
  },
});

// Exportar acciones síncronas
export const {
  setReparaciones,
  setFilter,
  setIntervencionesDeReparacionActual,
} = reparacionSlice.actions;

// Exportar el reducer por defecto
export default reparacionSlice.reducer;
