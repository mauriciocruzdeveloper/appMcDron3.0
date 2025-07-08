import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ModeloDrone } from '../../types/modeloDrone';
import { guardarModeloDroneAsync, eliminarModeloDroneAsync } from './modeloDrone.actions';

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
    setModeloDrone: (state, action: PayloadAction<ModeloDrone>) => {
      const index = state.coleccionModelosDrone.findIndex(modelo => modelo.id === action.payload.id);
      if (index !== -1) {
        state.coleccionModelosDrone[index] = action.payload;
      } else {
        state.coleccionModelosDrone.push(action.payload);
      }
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
  },
  extraReducers: (builder) => {
    builder.addCase(guardarModeloDroneAsync.fulfilled, (state, action) => {
      const index = state.coleccionModelosDrone.findIndex(modeloDrone => modeloDrone.id === action.payload.id);
      if (index !== -1) {
        state.coleccionModelosDrone[index] = action.payload;
      } else {
        state.coleccionModelosDrone.push(action.payload);
      }
    });
    builder.addCase(eliminarModeloDroneAsync.fulfilled, (state, action) => {
      state.coleccionModelosDrone = state.coleccionModelosDrone.filter(
        modeloDrone => modeloDrone.id !== action.payload
      );
    });
  }

});

export const {
  setModelosDrone,
  setModeloDrone,
  setSelectedModeloDrone,
  setFilter,
  setIsFetchingModeloDrone
} = modeloDroneSlice.actions;

export default modeloDroneSlice.reducer;
