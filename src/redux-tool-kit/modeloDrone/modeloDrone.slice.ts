import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ModeloDrone, ModelosDrone } from '../../types/modeloDrone';
import { guardarModeloDroneAsync, eliminarModeloDroneAsync } from './modeloDrone.actions';

// Tipos para el estado inicial
interface ModeloDroneState {
  filter: string;
  coleccionModelosDrone: ModelosDrone;
  selectedModeloDrone: ModeloDrone | null;
  isFetchingModeloDrone: boolean;
}

// Estado inicial
const initialState: ModeloDroneState = {
  filter: '',
  coleccionModelosDrone: {},
  selectedModeloDrone: null,
  isFetchingModeloDrone: false
};

// ---------------------------------------------------------
// SLICE PRINCIPAL
// ---------------------------------------------------------
export const modeloDroneSlice = createSlice({
  name: 'modeloDrone',
  initialState,
  reducers: {
    setModelosDrone: (state, action: PayloadAction<ModeloDrone[]>) => {
      // Convertir el array de modelos de drone a un objeto con ID como clave
      const modelosObj: ModelosDrone = {};
      action.payload.forEach(modelo => {
        modelosObj[modelo.id] = modelo;
      });
      state.coleccionModelosDrone = modelosObj;
    },
    setModeloDrone: (state, action: PayloadAction<ModeloDrone>) => {
      // Actualizar o añadir un modelo de drone específico
      const modelo = action.payload;
      state.coleccionModelosDrone[modelo.id] = modelo;
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
      const modelo = action.payload;
      // Actualizar o añadir el modelo de drone en la colección
      state.coleccionModelosDrone[modelo.id] = modelo;
    });
    builder.addCase(eliminarModeloDroneAsync.fulfilled, (state, action) => {
      const modeloId = action.payload;
      // Eliminar el modelo de drone de la colección
      delete state.coleccionModelosDrone[modeloId];
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
