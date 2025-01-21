// features/appSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  loginPersistencia,
  registroPersistencia,
  getReparacionesPersistencia,
  getUsuariosPersistencia,
  // ... el resto de funciones de persistencia que necesites
} from '../../persistencia/persistenciaFirebase';
import { ReparacionType } from '../../types/reparacion';
import { Unsubscribe } from 'firebase/auth';
import { AppDispatch, RootState } from '../store';
import { Usuario } from '../../types/usuario';
import { abreModal } from '../modals/modals.slice';
import { loginAsync, registroAsync } from './app.actions';

// Tipos para el estado inicial

interface LoginState {
  email: string;
  password: string;
  token: string;
}

interface AppState {
  isLoggedIn: boolean;
  isFetching: boolean;
  login: LoginState;
  coleccionReparaciones: ReparacionType[];
  coleccionMensajes: any[];
  coleccionUsuarios: Usuario[];
  provinciasSelect: any[];
  localidadesSelect: any[];
  usuariosSelect: any[];
  error: string;
  usuario: Usuario | null;
}

// Estado inicial
const initialState: AppState = {
  isLoggedIn: false,
  isFetching: false,
  login: {
    email: '',
    password: '',
    token: '',
  },
  usuario: null,
  coleccionReparaciones: [],
  coleccionMensajes: [],
  coleccionUsuarios: [],
  provinciasSelect: [],
  localidadesSelect: [],
  usuariosSelect: [],
  error: '',
};

// ---------------------------------------------------------
// createAsyncThunk
// ---------------------------------------------------------


// OBTENER REPARACIONES
export const getReparacionesAsync = () => (
  dispatch: AppDispatch,
  getState: () => RootState,
): Unsubscribe | undefined => {
  try {
    const callbackReparaciones = (reparaciones: ReparacionType[]) => {
      dispatch(setReparaciones(reparaciones));
    }
    const state = getState() as { app: AppState };
    const usuario = state.app.usuario;
    const unsubscribe = getReparacionesPersistencia(callbackReparaciones, usuario);
    return unsubscribe as Unsubscribe;
  } catch (error: any) {
    return;
  }
};

// OBTENER USUARIOS
export const getUsuariosAsync = () => (
  dispatch: AppDispatch,
  getState: () => RootState
): Unsubscribe | undefined => {
    try {
    const callbackUsuarios = (usuarios: any[]) => {
        console.log('callbackUsuarios', usuarios);
        dispatch(setUsuariosToRedux(usuarios));
      };
    const state = getState() as { app: AppState };
      const unsubscribe = getUsuariosPersistencia(callbackUsuarios);
      return unsubscribe as Unsubscribe;
  } catch (error) {
    return;
  }
};

// ---------------------------------------------------------
// SLICE PRINCIPAL
// ---------------------------------------------------------
const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    logout: () => initialState,
    setUsuario: (state, action: PayloadAction<Usuario>) => {
      state.usuario = action.payload;
    },
    setReparaciones: (state, action: PayloadAction<ReparacionType[]>) => {
      state.coleccionReparaciones = action.payload;
    },
    setUsuariosToRedux: (state, action: PayloadAction<any[]>) => {
      state.coleccionUsuarios = action.payload;
    },
    setMessagesToRedux: (state, action: PayloadAction<any[]>) => {
      state.coleccionMensajes = action.payload;
    },
    isFetchingStart: (state) => {
      state.isFetching = true;
    },
    isFetchingComplete: (state) => {
      state.isFetching = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.isFetching = true;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isFetching = false;
        state.isLoggedIn = true;
        state.usuario = action.payload;
      })
      .addCase(loginAsync.rejected, (state) => {
        state.isFetching = false;
      })
      .addCase(registroAsync.pending, (state) => {
        state.isFetching = true;
      })
      .addCase(registroAsync.fulfilled, (state) => {
        state.isFetching = false;
      })
      .addCase(registroAsync.rejected, (state) => {
        state.isFetching = false;
      });
  },
});

// Exportar acciones síncronas
export const {
  setError,
  logout,
  setUsuario,
  setReparaciones,
  setUsuariosToRedux,
  setMessagesToRedux,
  isFetchingStart,
  isFetchingComplete,
} = appSlice.actions;

// Exportar el reducer por defecto
export default appSlice.reducer;
