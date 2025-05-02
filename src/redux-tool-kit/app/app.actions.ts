import { createAsyncThunk } from "@reduxjs/toolkit";
import { 
  loginPersistencia,
  registroUsuarioEndpointPersistencia
} from "../../persistencia/persistencia"; // Actualizado para usar la importación centralizada
import { ReparacionType } from "../../types/reparacion";
import { isFetchingComplete, isFetchingStart } from "./app.slice";
import { callEndpoint } from "../../utils/utils";
import { HttpMethod } from "../../types/httpMethods";
import { 
  eliminarDocumentoReparacionPersistencia, 
  eliminarFotoReparacionPersistencia, 
  subirDocumentoReparacionPersistencia, 
  subirFotoReparacionPersistencia 
} from "../../persistencia/subeFotoFirebase"; // Estas importaciones aún deberían mantenerse específicas por ahora

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
        } catch (error: any) { // TODO: Hacer tipo de dato para el error
            return rejectWithValue(error.code || 'Error de login');
        }
    }
);

// REGISTRO
export const registroAsync = createAsyncThunk(
    'app/registro',
    async (registro: any, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            const response = await registroUsuarioEndpointPersistencia(registro);
            dispatch(isFetchingComplete());
            return response;
        } catch (error: any) {
            dispatch(isFetchingComplete());
            throw error;
        }
    },
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
        } catch (error: any) { // TODO: Hacer tipo de dato para el error
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
        } catch (error: any) { // TODO: Hacer tipo de dato para el error
            dispatch(isFetchingComplete());
            return error;
        }
    },
);

// SUBIR DOCUMENTO
export const subirDocumentoAsync = createAsyncThunk(
    'app/subirDocumento',
    async ({ reparacionId, file }: { reparacionId: string; file: File }, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            const urlDoc = await subirDocumentoReparacionPersistencia(reparacionId, file);
            dispatch(isFetchingComplete());
            return urlDoc;
        } catch (error: any) { // TODO: Hacer tipo de dato para el error
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
        } catch (error: any) { // TODO: Hacer tipo de dato para el error
            dispatch(isFetchingComplete());
            return error;
        }
    },
);

// BORRAR DOCUMENTO
export const borrarDocumentoAsync = createAsyncThunk(
    'app/borrarDocumento',
    async ({ reparacionId, documentoUrl }: { reparacionId: string; documentoUrl: string }, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            await eliminarDocumentoReparacionPersistencia(reparacionId, documentoUrl);
            dispatch(isFetchingComplete());
            return documentoUrl;
        } catch (error: any) { // TODO: Hacer tipo de dato para el error
            dispatch(isFetchingComplete());
            return error;
        }
    },
);