import { createAsyncThunk } from "@reduxjs/toolkit";
import { 
  loginPersistencia,
  registroUsuarioEndpointPersistencia,
  reenviarEmailVerificacionPersistencia
} from "../../persistencia/persistencia"; // Actualizado para usar la importación centralizada
import { ReparacionType } from "../../types/reparacion";
import { isFetchingComplete, isFetchingStart } from "./app.slice";
import { callEndpoint } from "../../utils/utils";
import { HttpMethod } from "../../types/httpMethods";
// Importar las funciones de persistencia para subir y eliminar archivos
import { 
  subirArchivoPersistencia, 
  eliminarArchivoPersistencia 
} from '../../persistencia/persistenciaFirebase';
import { getReparacionAsync, guardarReparacionAsync } from '../reparacion/reparacion.actions';
import { supabaseAuthErrors } from "../../persistencia/supabaseAuthErrors";

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
            // Verificar si el error es de email no confirmado
            if (error.code === 'email_not_confirmed') {
                try {
                    // Reenviar email de verificación
                    await reenviarEmailVerificacionPersistencia(email);
                    return rejectWithValue('Email no verificado. Se ha enviado un nuevo correo de verificación a su dirección de email.');
                } catch (verificationError: any) {
                    return rejectWithValue('Error al reenviar email de verificación: ' + (verificationError.message || 'Intente más tarde'));
                }
            }
            
            const errorMessage = supabaseAuthErrors[error.code] || 'Error desconocido';
            return rejectWithValue(errorMessage);
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
  async ({ reparacionId, file }: { reparacionId: string, file: File }, { dispatch }) => {
    try {
      dispatch(isFetchingStart());
      
      // Crear un Blob a partir del archivo para evitar problemas de referencia
      const fileBlob = new Blob([await file.arrayBuffer()], { type: file.type });
      
      // Generar un nombre único para el archivo usando timestamp
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const path = `REPARACIONES/${reparacionId}/fotos/${fileName}`;
      
      // Subir el Blob en lugar del archivo original
      const urlFoto = await subirArchivoPersistencia(path, fileBlob);
      
      dispatch(isFetchingComplete());
      return urlFoto;
    } catch (error: any) {
      console.error("Error al subir foto:", error);
      dispatch(isFetchingComplete());
      throw error;
    }
  }
);

// SUBIR DOCUMENTO
export const subirDocumentoAsync = createAsyncThunk(
  'app/subirDocumento',
  async ({ reparacionId, file }: { reparacionId: string, file: File }, { dispatch }) => {
    try {
      dispatch(isFetchingStart());
      
      // Crear un Blob a partir del archivo para evitar problemas de referencia
      const fileBlob = new Blob([await file.arrayBuffer()], { type: file.type });
      
      // Generar un nombre único para el archivo usando timestamp
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const path = `REPARACIONES/${reparacionId}/documentos/${fileName}`;
      
      // Subir el Blob en lugar del archivo original
      const urlDocumento = await subirArchivoPersistencia(path, fileBlob);
      
      dispatch(isFetchingComplete());
      return urlDocumento;
    } catch (error: any) {
      console.error("Error al subir documento:", error);
      dispatch(isFetchingComplete());
      throw error;
    }
  }
);

// BORRAR FOTO
export const borrarFotoAsync = createAsyncThunk(
  'app/borrarFoto',
  async ({ reparacionId, fotoUrl }: { reparacionId: string, fotoUrl: string }, { dispatch, getState }) => {
    try {
      dispatch(isFetchingStart());
      
      // Eliminar el archivo de Storage
      await eliminarArchivoPersistencia(fotoUrl);
      
      dispatch(isFetchingComplete());
      return fotoUrl;
    } catch (error: any) {
      console.error("Error al borrar foto:", error);
      dispatch(isFetchingComplete());
      throw error;
    }
  }
);

// BORRAR DOCUMENTO
export const borrarDocumentoAsync = createAsyncThunk(
  'app/borrarDocumento',
  async ({ reparacionId, documentoUrl }: { reparacionId: string, documentoUrl: string }, { dispatch }) => {
    try {
      dispatch(isFetchingStart());
      
      // Eliminar el archivo de Storage
      await eliminarArchivoPersistencia(documentoUrl);
      
      dispatch(isFetchingComplete());
      return documentoUrl;
    } catch (error: any) {
      console.error("Error al borrar documento:", error);
      dispatch(isFetchingComplete());
      throw error;
    }
  }
);

// Acción completa para subir una foto y actualizar la reparación
export const subirFotoYActualizarReparacionAsync = createAsyncThunk(
  'app/subirFotoYActualizar',
  async ({ reparacionId, file }: { reparacionId: string, file: File }, { dispatch }) => {
    try {
      dispatch(isFetchingStart());
      
      // 1. Subir la foto
      const response = await dispatch(subirFotoAsync({ reparacionId, file }));
      if (response.meta.requestStatus !== 'fulfilled') {
        throw new Error("Error al subir la foto");
      }
      
      const urlFoto = response.payload as string;
      
      // 2. Obtener la reparación actual
      const reparacionResponse = await dispatch(getReparacionAsync(reparacionId));
      if (reparacionResponse.meta.requestStatus !== 'fulfilled') {
        throw new Error("Error al obtener la reparación");
      }
      
      const reparacion = reparacionResponse.payload as ReparacionType;
      
      // 3. Actualizar la reparación con la nueva foto
      const nuevaReparacion = {
        ...reparacion,
        data: {
          ...reparacion.data,
          urlsFotos: [...(reparacion.data.urlsFotos || []), urlFoto]
        }
      };
      
      // 4. Guardar la reparación actualizada
      const guardarResponse = await dispatch(guardarReparacionAsync(nuevaReparacion));
      if (guardarResponse.meta.requestStatus !== 'fulfilled') {
        throw new Error("Error al guardar la reparación");
      }
      
      dispatch(isFetchingComplete());
      return nuevaReparacion;
      
    } catch (error: any) {
      dispatch(isFetchingComplete());
      throw error;
    }
  }
);

// Acción completa para subir un documento y actualizar la reparación
export const subirDocumentoYActualizarReparacionAsync = createAsyncThunk(
  'app/subirDocumentoYActualizar',
  async ({ reparacionId, file }: { reparacionId: string, file: File }, { dispatch }) => {
    try {
      dispatch(isFetchingStart());
      
      // 1. Subir el documento
      const response = await dispatch(subirDocumentoAsync({ reparacionId, file }));
      if (response.meta.requestStatus !== 'fulfilled') {
        throw new Error("Error al subir el documento");
      }
      
      const urlDocumento = response.payload as string;
      
      // 2. Obtener la reparación actual
      const reparacionResponse = await dispatch(getReparacionAsync(reparacionId));
      if (reparacionResponse.meta.requestStatus !== 'fulfilled') {
        throw new Error("Error al obtener la reparación");
      }
      
      const reparacion = reparacionResponse.payload as ReparacionType;
      
      // 3. Actualizar la reparación con el nuevo documento
      const nuevaReparacion = {
        ...reparacion,
        data: {
          ...reparacion.data,
          urlsDocumentos: [...(reparacion.data.urlsDocumentos || []), urlDocumento]
        }
      };
      
      // 4. Guardar la reparación actualizada
      const guardarResponse = await dispatch(guardarReparacionAsync(nuevaReparacion));
      if (guardarResponse.meta.requestStatus !== 'fulfilled') {
        throw new Error("Error al guardar la reparación");
      }
      
      dispatch(isFetchingComplete());
      return nuevaReparacion;
      
    } catch (error: any) {
      dispatch(isFetchingComplete());
      throw error;
    }
  }
);