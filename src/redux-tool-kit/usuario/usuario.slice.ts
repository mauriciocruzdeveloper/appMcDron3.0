import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Usuario, Usuarios } from '../../types/usuario';
import { SelectOption } from '../../types/selectOption';
import { guardarUsuarioAsync, eliminarUsuarioAsync } from './usuario.actions';

// Tipos para el estado inicial
interface UsuarioState {
    filter: string;
    coleccionUsuarios: Usuarios;
    provinciasSelect: SelectOption[];
    localidadesSelect: SelectOption[];
    usuariosSelect: SelectOption[];
}

// Estado inicial
const initialState: UsuarioState = {
    filter: '',
    coleccionUsuarios: {},
    provinciasSelect: [],
    localidadesSelect: [],
    usuariosSelect: [],
};

// ---------------------------------------------------------
// SLICE PRINCIPAL
// ---------------------------------------------------------
const usuarioSlice = createSlice({
    name: 'usuario',
    initialState,
    reducers: {
        setUsuarios: (state, action: PayloadAction<Usuario[]>) => {
            // Convertir el array de usuarios a un objeto con ID como clave
            const usuariosObj: Usuarios = {};
            action.payload.forEach(usuario => {
                usuariosObj[usuario.id] = usuario;
            });
            state.coleccionUsuarios = usuariosObj;
        },
        setUsuario: (state, action: PayloadAction<Usuario>) => {
            // Actualizar o añadir un usuario específico
            const usuario = action.payload;
            state.coleccionUsuarios[usuario.id] = usuario;
        },
        setProvinciasSelect: (state, action: PayloadAction<SelectOption[]>) => {
            state.provinciasSelect = action.payload;
        },
        setLocalidadesSelect: (state, action: PayloadAction<SelectOption[]>) => {
            state.localidadesSelect = action.payload;
        },
        setUsuariosSelect: (state, action: PayloadAction<SelectOption[]>) => {
            state.usuariosSelect = action.payload;
        },
        setFilter: (state, action: PayloadAction<string>) => {
            state.filter = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(guardarUsuarioAsync.fulfilled, (state, action) => {
            const usuario = action.payload;
            // Actualizar o añadir el usuario en la colección
            state.coleccionUsuarios[usuario.id] = usuario;
        });
        builder.addCase(eliminarUsuarioAsync.fulfilled, (state, action) => {
            const usuarioId = action.payload;
            // Eliminar el usuario de la colección
            delete state.coleccionUsuarios[usuarioId];
        });
    },
});

// Exportar acciones síncronas
export const {
    setFilter,
    setUsuarios,
    setUsuario,
    setProvinciasSelect,
    setLocalidadesSelect,
    setUsuariosSelect,
} = usuarioSlice.actions;

// Exportar el reducer por defecto
export default usuarioSlice.reducer;
