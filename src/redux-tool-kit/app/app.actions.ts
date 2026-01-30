import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  loginPersistencia,
  registroUsuarioEndpointPersistencia,
  reenviarEmailVerificacionPersistencia,
  subirArchivoPersistencia,
  subirImagenConMiniaturaPersistencia,
  eliminarArchivoPersistencia,
  verificarConexionWebSocket
} from "../../persistencia/persistencia"; // Actualizado para usar la importación centralizada
import { ReparacionType } from "../../types/reparacion";
import { isFetchingComplete, isFetchingStart } from "./app.slice";
import { callEndpoint } from "../../utils/utils";
import { HttpMethod } from "../../types/httpMethods";
import { guardarReparacionAsync, getIntervencionesPorReparacionAsync, actualizarFotosAsignacionAsync } from '../reparacion/reparacion.actions';
import { sanitizeBaseName, buildUploadPath, addTimestampToBase } from '../../utils/fileUtils';
import { supabaseAuthErrors } from "../../persistencia/persistenciaSupabase/supabaseAuthErrors";
import { RootState } from "../store";

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
  async (reparacion: ReparacionType, { dispatch, getState }) => {
    try {
      dispatch(isFetchingStart());

      // Obtener el usuario para usar su email de contacto si está disponible
      const state = getState() as RootState;
      const usuario = state.usuario.coleccionUsuarios[reparacion.data.UsuarioRep];
      const emailDestino = usuario?.data?.EmailContacto || reparacion.data.EmailUsu;

      const body = {
        cliente: reparacion.data.ApellidoUsu ? `${reparacion.data.NombreUsu} ${reparacion.data.ApellidoUsu}` : reparacion.data.NombreUsu,
        nro_reparacion: reparacion.id,
        equipo: reparacion.data.ModeloDroneNameRep,
        fecha_ingreso: new Date(Number(reparacion.data.FeRecRep)).toLocaleDateString(),
        observaciones: reparacion.data.DescripcionUsuRep,
        telefono: reparacion.data.TelefonoUsu,
        email: emailDestino
      };

      const url = process.env.REACT_APP_API_URL + '/send_recibo';

      const response = await callEndpoint({
        url,
        method: HttpMethod.POST,
        body,
      });

      if (!response.success) {
        throw new Error('Error al enviar el recibo: ' + (response.error || 'Error desconocido'));
      }

      dispatch(isFetchingComplete());

      return response;
    } catch (error: any) { // TODO: Hacer tipo de dato para el error
      dispatch(isFetchingComplete());
      throw error;
    }
  },
);

// ENVIAR EMAIL DE PRESUPUESTO
export const enviarPresupuestoAsync = createAsyncThunk(
  'app/enviarPresupuesto',
  async (reparacion: ReparacionType, { dispatch, getState }) => {
    try {
      dispatch(isFetchingStart());

      const state = getState() as RootState;
      
      // Obtener las asignaciones de intervenciones desde el state
      // Si no están cargadas, cargarlas primero
      let asignacionesIntervenciones = state.reparacion.intervencionesDeReparacionActual;
      
      // Verificar si necesitamos cargar las intervenciones
      if (asignacionesIntervenciones.length === 0 || 
          asignacionesIntervenciones[0]?.data.reparacionId !== reparacion.id) {
        // Cargar sin dispatchar isFetching para no interrumpir nuestro loading
        const { getIntervencionesPorReparacionPersistencia } = await import('../../persistencia/persistencia');
        asignacionesIntervenciones = await getIntervencionesPorReparacionPersistencia(reparacion.id);
      }
      
      // Obtener el catálogo de intervenciones
      const catalogoIntervenciones = state.intervencion.coleccionIntervenciones;

      // Obtener el usuario
      const usuario = state.usuario.coleccionUsuarios[reparacion.data.UsuarioRep];
      const emailDestino = usuario?.data?.EmailContacto || reparacion.data.EmailUsu;

      let equipo = reparacion.data.ModeloDroneNameRep;
      if (!equipo) {
        if (reparacion.data.DroneId) {
          const drone = state.drone.coleccionDrones[reparacion.data.DroneId];
          if (drone) {
            equipo = state.modeloDrone.coleccionModelosDrone[drone.data.ModeloDroneId].data.NombreModelo;
          } else {
            equipo = 'Drone no encontrado';
          }
        } else {
          equipo = 'Drone no asignado';
        }
      }

      // Construir array de intervenciones con descripción y fotos
      const intervenciones = asignacionesIntervenciones.map((asignacion) => {
        const intervencion = catalogoIntervenciones[asignacion.data.intervencionId];
        return {
          nombre: intervencion?.data?.NombreInt || 'Intervención',
          descripcion: asignacion.data.descripcion || '',
          fotos: asignacion.data.fotos || []
        };
      });

      const montoTotal = reparacion.data.PresuFiRep || 0;

      const body = {
        cliente: reparacion.data.ApellidoUsu ? `${reparacion.data.NombreUsu} ${reparacion.data.ApellidoUsu}` : reparacion.data.NombreUsu,
        nro_reparacion: reparacion.id,
        equipo,
        fecha_ingreso: new Date(Number(reparacion.data.FeRecRep)).toLocaleDateString(),
        intervenciones: intervenciones,
        monto_total: `${montoTotal}`,
        telefono: reparacion.data.TelefonoUsu,
        email: emailDestino
      };

      const url = process.env.REACT_APP_API_URL + '/send_repair_budget';

      const response = await callEndpoint({
        url,
        method: HttpMethod.POST,
        body,
      });

      dispatch(isFetchingComplete());

      return response;
    } catch (error: any) {
      dispatch(isFetchingComplete());
      throw error;
    }
  },
);

// GENERAR PDF PRESUPUESTO
export const generarPDFPresupuestoAsync = createAsyncThunk(
  'app/generarPDFPresupuesto',
  async (reparacion: ReparacionType, { dispatch, getState, rejectWithValue }) => {
    try {
      dispatch(isFetchingStart());

      const state = getState() as RootState;
      
      // Obtener las asignaciones de intervenciones desde el state
      let asignacionesIntervenciones = state.reparacion.intervencionesDeReparacionActual;
      
      // Verificar si necesitamos cargar las intervenciones
      if (asignacionesIntervenciones.length === 0 || 
          asignacionesIntervenciones[0]?.data.reparacionId !== reparacion.id) {
        const { getIntervencionesPorReparacionPersistencia } = await import('../../persistencia/persistencia');
        asignacionesIntervenciones = await getIntervencionesPorReparacionPersistencia(reparacion.id);
      }
      
      // Obtener el catálogo de intervenciones
      const catalogoIntervenciones = state.intervencion.coleccionIntervenciones;

      // Obtener el usuario
      const usuario = state.usuario.coleccionUsuarios[reparacion.data.UsuarioRep];
      const emailDestino = usuario?.data?.EmailContacto || reparacion.data.EmailUsu;

      let equipo = reparacion.data.ModeloDroneNameRep;
      if (!equipo) {
        if (reparacion.data.DroneId) {
          const drone = state.drone.coleccionDrones[reparacion.data.DroneId];
          if (drone) {
            equipo = state.modeloDrone.coleccionModelosDrone[drone.data.ModeloDroneId].data.NombreModelo;
          } else {
            equipo = 'Drone no encontrado';
          }
        } else {
          equipo = 'Drone no asignado';
        }
      }

      // Construir array de intervenciones con descripción y fotos
      const intervenciones = asignacionesIntervenciones.map((asignacion) => {
        const intervencion = catalogoIntervenciones[asignacion.data.intervencionId];
        return {
          nombre: intervencion?.data?.NombreInt || 'Intervención',
          descripcion: asignacion.data.descripcion || '',
          fotos: asignacion.data.fotos || []
        };
      });

      const montoTotal = reparacion.data.PresuFiRep || 0;

      const datosPresupuesto = {
        cliente: reparacion.data.ApellidoUsu ? `${reparacion.data.NombreUsu} ${reparacion.data.ApellidoUsu}` : reparacion.data.NombreUsu,
        nro_reparacion: reparacion.id,
        equipo,
        fecha_ingreso: new Date(Number(reparacion.data.FeRecRep)).toLocaleDateString(),
        intervenciones: intervenciones,
        monto_total: montoTotal,
        telefono: reparacion.data.TelefonoUsu,
        email: emailDestino
      };

      // Detectar si estamos en Cordova
      const isCordova = typeof (window as any).cordova !== 'undefined';

      const apiUrl = process.env.REACT_APP_API_URL;
      if (!apiUrl) {
        throw new Error('REACT_APP_API_URL no está configurada');
      }

      if (isCordova) {
        // En Cordova, guardar el PDF en el servidor y abrir la URL

        
        const response = await fetch(`${apiUrl}/generate_budget_pdf?saveToServer=1`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(datosPresupuesto)
        });        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error del servidor:', errorText);
          throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('Resultado parseado:', result);
        
        if (!result.success) {
          throw new Error(result.error || 'Error al generar el PDF');
        }

        // Construir la URL completa del PDF
        const baseUrl = apiUrl.replace('/api', '');
        const pdfUrl = `${baseUrl}${result.url}`;
        
        console.log('Abriendo PDF:', pdfUrl);
        
        // En Cordova, asignar directamente para que el navegador del sistema maneje el PDF
        window.location.href = pdfUrl;
      } else {
        // En navegador web, usar el método del formulario
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `${apiUrl}/generate_budget_pdf`;
        form.target = '_blank';
        
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'data';
        input.value = JSON.stringify(datosPresupuesto);
        
        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
      }

      dispatch(isFetchingComplete());
      return { success: true };
    } catch (error: any) {
      dispatch(isFetchingComplete());
      return rejectWithValue({
        message: error.message || "Error al generar el PDF del presupuesto."
      });
    }
  }
);

// ENVIAR EMAIL DE FINALIZACIÓN
export const enviarDroneReparadoAsync = createAsyncThunk(
  'app/enviarFinalizacion',
  async (reparacion: ReparacionType, { dispatch, getState }) => {
    try {
      dispatch(isFetchingStart());

      // Cargar las ASIGNACIONES de intervenciones para esta reparación
      // (no solo los IDs del catálogo, sino las asignaciones con sus precios específicos)
      await dispatch(getIntervencionesPorReparacionAsync(reparacion.id));

      const state = getState() as RootState;
      
      // Obtener las asignaciones de intervenciones (pueden ser múltiples de la misma intervención)
      const asignacionesIntervenciones = state.reparacion.intervencionesDeReparacionActual;
      
      // Obtener el catálogo de intervenciones para hacer lookup
      const catalogoIntervenciones = state.intervencion.coleccionIntervenciones;

      // Obtener el usuario para usar su email de contacto si está disponible
      const usuario = state.usuario.coleccionUsuarios[reparacion.data.UsuarioRep];
      const emailDestino = usuario?.data?.EmailContacto || reparacion.data.EmailUsu;

      let equipo = reparacion.data.ModeloDroneNameRep;
      if (!equipo) {
        if (reparacion.data.DroneId) {
          const drone = state.drone.coleccionDrones[reparacion.data.DroneId];
          if (drone) {
            equipo = state.modeloDrone.coleccionModelosDrone[drone.data.ModeloDroneId].data.NombreModelo;
          } else {
            equipo = 'Drone no encontrado';
          }
        } else {
          equipo = 'Drone no asignado';
        }
      }

      // Construir array de intervenciones para el email
      const intervenciones = asignacionesIntervenciones.map((asignacion) => {
        const intervencion = catalogoIntervenciones[asignacion.data.intervencionId];
        return {
          nombre: intervencion?.data?.NombreInt || 'Intervención',
          precio: asignacion.data.PrecioTotal || 0
        };
      });

      // Los comentarios del técnico van por separado
      const comentariosTecnico = reparacion.data.DescripcionTecRep || "";

      // Cálculo correcto de los montos
      const montoTotal = reparacion.data.PresuFiRep || 0;
      const montoPagado = reparacion.data.PresuReRep || 0;
      const montoRestante = montoTotal - montoPagado;

      const body = {
        cliente: reparacion.data.ApellidoUsu ? `${reparacion.data.NombreUsu} ${reparacion.data.ApellidoUsu}` : reparacion.data.NombreUsu,
        nro_reparacion: reparacion.id,
        equipo,
        fecha_ingreso: new Date(Number(reparacion.data.FeRecRep)).toLocaleDateString(),
        fecha_finalizacion: new Date().toLocaleDateString(),
        intervenciones: intervenciones, // Array de intervenciones
        comentarios_tecnico: comentariosTecnico, // Comentarios aparte
        monto_total: `$${montoTotal}`,
        monto_pagado: `$${montoPagado}`,
        monto_restante: `$${montoRestante}`,
        telefono: reparacion.data.TelefonoUsu,
        email: emailDestino
      };

      const url = process.env.REACT_APP_API_URL + '/send_drone_reparado';

      console.log("Cuerpo del email de drone reparado:", body);

      const response = await callEndpoint({
        url,
        method: HttpMethod.POST,
        body,
      });

      console.log("Respuesta del endpoint de drone reparado:", response);
      
      dispatch(isFetchingComplete());

      return response;
    } catch (error: any) { // TODO: Hacer tipo de dato para el error
      console.error("Error en enviarDroneReparadoAsync:", error);
      dispatch(isFetchingComplete());
      throw error;
    }
  },
);

// ENVIAR EMAIL DE DIAGNÓSTICO
export const enviarDroneDiagnosticadoAsync = createAsyncThunk(
  'app/enviarDiagnostico',
  async (reparacion: ReparacionType, { dispatch, getState }) => {
    try {
      dispatch(isFetchingStart());

      // Obtener el usuario para usar su email de contacto si está disponible
      const state = getState() as RootState;
      const usuario = state.usuario.coleccionUsuarios[reparacion.data.UsuarioRep];
      const emailDestino = usuario?.data?.EmailContacto || reparacion.data.EmailUsu;

      const body = {
        cliente: reparacion.data.ApellidoUsu ? `${reparacion.data.NombreUsu} ${reparacion.data.ApellidoUsu}` : reparacion.data.NombreUsu,
        nro_reparacion: reparacion.id,
        equipo: reparacion.data.ModeloDroneNameRep,
        fecha_ingreso: new Date(Number(reparacion.data.FeRecRep)).toLocaleDateString(),
        fecha_diagnostico: new Date().toLocaleDateString(),
        diagnostico: reparacion.data.DescripcionTecRep || "Sin diagnóstico",
        costo_diagnostico: `$${reparacion.data.PresuDiRep ?? 0}`,
        telefono: reparacion.data.TelefonoUsu,
        email: emailDestino
      };

      const url = process.env.REACT_APP_API_URL + '/send_drone_diagnosticado';

      const response = await callEndpoint({
        url,
        method: HttpMethod.POST,
        body,
      });

      dispatch(isFetchingComplete());

      return response;
    } catch (error: any) { // TODO: Hacer tipo de dato para el error
      dispatch(isFetchingComplete());
      throw error;
    }
  },
);

// SUBIR FOTO (con compresión y miniatura)
export const subirFotoAsync = createAsyncThunk(
  'app/subirFoto',
  async ({ reparacionId, file }: { reparacionId: string, file: File }, { dispatch }) => {
    try {
      dispatch(isFetchingStart());

      // Generar un nombre único para el archivo usando timestamp
      const safeBase = sanitizeBaseName(file.name);
      const fileName = addTimestampToBase(safeBase);
      const path = buildUploadPath({ entityType: 'REPARACIONES', entityId: reparacionId, folder: 'fotos', fileName });

      // Subir con compresión y generación de miniatura automática
      // Retorna { originalUrl, thumbnailUrl }
      const { originalUrl } = await subirImagenConMiniaturaPersistencia(path, file);

      dispatch(isFetchingComplete());
      // Retornamos solo la URL original, la miniatura se puede obtener con getThumbnailUrl()
      return originalUrl;
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

      // Generar un nombre único para el archivo usando timestamp y manteniendo la extensión
      const safeBaseDoc = sanitizeBaseName(file.name);
      const extIndexDoc = file.name.lastIndexOf('.');
      const extDoc = extIndexDoc !== -1 ? file.name.substring(extIndexDoc) : '';
      const fileNameDoc = addTimestampToBase(safeBaseDoc) + extDoc;
      const pathDoc = buildUploadPath({ entityType: 'REPARACIONES', entityId: reparacionId, folder: 'documentos', fileName: fileNameDoc });

      // Subir el Blob en lugar del archivo original
      const urlDocumento = await subirArchivoPersistencia(pathDoc, fileBlob);

      dispatch(isFetchingComplete());
      return urlDocumento;
    } catch (error: any) {
      console.error("Error al subir documento:", error);
      dispatch(isFetchingComplete());
      throw error;
    }
  }
);

// SUBIR FOTO DE ASIGNACIÓN (sube la imagen y actualiza las fotos de la asignación)
// app.actions.ts

export const subirFotoAsignacionAsync = createAsyncThunk(
  'app/subirFotoAsignacion',
  async ({ asignacionId, file }: { asignacionId: string, file: File }, { dispatch, getState, rejectWithValue }) => {
    try {
      // --- PASO CRÍTICO PARA ANDROID ---
      // Leemos los bytes inmediatamente. Si hacemos un await de otra cosa antes,
      // perdemos el acceso al archivo en WebViews móviles.
      const arrayBuffer = await file.arrayBuffer();
      const stableBlob = new Blob([arrayBuffer], { type: file.type });
      // ---------------------------------

      dispatch(isFetchingStart());

      const state = getState() as RootState;
      const asignaciones = state.reparacion.intervencionesDeReparacionActual;
      const asignacion = asignaciones.find(a => a.id === asignacionId);
      const fotosActuales: string[] = asignacion?.data?.fotos || [];

      const safeBase = sanitizeBaseName(file.name);
      const fileName = addTimestampToBase(safeBase);
      const path = buildUploadPath({ entityType: 'ASIGNACIONES', entityId: asignacionId, folder: 'fotos', fileName });

      // Usamos el stableBlob en lugar del file original
      const { originalUrl } = await subirImagenConMiniaturaPersistencia(path, stableBlob);

      const nuevasFotos = [...fotosActuales, originalUrl];
      const resultado = await dispatch(actualizarFotosAsignacionAsync({ asignacionId, fotos: nuevasFotos }));

      if (resultado.meta.requestStatus !== 'fulfilled') {
        throw new Error('Error al actualizar fotos en la base de datos');
      }

      dispatch(isFetchingComplete());
      return nuevasFotos; // Esto llega al .payload
    } catch (error: any) {
      console.error('Error en subirFotoAsignacionAsync:', error);
      dispatch(isFetchingComplete());
      // Importante: rejectWithValue para que el error sea controlado
      return rejectWithValue(error.message || 'Error al subir la foto');
    }
  }
);

// BORRAR FOTO
export const borrarFotoAsync = createAsyncThunk(
  'app/borrarFoto',
  async ({ reparacionId, fotoUrl }: { reparacionId: string, fotoUrl: string }, { dispatch, getState }) => {
    try {
      dispatch(isFetchingStart());

      // 1. Obtener la reparación actual del estado
      const state = getState() as RootState;
      const reparacionActual = state.reparacion.coleccionReparaciones[reparacionId];
      
      if (!reparacionActual) {
        throw new Error('Reparación no encontrada');
      }

      // 2. Eliminar el archivo de Storage
      await eliminarArchivoPersistencia(fotoUrl);

      // 3. Actualizar el array de fotos eliminando la URL
      const nuevasUrlsFotos = (reparacionActual.data.urlsFotos || []).filter(url => url !== fotoUrl);

      // 4. Limpiar FotoAntes o FotoDespues si la foto eliminada era una de esas
      const reparacionActualizada = {
        ...reparacionActual,
        data: {
          ...reparacionActual.data,
          urlsFotos: nuevasUrlsFotos,
          FotoAntes: reparacionActual.data.FotoAntes === fotoUrl ? undefined : reparacionActual.data.FotoAntes,
          FotoDespues: reparacionActual.data.FotoDespues === fotoUrl ? undefined : reparacionActual.data.FotoDespues,
        }
      };

      // 5. Guardar la reparación actualizada
      const guardarResponse = await dispatch(guardarReparacionAsync(reparacionActualizada));
      if (guardarResponse.meta.requestStatus !== 'fulfilled') {
        throw new Error("Error al actualizar la reparación");
      }

      dispatch(isFetchingComplete());
      return reparacionActualizada;
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
  async ({ reparacion, file }: { reparacion: ReparacionType, file: File }, { dispatch }) => {
    try {
      dispatch(isFetchingStart());

      // 1. Subir la foto
      const response = await dispatch(subirFotoAsync({ reparacionId: reparacion.id, file }));
      if (response.meta.requestStatus !== 'fulfilled') {
        throw new Error("Error al subir la foto");
      }

      const urlFoto = response.payload as string;

      // 2. Actualizar la reparación con la nueva foto
      const nuevaReparacion = {
        ...reparacion,
        data: {
          ...reparacion.data,
          urlsFotos: [...(reparacion.data.urlsFotos || []), urlFoto]
        }
      };

      // 3. Guardar la reparación actualizada
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
  async ({ reparacion, file }: { reparacion: ReparacionType, file: File }, { dispatch }) => {
    try {
      dispatch(isFetchingStart());

      // 1. Subir el documento
      const response = await dispatch(subirDocumentoAsync({ reparacionId: reparacion.id, file }));
      if (response.meta.requestStatus !== 'fulfilled') {
        throw new Error("Error al subir el documento");
      }

      const urlDocumento = response.payload as string;

      // 2. Actualizar la reparación con el nuevo documento
      const nuevaReparacion = {
        ...reparacion,
        data: {
          ...reparacion.data,
          urlsDocumentos: [...(reparacion.data.urlsDocumentos || []), urlDocumento]
        }
      };

      // 3. Guardar la reparación actualizada
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

// VERIFICAR CONEXIÓN WEBSOCKET
export const verificarConexionWebSocketAsync = createAsyncThunk(
  'app/verificarConexionWebSocket',
  async (_, { rejectWithValue }) => {
    try {
      const conectado = await verificarConexionWebSocket();
      return conectado;
    } catch (error) {
      console.error('Error al verificar conexión al websocket:', error);
      return rejectWithValue('Error al verificar conexión al websocket');
    }
  }
);