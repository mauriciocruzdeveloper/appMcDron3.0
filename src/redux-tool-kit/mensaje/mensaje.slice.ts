// features/appSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Tipos para el estado inicial

export interface AppState {
    usuarioIdMessage: string; // ID del usuario logueado
    otherUserIdMessage: string; // ID del otro usuario en la conversación
    coleccionMensajes: any[];
}

// Estado inicial
const initialState: AppState = {
    usuarioIdMessage: '',
    otherUserIdMessage: '',
    coleccionMensajes: [],
};

// ---------------------------------------------------------
// SLICE PRINCIPAL
// ---------------------------------------------------------
const mensajeSlice = createSlice({
    name: 'mensaje',
    initialState,
    reducers: {
        setMessages: (state, action: PayloadAction<any[]>) => {
            state.coleccionMensajes = action.payload;
        },
        setUsuarioIdMessage: (state, action: PayloadAction<string>) => {
            state.usuarioIdMessage = action.payload;
        },
        setOtherUserIdMessage: (state, action: PayloadAction<string>) => {
            state.otherUserIdMessage = action.payload;
        },
    },
});

// Exportar acciones síncronas
export const {
    setMessages,
    setUsuarioIdMessage,
    setOtherUserIdMessage,
} = mensajeSlice.actions;

// Exportar el reducer por defecto
export default mensajeSlice.reducer;
