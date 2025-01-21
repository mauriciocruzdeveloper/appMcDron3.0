import { createAsyncThunk } from "@reduxjs/toolkit";
import { loginPersistencia, registroPersistencia } from "../../persistencia/persistenciaFirebase";
import { abreModal } from "../modals/modals.slice";

// LOGIN
export const loginAsync = createAsyncThunk(
    'app/login',
    async (
        { email, password }: { email: string; password: string },
        { rejectWithValue, dispatch }
    ) => {
        try {
            const usuario = await loginPersistencia(email, password);
            return usuario;
        } catch (error: any) {
            dispatch(abreModal({
                mensaje: `Error de login: ${error.code}`,
                titulo: 'Error',
                tipo: 'danger',
            }))
            return rejectWithValue(error.code || 'Error de login');
        }
    }
);

// REGISTRO
export const registroAsync = createAsyncThunk(
    'app/registro',
    async (registroData: Record<string, any>, { rejectWithValue, dispatch }) => {
        try {
            await registroPersistencia(registroData);
            dispatch(abreModal({
                mensaje: 'Verifique su email para completar el registro',
                titulo: 'Registro',
                tipo: 'warning',
            }))
            return 'Registro exitoso';
        } catch (error) {
            dispatch(abreModal({
                mensaje: `Error de registro: ${error}`,
                titulo: 'Error',
                tipo: 'danger',
            }))
            return rejectWithValue(error || 'Error de registro');
        }
    }
);