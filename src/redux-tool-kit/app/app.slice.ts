// features/appSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Usuario } from '../../types/usuario';
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
  coleccionMensajes: any[];
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
  coleccionMensajes: [],
  error: '',
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
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    logout: () => initialState,
    setUsuario: (state, action: PayloadAction<Usuario>) => {
      state.usuario = action.payload;
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
  setMessagesToRedux,
  isFetchingStart,
  isFetchingComplete,
} = appSlice.actions;

// Exportar el reducer por defecto
export default appSlice.reducer;
