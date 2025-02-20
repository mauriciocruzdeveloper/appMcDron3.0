// features/appSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ReparacionType } from '../../types/reparacion';
import { Filtro } from '../../types/Filtro';

// Tipos para el estado inicial
interface ReparacionState {
  coleccionReparaciones: ReparacionType[];
  filter: Filtro;
}

// Estado inicial
const initialState: ReparacionState = {
  filter: {
    estadosPrioritarios: true,
    search: '',
  },
  coleccionReparaciones: [],
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
  },
});

// Exportar acciones síncronas
export const {
  setReparaciones,
  setFilter,
} = reparacionSlice.actions;

// Exportar el reducer por defecto
export default reparacionSlice.reducer;
