import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    getUsuariosPersistencia,
} from '../../persistencia/persistenciaFirebase';
import { Unsubscribe } from 'firebase/auth';
import { AppDispatch } from '../store';
import { Usuario } from '../../types/usuario';
import { SelectOption } from '../../types/selectOption';

// Tipos para el estado inicial
interface UsuarioState {
    coleccionUsuarios: Usuario[];
    provinciasSelect: any[];
    localidadesSelect: any[];
    usuariosSelect: SelectOption[];
}

// Estado inicial
const initialState: UsuarioState = {
    coleccionUsuarios: [],
    provinciasSelect: [],
    localidadesSelect: [],
    usuariosSelect: [],
};

// ---------------------------------------------------------
// createAsyncThunk
// ---------------------------------------------------------

// OBTENER USUARIOS
// export const getUsuariosAsync = () => (
//     dispatch: AppDispatch,
// ): Unsubscribe | undefined => {
//     try {
//         const callbackUsuarios = (usuarios: Usuario[]) => {
//             const usuariosSelect = usuarios.map(usuario => {
//                 const dato = usuario.data.EmailUsu ? usuario.data.EmailUsu : usuario.id;
//                 return {
//                     value: dato,
//                     label: dato,
//                 }
//             });
//             console.log('callbackUsuarios', usuarios);
//             console.log('callbackUsuariosSelect', usuariosSelect);
//             dispatch(setUsuarios(usuarios));
//             // TODO: Para los usuarios select hacer un selector específico, cuando haga selectores. Usar librería reselct
//             dispatch(setUsuariosSelect(usuariosSelect));
//         };
//         const unsubscribe = getUsuariosPersistencia(callbackUsuarios);
//         return unsubscribe as Unsubscribe;
//     } catch (error) {
//         return;
//     }
// };

// ---------------------------------------------------------
// SLICE PRINCIPAL
// ---------------------------------------------------------
const usuarioSlice = createSlice({
    name: 'usuario',
    initialState,
    reducers: {
        setUsuarios: (state, action: PayloadAction<any[]>) => {
            state.coleccionUsuarios = action.payload;
        },
        setProvinciasSelect: (state, action: PayloadAction<any[]>) => {
            state.provinciasSelect = action.payload;
        },
        setLocalidadesSelect: (state, action: PayloadAction<any[]>) => {
            state.localidadesSelect = action.payload;
        },
        setUsuariosSelect: (state, action: PayloadAction<SelectOption[]>) => {
            state.usuariosSelect = action.payload;
        },
    },
});

// Exportar acciones síncronas
export const {
    setUsuarios,
    setProvinciasSelect,
    setLocalidadesSelect,
    setUsuariosSelect,
} = usuarioSlice.actions;

// Exportar el reducer por defecto
export default usuarioSlice.reducer;
