import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Intervencion } from '../../types/intervencion';

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
  }
});

export const {
  setIntervenciones,
  setSelectedIntervencion,
  setFilter,
  setIsFetchingIntervencion
} = intervencionSlice.actions;

export default intervencionSlice.reducer;
