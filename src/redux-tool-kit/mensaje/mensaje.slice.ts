// features/appSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Tipos para el estado inicial

export interface AppState {
    emailUsuMessage: string;
    emailCliMessage: string;
    coleccionMensajes: any[];
}

// Estado inicial
const initialState: AppState = {
    emailUsuMessage: '',
    emailCliMessage: '',
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
        setEmailUsuMessage: (state, action: PayloadAction<string>) => {
            console.log('!!! setEmailUsuMessage', action.payload);
            state.emailUsuMessage = action.payload;
        },
        setEmailCliMessage: (state, action: PayloadAction<string>) => {
            state.emailCliMessage = action.payload;
        },
    },
});

// Exportar acciones síncronas
export const {
    setMessages,
    setEmailUsuMessage,
    setEmailCliMessage,
} = mensajeSlice.actions;

// Exportar el reducer por defecto
export default mensajeSlice.reducer;
