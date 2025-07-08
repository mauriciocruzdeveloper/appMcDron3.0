import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Intervencion } from '../../types/intervencion';
import { guardarIntervencionAsync, eliminarIntervencionAsync } from './intervencion.actions';

interface IntervencionState {
  coleccionIntervenciones: Intervencion[];
  selectedIntervencion: Intervencion | null;
  filter: string;
  isFetchingIntervencion: boolean;
}

const initialState: IntervencionState = {
  coleccionIntervenciones: [],
  selectedIntervencion: null,
  filter: '',
  isFetchingIntervencion: false
};

export const intervencionSlice = createSlice({
  name: 'intervencion',
  initialState,
  reducers: {
    setIntervenciones: (state, action: PayloadAction<Intervencion[]>) => {
      state.coleccionIntervenciones = action.payload;
    },
    setSelectedIntervencion: (state, action: PayloadAction<Intervencion | null>) => {
      state.selectedIntervencion = action.payload;
    },
    setFilter: (state, action: PayloadAction<string>) => {
      state.filter = action.payload;
    },
    setIsFetchingIntervencion: (state, action: PayloadAction<boolean>) => {
      state.isFetchingIntervencion = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(guardarIntervencionAsync.fulfilled, (state, action) => {
      const index = state.coleccionIntervenciones.findIndex(intervencion => intervencion.id === action.payload.id);
      if (index !== -1) {
        state.coleccionIntervenciones[index] = action.payload;
      } else {
        state.coleccionIntervenciones.push(action.payload);
      }
    });
    builder.addCase(eliminarIntervencionAsync.fulfilled, (state, action) => {
      state.coleccionIntervenciones = state.coleccionIntervenciones.filter(
        intervencion => intervencion.id !== action.payload
      );
    });
  }
});

export const {
  setIntervenciones,
  setSelectedIntervencion,
  setFilter,
  setIsFetchingIntervencion
} = intervencionSlice.actions;

export default intervencionSlice.reducer;
