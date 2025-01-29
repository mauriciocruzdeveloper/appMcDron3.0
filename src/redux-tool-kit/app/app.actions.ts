import { createAsyncThunk } from "@reduxjs/toolkit";
import { loginPersistencia, registroPersistencia } from "../../persistencia/persistenciaFirebase";

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
        } catch (error) {
            return rejectWithValue(error || 'Error de registro');
        }
    }
);