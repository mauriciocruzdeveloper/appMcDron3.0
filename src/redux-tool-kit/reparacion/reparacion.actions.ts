import { createAsyncThunk, Unsubscribe } from "@reduxjs/toolkit";
import { ReparacionType, DataReparacion } from "../../types/reparacion";
import { setReparaciones, setIntervencionesDeReparacionActual } from "./reparacion.slice";
import {
  eliminarReparacionPersistencia,
  getReparacionesPersistencia,
  getReparacionPersistencia,
  guardarReparacionPersistencia,
  getIntervencionesPorReparacionPersistencia,
  agregarIntervencionAReparacionPersistencia,
  eliminarIntervencionDeReparacionPersistencia
} from "../../persistencia/persistencia";
import { AppState, isFetchingComplete, isFetchingStart } from "../app/app.slice";
import { Usuario } from "../../types/usuario";
import { enviarDroneDiagnosticadoAsync, enviarDroneReparadoAsync, enviarReciboAsync } from "../app/app.actions";
import { generarAutoDiagnostico, generarNombreUnico, generarPasswordPorDefecto } from "../../utils/utils";
import { PresupuestoProps } from "../../components/Presupuesto.component";
import { Drone } from "../../types/drone";
import { RootState } from "../store";

// OBTENER REPARACIONES
export const getReparacionesAsync = createAsyncThunk(
  'app/getReparaciones',
  async (arg, { dispatch, getState }) => {
    try {
      const callbackReparaciones = (reparaciones: ReparacionType[]) => {
        dispatch(setReparaciones(reparaciones));
      }
      const state = getState() as { app: AppState };
      const usuario = state.app.usuario;
      const unsubscribe = getReparacionesPersistencia(callbackReparaciones, usuario);
      return unsubscribe as Unsubscribe;
    } catch (error: unknown) { // TODO: Hacer tipo de dato para el error
      return;
    }
  },
)

// GUARDA Recibo
export const guardarReciboAsync = createAsyncThunk(
  'app/guardarPresupuesto',
  async (presupuesto: PresupuestoProps, { dispatch, rejectWithValue, getState }) => {
    const state = getState() as RootState;
    const drones = state.drone.coleccionDrones;
    const dronesArray = Object.values(drones);

    const reparacion: ReparacionType = {
      id: "",
      data: {
        DescripcionUsuRep: presupuesto.DescripcionUsuRep,
        FeRecRep: presupuesto.FeRecRep,
        EstadoRep: presupuesto.EstadoRep,
        PrioridadRep: presupuesto.PrioridadRep,
        FeConRep: presupuesto.FeConRep,
        UsuarioRep: presupuesto.EmailUsu,
        DroneId: presupuesto.DroneId,
        ModeloDroneNameRep: presupuesto.ModeloDroneNameRep,
      }
    }
    const usuario: Usuario = {
      id: presupuesto.UsuarioRep,
      data: {
        EmailUsu: presupuesto.EmailUsu,
        NombreUsu: presupuesto.NombreUsu,
        ApellidoUsu: presupuesto.ApellidoUsu,
        TelefonoUsu: presupuesto.TelefonoUsu,
        ProvinciaUsu: presupuesto.ProvinciaUsu,
        CiudadUsu: presupuesto.CiudadUsu,
        Role: 'cliente', // Por defecto, los usuarios creados desde recibo son clientes
        PasswordUsu: generarPasswordPorDefecto(presupuesto.NombreUsu), // Contraseña generada automáticamente
      }
    }
    const drone: Drone = {
      id: presupuesto.DroneId,
      data: {
        ModeloDroneId: presupuesto.ModeloDroneIdRep,
        Nombre: generarNombreUnico(dronesArray, presupuesto.ModeloDroneNameRep, presupuesto.NombreUsu, presupuesto.ApellidoUsu),
        Propietario: '',
        NumeroSerie: '',
        Observaciones: '',
      }
    }

    dispatch(isFetchingStart());
    try {
      // 1. Primero guardar el usuario
      const { guardarUsuarioPersistencia } = await import('../../persistencia/persistencia');
      const usuarioGuardado = await guardarUsuarioPersistencia(usuario);

      // 2. Guardar el drone
      const { guardarDronePersistencia } = await import('../../persistencia/persistencia');
      drone.data.Propietario = usuarioGuardado.id;
      const droneGuardado = await guardarDronePersistencia(drone);

      // 3. Guardar la reparación con el usuario y drone guardados
      reparacion.data.UsuarioRep = usuarioGuardado.id.toString();
      reparacion.data.DroneId = droneGuardado.id.toString();
      const reparacionGuardada = await guardarReparacionPersistencia(reparacion);

      // 4. Enviar el recibo
      const response = await dispatch(enviarReciboAsync({
        ...reparacionGuardada,
        data: {
          ...reparacionGuardada.data,
          NombreUsu: `${presupuesto.NombreUsu} ${presupuesto.ApellidoUsu}`,
          TelefonoUsu: presupuesto.TelefonoUsu,
          EmailUsu: presupuesto.EmailUsu,
        },
      }));
      if (response.meta.requestStatus === 'rejected') {
        dispatch(isFetchingComplete());
        return rejectWithValue('Error al enviar recibo');
      }
      dispatch(isFetchingComplete());
      return { reparacion: reparacionGuardada, usuario: usuarioGuardado };
    } catch (error: unknown) { // TODO: Hacer tipo de dato para el error
      dispatch(isFetchingComplete());
      return rejectWithValue(error);
    }
  },
);

// GUARDA Transito
export const guardarTransitoAsync = createAsyncThunk(
  'app/guardarTransito',
  async (presupuesto: PresupuestoProps, { dispatch, rejectWithValue, getState }) => {
    const state = getState() as RootState;
    const drones = state.drone.coleccionDrones;
    const dronesArray = Object.values(drones);

    const reparacion: ReparacionType = {
      id: "",
      data: {
        DescripcionUsuRep: presupuesto.DescripcionUsuRep,
        EstadoRep: presupuesto.EstadoRep,
        PrioridadRep: presupuesto.PrioridadRep,
        FeConRep: presupuesto.FeConRep,
        UsuarioRep: presupuesto.EmailUsu,
        DroneId: presupuesto.DroneId,
        ModeloDroneNameRep: presupuesto.ModeloDroneNameRep,
      }
    }
    const usuario: Usuario = {
      id: presupuesto.UsuarioRep,
      data: {
        EmailUsu: presupuesto.EmailUsu,
        NombreUsu: presupuesto.NombreUsu,
        ApellidoUsu: presupuesto.ApellidoUsu,
        TelefonoUsu: presupuesto.TelefonoUsu,
        ProvinciaUsu: presupuesto.ProvinciaUsu,
        CiudadUsu: presupuesto.CiudadUsu,
        Role: 'cliente', // Por defecto, los usuarios creados desde tránsito son clientes
        PasswordUsu: generarPasswordPorDefecto(presupuesto.NombreUsu), // Contraseña generada automáticamente
      }
    }
    const drone: Drone = {
      id: presupuesto.DroneId,
      data: {
        ModeloDroneId: presupuesto.ModeloDroneIdRep,
        Nombre: generarNombreUnico(dronesArray, presupuesto.ModeloDroneNameRep, presupuesto.NombreUsu, presupuesto.ApellidoUsu),
        Propietario: '',
        NumeroSerie: '',
        Observaciones: '',
      }
    }

    dispatch(isFetchingStart());
    try {
      // 1. Primero guardar el usuario
      const { guardarUsuarioPersistencia } = await import('../../persistencia/persistencia');
      const usuarioGuardado = await guardarUsuarioPersistencia(usuario);

      // 2. Guardar el drone
      const { guardarDronePersistencia } = await import('../../persistencia/persistencia');
      drone.data.Propietario = usuarioGuardado.id;
      const droneGuardado = await guardarDronePersistencia(drone);

      // 3. Guardar la reparación con el usuario y drone guardados
      reparacion.data.UsuarioRep = usuarioGuardado.id.toString();
      reparacion.data.DroneId = droneGuardado.id.toString();
      const reparacionGuardada = await guardarReparacionPersistencia(reparacion);

      dispatch(isFetchingComplete());
      return { reparacion: reparacionGuardada, usuario: usuarioGuardado };
    } catch (error: unknown) { // TODO: Hacer tipo de dato para el error
      dispatch(isFetchingComplete());
      return rejectWithValue(error);
    }
  },
);

// GUARDA REPARACION
export const guardarReparacionAsync = createAsyncThunk(
  'app/guardarReparacion',
  async (reparacion: ReparacionType, { dispatch }) => {
    try {
      dispatch(isFetchingStart());
      let diagnostico = '';
      if (reparacion.data.EstadoRep === 'Revisado' && !reparacion.data.DiagnosticoRep) {
        diagnostico = await dispatch(generarAutoDiagnostico(reparacion));
      }
      const newReparacion = {
        ...reparacion,
        data: {
          ...reparacion.data,
          DiagnosticoRep: diagnostico || reparacion.data.DiagnosticoRep,
        },
      }
      const reparacionGuardada = await guardarReparacionPersistencia(newReparacion);
      dispatch(isFetchingComplete());
      return reparacionGuardada;
    } catch (error: unknown) { // TODO: Hacer tipo de dato para el error
      dispatch(isFetchingComplete());
      console.error(error);
      throw error;
    }
  },
);

// ELIMINAR REPARACION
export const eliminarReparacionAsync = createAsyncThunk(
  'app/eliminarReparacion',
  async (id: string, { dispatch }) => {
    try {
      dispatch(isFetchingStart());
      const reparacionEliminada = await eliminarReparacionPersistencia(id);
      dispatch(isFetchingComplete());
      return reparacionEliminada;
    } catch (error: unknown) { // TODO: Hacer tipo de dato para el error
      console.error(error);
      dispatch(isFetchingComplete());
      throw error;
    }
  },
)

// GET Reparación por id
export const getReparacionAsync = createAsyncThunk(
  'app/getReparacion',
  async (id: string, { dispatch }) => {
    try {
      dispatch(isFetchingStart());
      const reparacion = await getReparacionPersistencia(id);
      dispatch(isFetchingComplete());
      return reparacion;
    } catch (error: unknown) { // TODO: Hacer tipo de dato para el error
      dispatch(isFetchingComplete());
      throw error;
    }
  },
);

// GET Intervenciones de una Reparación
export const getIntervencionesPorReparacionAsync = createAsyncThunk(
  'app/getIntervencionesPorReparacion',
  async (reparacionId: string, { dispatch }) => {
    try {
      dispatch(isFetchingStart());
      const intervenciones = await getIntervencionesPorReparacionPersistencia(reparacionId);
      dispatch(setIntervencionesDeReparacionActual(intervenciones));
      dispatch(isFetchingComplete());
      return intervenciones;
    } catch (error: unknown) { // TODO: Hacer tipo de dato para el error
      dispatch(isFetchingComplete());
      throw error;
    }
  },
);

// Agregar Intervención a una Reparación
export const agregarIntervencionAReparacionAsync = createAsyncThunk(
  'app/agregarIntervencionAReparacion',
  async ({ reparacionId, intervencionId }: { reparacionId: string, intervencionId: string }, { dispatch }) => {
    try {
      dispatch(isFetchingStart());
      await agregarIntervencionAReparacionPersistencia(reparacionId, intervencionId);
      // Recargar intervenciones
      await dispatch(getIntervencionesPorReparacionAsync(reparacionId));
      dispatch(isFetchingComplete());
      return true;
    } catch (error: unknown) { // TODO: Hacer tipo de dato para el error
      dispatch(isFetchingComplete());
      throw error;
    }
  },
);

// Eliminar Intervención de una Reparación
export const eliminarIntervencionDeReparacionAsync = createAsyncThunk(
  'app/eliminarIntervencionDeReparacion',
  async ({ reparacionId, intervencionId }: { reparacionId: string, intervencionId: string }, { dispatch }) => {
    try {
      dispatch(isFetchingStart());
      await eliminarIntervencionDeReparacionPersistencia(reparacionId, intervencionId);
      // Recargar intervenciones
      await dispatch(getIntervencionesPorReparacionAsync(reparacionId));
      dispatch(isFetchingComplete());
      return true;
    } catch (error: unknown) { // TODO: Hacer tipo de dato para el error
      dispatch(isFetchingComplete());
      throw error;
    }
  },
);

// Cambiar estado de una asignación de intervención
export const cambiarEstadoAsignacionAsync = createAsyncThunk(
  'reparacion/cambiarEstadoAsignacion',
  async ({ asignacionId, nuevoEstado }: { asignacionId: string, nuevoEstado: string }, { dispatch, getState }) => {
    try {
      dispatch(isFetchingStart());
      
      const { actualizarEstadoAsignacionPersistencia } = await import('../../persistencia/persistencia');
      const resultado = await actualizarEstadoAsignacionPersistencia(asignacionId, nuevoEstado);
      
      if (!resultado.success) {
        throw new Error(resultado.error);
      }

      // Obtener la reparación actual para recargar sus intervenciones
      const state = getState() as RootState;
      const asignaciones = state.reparacion.intervencionesDeReparacionActual;
      const asignacion = asignaciones.find(a => a.id === asignacionId);
      
      if (asignacion) {
        await dispatch(getIntervencionesPorReparacionAsync(asignacion.data.reparacionId));
      }
      
      dispatch(isFetchingComplete());
      return resultado.data;
    } catch (error: unknown) {
      dispatch(isFetchingComplete());
      throw error;
    }
  },
);

// Actualizar descripción de una asignación de intervención
export const actualizarDescripcionAsignacionAsync = createAsyncThunk(
  'reparacion/actualizarDescripcionAsignacion',
  async ({ asignacionId, descripcion }: { asignacionId: string, descripcion: string }, { dispatch, getState }) => {
    try {
      dispatch(isFetchingStart());
      
      const { actualizarDescripcionAsignacionPersistencia } = await import('../../persistencia/persistencia');
      const resultado = await actualizarDescripcionAsignacionPersistencia(asignacionId, descripcion);
      
      if (!resultado.success) {
        throw new Error(resultado.error);
      }

      // Recargar las intervenciones de la reparación
      const state = getState() as RootState;
      const asignaciones = state.reparacion.intervencionesDeReparacionActual;
      const asignacion = asignaciones.find(a => a.id === asignacionId);
      
      if (asignacion) {
        await dispatch(getIntervencionesPorReparacionAsync(asignacion.data.reparacionId));
      }
      
      dispatch(isFetchingComplete());
      return resultado.data;
    } catch (error: unknown) {
      dispatch(isFetchingComplete());
      throw error;
    }
  },
);

// Actualizar fotos de una asignación de intervención
export const actualizarFotosAsignacionAsync = createAsyncThunk(
  'reparacion/actualizarFotosAsignacion',
  async ({ asignacionId, fotos }: { asignacionId: string, fotos: string[] }, { dispatch, getState }) => {
    try {
      dispatch(isFetchingStart());
      
      const { actualizarFotosAsignacionPersistencia } = await import('../../persistencia/persistencia');
      const resultado = await actualizarFotosAsignacionPersistencia(asignacionId, fotos);
      
      if (!resultado.success) {
        throw new Error(resultado.error);
      }

      // Recargar las intervenciones de la reparación
      const state = getState() as RootState;
      const asignaciones = state.reparacion.intervencionesDeReparacionActual;
      const asignacion = asignaciones.find(a => a.id === asignacionId);
      
      if (asignacion) {
        await dispatch(getIntervencionesPorReparacionAsync(asignacion.data.reparacionId));
      }
      
      dispatch(isFetchingComplete());
      return resultado.data;
    } catch (error: unknown) {
      dispatch(isFetchingComplete());
      throw error;
    }
  },
);

// GUARDA Presupuestado (nuevo estado)
export const guardarPresupuestadoAsync = createAsyncThunk(
  'app/guardarPresupuestado',
  async (presupuesto: PresupuestoProps, { dispatch, rejectWithValue, getState }) => {
    const state = getState() as RootState;
    const drones = state.drone.coleccionDrones;
    const dronesArray = Object.values(drones);

    const reparacion: ReparacionType = {
      id: "",
      data: {
        DescripcionUsuRep: presupuesto.DescripcionUsuRep,
        EstadoRep: presupuesto.EstadoRep,
        PrioridadRep: presupuesto.PrioridadRep,
        FeConRep: presupuesto.FeConRep,
        UsuarioRep: presupuesto.EmailUsu,
        DroneId: presupuesto.DroneId,
        ModeloDroneNameRep: presupuesto.ModeloDroneNameRep,
      }
    }
    const usuario: Usuario = {
      id: presupuesto.UsuarioRep,
      data: {
        EmailUsu: presupuesto.EmailUsu,
        NombreUsu: presupuesto.NombreUsu,
        ApellidoUsu: presupuesto.ApellidoUsu,
        TelefonoUsu: presupuesto.TelefonoUsu,
        ProvinciaUsu: presupuesto.ProvinciaUsu,
        CiudadUsu: presupuesto.CiudadUsu,
        Role: 'cliente', // Por defecto, los usuarios creados desde presupuestado son clientes
        PasswordUsu: generarPasswordPorDefecto(presupuesto.NombreUsu), // Contraseña generada automáticamente
      }
    }
    const drone: Drone = {
      id: presupuesto.DroneId,
      data: {
        ModeloDroneId: presupuesto.ModeloDroneIdRep,
        Nombre: generarNombreUnico(dronesArray, presupuesto.ModeloDroneNameRep, presupuesto.NombreUsu, presupuesto.ApellidoUsu),
        Propietario: '',
        NumeroSerie: '',
        Observaciones: '',
      }
    }

    dispatch(isFetchingStart());
    try {
      // 1. Primero guardar el usuario
      const { guardarUsuarioPersistencia } = await import('../../persistencia/persistencia');
      const usuarioGuardado = await guardarUsuarioPersistencia(usuario);

      // 2. Guardar el drone
      const { guardarDronePersistencia } = await import('../../persistencia/persistencia');
      drone.data.Propietario = usuarioGuardado.id;
      const droneGuardado = await guardarDronePersistencia(drone);

      // 3. Guardar la reparación con el usuario y drone guardados
      reparacion.data.UsuarioRep = usuarioGuardado.id.toString();
      reparacion.data.DroneId = droneGuardado.id.toString();
      const reparacionGuardada = await guardarReparacionPersistencia(reparacion);

      dispatch(isFetchingComplete());
      return { reparacion: reparacionGuardada, usuario: usuarioGuardado };
    } catch (error: unknown) { // TODO: Hacer tipo de dato para el error
      dispatch(isFetchingComplete());
      return rejectWithValue(error);
    }
  },
);

// ACEPTAR Presupuesto
export const aceptarPresupuestoAsync = createAsyncThunk(
  'app/aceptarPresupuesto',
  async (reparacion: ReparacionType, { dispatch, rejectWithValue }) => {
    dispatch(isFetchingStart());
    try {
      const reparacionActualizada = {
        ...reparacion,
        data: {
          ...reparacion.data,
          EstadoRep: "Aceptado",
          PrioridadRep: 1,
        }
      };
      
      const reparacionGuardada = await guardarReparacionPersistencia(reparacionActualizada);
      dispatch(isFetchingComplete());
      return reparacionGuardada;
    } catch (error: unknown) {
      dispatch(isFetchingComplete());
      return rejectWithValue(error);
    }
  }
);

// RECHAZAR Presupuesto
export const rechazarPresupuestoAsync = createAsyncThunk(
  'app/rechazarPresupuesto',
  async (reparacion: ReparacionType, { dispatch, rejectWithValue }) => {
    dispatch(isFetchingStart());
    try {
      const reparacionActualizada = {
        ...reparacion,
        data: {
          ...reparacion.data,
          EstadoRep: "Rechazado",
          PrioridadRep: 1,
        }
      };
      
      const reparacionGuardada = await guardarReparacionPersistencia(reparacionActualizada);
      dispatch(isFetchingComplete());
      return reparacionGuardada;
    } catch (error: unknown) {
      dispatch(isFetchingComplete());
      return rejectWithValue(error);
    }
  }
);

// DIAGNOSTICAR (cuando presupuesto fue rechazado)
export const diagnosticarAsync = createAsyncThunk(
  'app/diagnosticar',
  async (reparacion: ReparacionType, { dispatch, rejectWithValue }) => {
    dispatch(isFetchingStart());
    try {
      const reparacionActualizada = {
        ...reparacion,
        data: {
          ...reparacion.data,
          EstadoRep: "Diagnosticado",
          PrioridadRep: 3,
        }
      };
      
      const reparacionGuardada = await guardarReparacionPersistencia(reparacionActualizada);
      dispatch(isFetchingComplete());
      return reparacionGuardada;
    } catch (error: unknown) {
      dispatch(isFetchingComplete());
      return rejectWithValue(error);
    }
  }
);

// COBRAR Reparación (después de reparado)
export const cobrarReparacionAsync = createAsyncThunk(
  'app/cobrarReparacion',
  async (reparacion: ReparacionType, { dispatch, rejectWithValue }) => {
    dispatch(isFetchingStart());
    try {
      const reparacionActualizada = {
        ...reparacion,
        data: {
          ...reparacion.data,
          EstadoRep: "Cobrado",
          PrioridadRep: 4,
        }
      };
      
      const reparacionGuardada = await guardarReparacionPersistencia(reparacionActualizada);
      dispatch(isFetchingComplete());
      return reparacionGuardada;
    } catch (error: unknown) {
      dispatch(isFetchingComplete());
      return rejectWithValue(error);
    }
  }
);

// MIGRAR Estado Legacy
export const migrarEstadoLegacyAsync = createAsyncThunk(
  'app/migrarEstadoLegacy',
  async ({ reparacionId, nuevoEstado }: { reparacionId: string, nuevoEstado: string }, { dispatch, rejectWithValue }) => {
    dispatch(isFetchingStart());
    try {
      // Primero obtener la reparación actual
      const reparacionActual = await getReparacionPersistencia(reparacionId);
      
      const reparacionActualizada = {
        ...reparacionActual,
        data: {
          ...reparacionActual.data,
          EstadoRep: nuevoEstado,
          // Ajustar prioridad según el nuevo estado
          PrioridadRep: nuevoEstado === "Aceptado" ? 1 : 
                        nuevoEstado === "Reparado" ? 3 :
                        nuevoEstado === "Finalizado" ? 10 :
                        nuevoEstado === "Cancelado" ? 10 :
                        nuevoEstado === "Abandonado" ? 10 : 5,
        }
      };
      
      const reparacionGuardada = await guardarReparacionPersistencia(reparacionActualizada);
      dispatch(isFetchingComplete());
      return reparacionGuardada;
    } catch (error: unknown) {
      dispatch(isFetchingComplete());
      return rejectWithValue(error);
    }
  }
);

// ============================================================================
// NUEVAS ACCIONES PARA REFACTORIZACIÓN
// ============================================================================

/**
 * Actualiza un campo específico de la reparación
 * Esta acción encapsula la lógica de actualización de campos individuales
 */
export const actualizarCampoReparacionAsync = createAsyncThunk(
  'reparacion/actualizarCampo',
  async ({ 
    reparacionId, 
    campo, 
    valor 
  }: { 
    reparacionId: string; 
    campo: keyof DataReparacion; 
    valor: any 
  }, { dispatch, rejectWithValue, getState }) => {
    try {
      dispatch(isFetchingStart());
      const state = getState() as RootState;
      const reparacionActual = state.reparacion.coleccionReparaciones[reparacionId];
      
      if (!reparacionActual) {
        throw new Error('Reparación no encontrada');
      }

      const reparacionActualizada = {
        ...reparacionActual,
        data: {
          ...reparacionActual.data,
          [campo]: valor
        }
      };

      const reparacionGuardada = await guardarReparacionPersistencia(reparacionActualizada);
      dispatch(isFetchingComplete());
      return reparacionGuardada;
    } catch (error: unknown) {
      dispatch(isFetchingComplete());
      return rejectWithValue(error);
    }
  }
);

/**
 * Cambia el estado de una reparación con toda la lógica de negocio
 * Incluye: validaciones, seteo automático de fechas, generación de diagnóstico, envío de emails
 */
export const cambiarEstadoReparacionAsync = createAsyncThunk(
  'reparacion/cambiarEstado',
  async ({ 
    reparacionId, 
    nuevoEstado,
    enviarEmail = false
  }: { 
    reparacionId: string; 
    nuevoEstado: string;
    enviarEmail?: boolean;
  }, { dispatch, rejectWithValue, getState }) => {
    try {
      dispatch(isFetchingStart());
      const state = getState() as RootState;
      const reparacionActual = state.reparacion.coleccionReparaciones[reparacionId];
      
      if (!reparacionActual) {
        throw new Error('Reparación no encontrada');
      }

      const { estados } = await import('../../datos/estados');
      const estadoDestino = estados[nuevoEstado];

      if (!estadoDestino) {
        throw new Error(`Estado desconocido: ${nuevoEstado}`);
      }

      // Determinar el campo de fecha a actualizar
      type CampoFecha = 'FeConRep' | 'FeFinRep' | 'FeRecRep' | 'FeEntRep';
      let campoFecha: CampoFecha | null = null;
      let usedDeliveryDateAsFallback = false;
      
      switch (nuevoEstado) {
        case "Consulta":
          campoFecha = "FeConRep";
          break;
        case "Recibido":
          campoFecha = "FeRecRep";
          break;
        case "Reparado":
          campoFecha = "FeFinRep";
          break;
        case "Finalizado":
          campoFecha = "FeEntRep";
          break;
      }

      // Preparar la actualización
      const dataActualizada = {
        ...reparacionActual.data,
        EstadoRep: nuevoEstado,
        PrioridadRep: estadoDestino.prioridad,
      };

      // Setear fecha si corresponde y no está ya seteada
      if (campoFecha && !dataActualizada[campoFecha]) {
        dataActualizada[campoFecha] = new Date().getTime();
      }

      // ⚡ LÓGICA ESPECIAL PARA REPARADO: completion_date es OBLIGATORIA
      if (nuevoEstado === 'Reparado' && !dataActualizada.FeFinRep) {
        dataActualizada.FeFinRep = new Date().getTime();
      }

      // ⚡ LÓGICA ESPECIAL PARA FINALIZADO: completion_date y delivery_date son OBLIGATORIAS
      if (nuevoEstado === 'Finalizado') {
        // Asegurar que tiene delivery_date
        if (!dataActualizada.FeEntRep) {
          dataActualizada.FeEntRep = new Date().getTime();
        }

        // Si no tiene completion_date, usar delivery_date como fallback
        if (!dataActualizada.FeFinRep) {
          dataActualizada.FeFinRep = dataActualizada.FeEntRep;
          usedDeliveryDateAsFallback = true;
        }
      }

      let reparacionActualizada = {
        ...reparacionActual,
        data: dataActualizada
      };

      // Generar diagnóstico automático si es necesario
      if (nuevoEstado === 'Recibido' && !reparacionActualizada.data.DiagnosticoRep) {
        const diagnostico = await dispatch(generarAutoDiagnostico(reparacionActualizada));
        reparacionActualizada = {
          ...reparacionActualizada,
          data: {
            ...reparacionActualizada.data,
            DiagnosticoRep: diagnostico as string
          }
        };
      }

      // Guardar la reparación
      const reparacionGuardada = await guardarReparacionPersistencia(reparacionActualizada);

      // Enviar emails según el estado si se solicita
      if (enviarEmail) {
        switch (nuevoEstado) {
          case 'Recibido':
            await dispatch(enviarReciboAsync(reparacionGuardada));
            break;
          case 'Reparado':
            await dispatch(enviarDroneReparadoAsync(reparacionGuardada));
            break;
          case 'Diagnosticado':
            await dispatch(enviarDroneDiagnosticadoAsync(reparacionGuardada));
            break;
        }
      }

      dispatch(isFetchingComplete());
      return { 
        reparacion: reparacionGuardada, 
        usedDeliveryDateAsFallback 
      };
    } catch (error: unknown) {
      dispatch(isFetchingComplete());
      return rejectWithValue(error);
    }
  }
);

/**
 * Actualiza el precio final de la reparación basándose en las intervenciones
 */
export const actualizarPrecioFinalAsync = createAsyncThunk(
  'reparacion/actualizarPrecioFinal',
  async ({ 
    reparacionId, 
    totalIntervenciones 
  }: { 
    reparacionId: string; 
    totalIntervenciones: number;
  }, { dispatch, rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const reparacionActual = state.reparacion.coleccionReparaciones[reparacionId];
      
      if (!reparacionActual) {
        throw new Error('Reparación no encontrada');
      }

      // Solo actualizar si no hay un precio manual establecido
      if (reparacionActual.data.PresuFiRep && reparacionActual.data.PresuFiRep > 0) {
        return reparacionActual; // Ya tiene un precio, no sobrescribir
      }

      const reparacionActualizada = {
        ...reparacionActual,
        data: {
          ...reparacionActual.data,
          PresuFiRep: totalIntervenciones
        }
      };

      const reparacionGuardada = await guardarReparacionPersistencia(reparacionActualizada);
      return reparacionGuardada;
    } catch (error: unknown) {
      return rejectWithValue(error);
    }
  }
);

/**
 * Selecciona/deselecciona una foto como "Antes" de la reparación
 */
export const seleccionarFotoAntesAsync = createAsyncThunk(
  'reparacion/seleccionarFotoAntes',
  async ({ 
    reparacionId, 
    fotoUrl 
  }: { 
    reparacionId: string; 
    fotoUrl: string;
  }, { dispatch, rejectWithValue, getState }) => {
    try {
      dispatch(isFetchingStart());
      const state = getState() as RootState;
      const reparacionActual = state.reparacion.coleccionReparaciones[reparacionId];
      
      if (!reparacionActual) {
        throw new Error('Reparación no encontrada');
      }

      const reparacionActualizada = {
        ...reparacionActual,
        data: {
          ...reparacionActual.data,
          FotoAntes: reparacionActual.data.FotoAntes === fotoUrl ? undefined : fotoUrl
        }
      };

      const reparacionGuardada = await guardarReparacionPersistencia(reparacionActualizada);
      dispatch(isFetchingComplete());
      return reparacionGuardada;
    } catch (error: unknown) {
      dispatch(isFetchingComplete());
      return rejectWithValue(error);
    }
  }
);

/**
 * Selecciona/deselecciona una foto como "Después" de la reparación
 */
export const seleccionarFotoDespuesAsync = createAsyncThunk(
  'reparacion/seleccionarFotoDespues',
  async ({ 
    reparacionId, 
    fotoUrl 
  }: { 
    reparacionId: string; 
    fotoUrl: string;
  }, { dispatch, rejectWithValue, getState }) => {
    try {
      dispatch(isFetchingStart());
      const state = getState() as RootState;
      const reparacionActual = state.reparacion.coleccionReparaciones[reparacionId];
      
      if (!reparacionActual) {
        throw new Error('Reparación no encontrada');
      }

      const reparacionActualizada = {
        ...reparacionActual,
        data: {
          ...reparacionActual.data,
          FotoDespues: reparacionActual.data.FotoDespues === fotoUrl ? undefined : fotoUrl
        }
      };

      const reparacionGuardada = await guardarReparacionPersistencia(reparacionActualizada);
      dispatch(isFetchingComplete());
      return reparacionGuardada;
    } catch (error: unknown) {
      dispatch(isFetchingComplete());
      return rejectWithValue(error);
    }
  }
);

/**
 * Genera automáticamente el diagnóstico y lo guarda en la reparación
 */
export const generarYGuardarDiagnosticoAsync = createAsyncThunk(
  'reparacion/generarYGuardarDiagnostico',
  async (reparacionId: string, { dispatch, rejectWithValue, getState }) => {
    try {
      dispatch(isFetchingStart());
      const state = getState() as RootState;
      const reparacionActual = state.reparacion.coleccionReparaciones[reparacionId];
      
      if (!reparacionActual) {
        throw new Error('Reparación no encontrada');
      }

      const diagnostico = await dispatch(generarAutoDiagnostico(reparacionActual));

      const reparacionActualizada = {
        ...reparacionActual,
        data: {
          ...reparacionActual.data,
          DiagnosticoRep: diagnostico as string
        }
      };

      const reparacionGuardada = await guardarReparacionPersistencia(reparacionActualizada);
      dispatch(isFetchingComplete());
      return reparacionGuardada;
    } catch (error: unknown) {
      dispatch(isFetchingComplete());
      return rejectWithValue(error);
    }
  }
);
