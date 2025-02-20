import { createAsyncThunk } from "@reduxjs/toolkit";
import { loginPersistencia, registroPersistencia } from "../../persistencia/persistenciaFirebase";
import { ReparacionType } from "../../types/reparacion";
import { isFetchingComplete, isFetchingStart } from "./app.slice";
import { callEndpoint } from "../../utils/utils";
import { HttpMethod } from "../../types/httpMethods";
import { eliminarFotoReparacionPersistencia, subirFotoReparacionPersistencia } from "../../persistencia/subeFotoFirebase";

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

// ENVIA RECIBO
export const enviarReciboAsync = createAsyncThunk(
    'app/enviarRecibo',
    async (reparacion: ReparacionType, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            const body = {
                cliente: reparacion.data.NombreUsu,
                nro_reparacion: reparacion.id,
                equipo: reparacion.data.DroneRep,
                fecha_ingreso: new Date(Number(reparacion.data.FeRecRep)).toLocaleDateString(),
                observaciones: reparacion.data.DescripcionUsuRep,
                telefono: reparacion.data.TelefonoUsu,
                email: reparacion.data.EmailUsu
            };

            const url = process.env.REACT_APP_API_URL + '/send_recibo';

            const response = await callEndpoint({
                url,
                method: HttpMethod.POST,
                body,
            });

            dispatch(isFetchingComplete());
            return response;
        } catch (error: any) {
            dispatch(isFetchingComplete());
            return error;
        }
    },
);

// SUBIR FOTO
export const subirFotoAsync = createAsyncThunk(
    'app/subirFoto',
    async ({ reparacionId, file }: { reparacionId: string; file: File }, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            const urlFoto = await subirFotoReparacionPersistencia(reparacionId, file);
            dispatch(isFetchingComplete());
            return urlFoto;
        } catch (error: any) {
            dispatch(isFetchingComplete());
            return error;
        }
    },
);

// BORRAR FOTO
export const borrarFotoAsync = createAsyncThunk(
    'app/borrarFoto',
    async ({ reparacionId, fotoUrl }: { reparacionId: string; fotoUrl: string }, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            await eliminarFotoReparacionPersistencia(reparacionId, fotoUrl);
            dispatch(isFetchingComplete());
            return fotoUrl;
        } catch (error: any) {
            dispatch(isFetchingComplete());
            return error;
        }
    },
);