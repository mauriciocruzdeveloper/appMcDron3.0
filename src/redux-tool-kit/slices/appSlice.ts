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

// Tipos para el estado inicial
interface ModalState {
  showModal: boolean;
  mensajeModal: string;
  tituloModal: string;
  tipoModal: string;
}

interface ConfirmState {
  showConfirm: boolean;
  mensajeConfirm: string;
  tituloConfirm: string;
  tipoConfirm: string;
  callBackConfirm: (() => void) | null;
}

interface LoginState {
  email: string;
  password: string;
  token: string;
}

interface AppState {
  isLoggedIn: boolean;
  isFetching: boolean;
  modal: ModalState;
  confirm: ConfirmState;
  login: LoginState;
  usuario: Record<string, any>;
  coleccionReparaciones: ReparacionType[];
  coleccionMensajes: any[];
  coleccionUsuarios: Usuario[];
  provinciasSelect: any[];
  localidadesSelect: any[];
  usuariosSelect: any[];
  error: string;
}

// Estado inicial
const initialState: AppState = {
  isLoggedIn: false,
  isFetching: false,
  modal: {
    showModal: false,
    mensajeModal: '',
    tituloModal: '',
    tipoModal: '',
  },
  confirm: {
    showConfirm: false,
    mensajeConfirm: '',
    tituloConfirm: '',
    tipoConfirm: '',
    callBackConfirm: null,
  },
  login: {
    email: '',
    password: '',
    token: '',
  },
  usuario: {},
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

// LOGIN
export const loginAsync = createAsyncThunk(
  'app/login',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const usuario = await loginPersistencia(email, password);
      return usuario;
    } catch (error: any) {
      return rejectWithValue(error.code || 'Error de login');
    }
  }
);

// REGISTRO
export const registroAsync = createAsyncThunk(
  'app/registro',
  async (registroData: Record<string, any>, { rejectWithValue }) => {
    try {
      await registroPersistencia(registroData);
      return 'Registro exitoso';
    } catch (error: any) {
      return rejectWithValue(error || 'Error de registro');
    }
  }
);

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
    cierraModal: (state) => {
      state.modal.showModal = false;
    },
    cierraConfirm: (state) => {
      state.confirm.showConfirm = false;
    },
    abreModal: (
      state,
      action: PayloadAction<{
        titulo: string;
        mensaje: string;
        tipo: string;
      }>
    ) => {
      const { titulo, mensaje, tipo } = action.payload;
      state.modal = {
        showModal: true,
        mensajeModal: mensaje,
        tituloModal: titulo,
        tipoModal: tipo,
      };
    },
    confirm: (
      state,
      action: PayloadAction<{
        mensaje: string;
        titulo: string;
        tipo: string;
        callBack: (() => void) | null;
      }>
    ) => {
      const { mensaje, titulo, tipo, callBack } = action.payload;
      state.confirm = {
        showConfirm: true,
        mensajeConfirm: mensaje,
        tituloConfirm: titulo,
        tipoConfirm: tipo,
        callBackConfirm: callBack,
      };
    },
    setUsuario: (state, action: PayloadAction<Record<string, any>>) => {
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
      .addCase(loginAsync.rejected, (state, action) => {
        state.isFetching = false;
        state.modal = {
          showModal: true,
          mensajeModal: `Error de login: ${action.payload}`,
          tituloModal: 'Error',
          tipoModal: 'danger',
        };
      })
      .addCase(registroAsync.pending, (state) => {
        state.isFetching = true;
      })
      .addCase(registroAsync.fulfilled, (state) => {
        state.isFetching = false;
        state.modal = {
          showModal: true,
          mensajeModal: 'Verifique su email para completar el registro',
          tituloModal: 'Usuario Registrado',
          tipoModal: 'warning',
        };
      })
      .addCase(registroAsync.rejected, (state, action) => {
        state.isFetching = false;
        state.modal = {
          showModal: true,
          mensajeModal: `Error: ${action.payload}`,
          tituloModal: 'Error',
          tipoModal: 'danger',
        };
      })
      // .addCase(getUsuariosAsync.pending, (state) => {
      //   state.isFetching = true;
      // })
      // .addCase(getUsuariosAsync.fulfilled, (state, action) => {
      //   state.isFetching = false;
      //   state.coleccionUsuarios = action.payload;
      // })
      // .addCase(getUsuariosAsync.rejected, (state, action) => {
      //   state.isFetching = false;
      //   state.modal = {
      //     showModal: true,
      //     mensajeModal: `No se pudieron obtener usuarios: ${action.payload}`,
      //     tituloModal: 'Error',
      //     tipoModal: 'danger',
      //   };
      // })

  },
});

// Exportar acciones síncronas
export const {
  setError,
  logout,
  cierraModal,
  cierraConfirm,
  abreModal,
  confirm,
  setUsuario,
  setReparaciones,
  setUsuariosToRedux,
  setMessagesToRedux,
  isFetchingStart,
  isFetchingComplete,
} = appSlice.actions;

// Exportar el reducer por defecto
export default appSlice.reducer;
