import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  loginPersistencia,
  registroUsuarioEndpointPersistencia,
  reenviarEmailVerificacionPersistencia,
  subirArchivoPersistencia,
  eliminarArchivoPersistencia,
  verificarConexionWebSocket
} from "../../persistencia/persistencia"; // Actualizado para usar la importación centralizada
import { ReparacionType } from "../../types/reparacion";
import { Intervenciones } from "../../types/intervencion";
import { isFetchingComplete, isFetchingStart } from "./app.slice";
import { callEndpoint } from "../../utils/utils";
import { HttpMethod } from "../../types/httpMethods";
import { guardarReparacionAsync, getIntervencionesPorReparacionAsync } from '../reparacion/reparacion.actions';
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

      // Crear un formulario invisible para enviar la petición y descargar el PDF
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `${process.env.REACT_APP_API_URL}/generate_budget_pdf.php`;
      form.target = '_blank';
      
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'data';
      input.value = JSON.stringify(datosPresupuesto);
      
      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);

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

      dispatch(isFetchingComplete());

      return response;
    } catch (error: any) { // TODO: Hacer tipo de dato para el error
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

// SUBIR FOTO
export const subirFotoAsync = createAsyncThunk(
  'app/subirFoto',
  async ({ reparacionId, file }: { reparacionId: string, file: File }, { dispatch }) => {
    try {
      dispatch(isFetchingStart());

      // Crear un Blob a partir del archivo para evitar problemas de referencia
      const fileBlob = new Blob([await file.arrayBuffer()], { type: file.type });

      // Generar un nombre único para el archivo usando timestamp y manteniendo la extensión
      const extIndex = file.name.lastIndexOf('.');
      const baseName = extIndex !== -1 ? file.name.substring(0, extIndex) : file.name;
      const ext = extIndex !== -1 ? file.name.substring(extIndex) : '';
      const timestamp = Date.now();
      const fileName = `${baseName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}${ext}`;
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

      // Generar un nombre único para el archivo usando timestamp y manteniendo la extensión
      const extIndexDoc = file.name.lastIndexOf('.');
      const baseNameDoc = extIndexDoc !== -1 ? file.name.substring(0, extIndexDoc) : file.name;
      const extDoc = extIndexDoc !== -1 ? file.name.substring(extIndexDoc) : '';
      const timestampDoc = Date.now();
      const fileNameDoc = `${baseNameDoc.replace(/[^a-zA-Z0-9]/g, '_')}_${timestampDoc}${extDoc}`;
      const pathDoc = `REPARACIONES/${reparacionId}/documentos/${fileNameDoc}`;

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