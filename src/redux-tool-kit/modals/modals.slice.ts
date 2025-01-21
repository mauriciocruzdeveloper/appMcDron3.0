// features/modalSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { eliminarReparacion, eliminarUsuario, guardarReparacion, guardarUsuario } from '../../redux-DEPRECATED/root-actions';

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
    functionId: string | null;
}

interface AppState {
    modal: ModalState;
    confirm: ConfirmState;
}

// Estado inicial
const initialState: AppState = {
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
        functionId: null,
    },
};

// ---------------------------------------------------------
// createAsyncThunk
// ---------------------------------------------------------


// ---------------------------------------------------------
// SLICE PRINCIPAL
// ---------------------------------------------------------
const modalSlice = createSlice({
    name: 'modals',
    initialState,
    reducers: {
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
        abreConfirm: (
            state,
            action: PayloadAction<{
                mensaje: string;
                titulo: string;
                tipo: string;
                functionId: string;
            }>
        ) => {
            const { mensaje, titulo, tipo, functionId } = action.payload;
            state.confirm = {
                showConfirm: true,
                mensajeConfirm: mensaje,
                tituloConfirm: titulo,
                tipoConfirm: tipo,
                functionId,
            };
        },
    },
});

// Exportar acciones síncronas
export const {
    cierraModal,
    cierraConfirm,
    abreModal,
    abreConfirm,
} = modalSlice.actions;

export const functionsMap = {
    guardarReparacion,
    eliminarReparacion,
    guardarUsuario,
    eliminarUsuario,
}

// Exportar el tipo de las actions
export type ModalActions = keyof typeof functionsMap;

// Exportar el reducer por defecto
export default modalSlice.reducer;
