import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ModeloDrone } from '../../types/modeloDrone';

interface ModeloDroneState {
  coleccionModelosDrone: ModeloDrone[];
  selectedModeloDrone: ModeloDrone | null;
  filter: string;
  isFetchingModeloDrone: boolean;
}

const initialState: ModeloDroneState = {
  coleccionModelosDrone: [],
  selectedModeloDrone: null,
  filter: '',
  isFetchingModeloDrone: false
};

export const modeloDroneSlice = createSlice({
  name: 'modeloDrone',
  initialState,
  reducers: {
    setModelosDrone: (state, action: PayloadAction<ModeloDrone[]>) => {
      state.coleccionModelosDrone = action.payload;
    },
    setSelectedModeloDrone: (state, action: PayloadAction<ModeloDrone | null>) => {
      state.selectedModeloDrone = action.payload;
    },
    setFilter: (state, action: PayloadAction<string>) => {
      state.filter = action.payload;
    },
    setIsFetchingModeloDrone: (state, action: PayloadAction<boolean>) => {
      state.isFetchingModeloDrone = action.payload;
    }
  }
});

export const {
  setModelosDrone,
  setSelectedModeloDrone,
  setFilter,
  setIsFetchingModeloDrone
} = modeloDroneSlice.actions;

export default modeloDroneSlice.reducer;
