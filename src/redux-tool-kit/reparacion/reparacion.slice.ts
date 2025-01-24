// features/appSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  getReparacionesPersistencia,
  // ... el resto de funciones de persistencia que necesites
} from '../../persistencia/persistenciaFirebase';
import { ReparacionType } from '../../types/reparacion';
import { Unsubscribe } from 'firebase/auth';
import { AppDispatch, RootState } from '../store';
import { AppState } from '../../redux-DEPRECATED/App/App.reducer';
import { guardarReparacionAsync } from './reparacion.actions';

// Tipos para el estado inicial
interface ReparacionState {
  coleccionReparaciones: ReparacionType[];
}

// Estado inicial
const initialState: ReparacionState = {
  coleccionReparaciones: [],
};

// ---------------------------------------------------------
// createAsyncThunk
// ---------------------------------------------------------

// ---------------------------------------------------------
// SLICE PRINCIPAL
// ---------------------------------------------------------
const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setReparaciones: (state, action: PayloadAction<ReparacionType[]>) => {
      state.coleccionReparaciones = action.payload;
    },
  },
});

// Exportar acciones síncronas
export const {
  setReparaciones,
} = appSlice.actions;

// Exportar el reducer por defecto
export default appSlice.reducer;
