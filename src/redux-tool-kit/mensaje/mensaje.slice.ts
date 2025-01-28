// features/appSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Tipos para el estado inicial

export interface AppState {
  coleccionMensajes: any[];
}

// Estado inicial
const initialState: AppState = {
  coleccionMensajes: [],
};

// ---------------------------------------------------------
// SLICE PRINCIPAL
// ---------------------------------------------------------
const mensajeSlice = createSlice({
  name: 'mensaje',
  initialState,
  reducers: {
    setMessagesToRedux: (state, action: PayloadAction<any[]>) => {
      state.coleccionMensajes = action.payload;
    },
  },
});

// Exportar acciones síncronas
export const {
  setMessagesToRedux,
} = mensajeSlice.actions;

// Exportar el reducer por defecto
export default mensajeSlice.reducer;
