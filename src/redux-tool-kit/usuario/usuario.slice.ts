import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Usuario } from '../../types/usuario';
import { SelectOption } from '../../types/selectOption';

// Tipos para el estado inicial
interface UsuarioState {
    filter: string;
    coleccionUsuarios: Usuario[];
    provinciasSelect: any[];
    localidadesSelect: any[];
    usuariosSelect: SelectOption[];
}

// Estado inicial
const initialState: UsuarioState = {
    filter: '',
    coleccionUsuarios: [],
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
        setFilter: (state, action: PayloadAction<string>) => {
            state.filter = action.payload;
        },
    },
});

// Exportar acciones síncronas
export const {
    setFilter,
    setUsuarios,
    setProvinciasSelect,
    setLocalidadesSelect,
    setUsuariosSelect,
} = usuarioSlice.actions;

// Exportar el reducer por defecto
export default usuarioSlice.reducer;
