import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Intervencion, Intervenciones } from '../../types/intervencion';
import { guardarIntervencionAsync, eliminarIntervencionAsync } from './intervencion.actions';

interface IntervencionState {
  coleccionIntervenciones: Intervenciones; // Cambio de array a diccionario
  selectedIntervencion: Intervencion | null;
  filter: string;
  isFetchingIntervencion: boolean;
}

const initialState: IntervencionState = {
  coleccionIntervenciones: {}, // Inicializar como objeto vacío
  selectedIntervencion: null,
  filter: '',
  isFetchingIntervencion: false
};

export const intervencionSlice = createSlice({
  name: 'intervencion',
  initialState,
  reducers: {
    setIntervenciones: (state, action: PayloadAction<Intervencion[]>) => {
      // Convertir array a diccionario
      state.coleccionIntervenciones = action.payload.reduce((acc, intervencion) => {
        acc[intervencion.id] = intervencion;
        return acc;
      }, {} as Intervenciones);
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
      // Guardar o actualizar directamente en el diccionario
      state.coleccionIntervenciones[action.payload.id] = action.payload;
    });
    builder.addCase(eliminarIntervencionAsync.fulfilled, (state, action) => {
      // Eliminar directamente del diccionario
      delete state.coleccionIntervenciones[action.payload];
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
