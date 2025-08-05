import { createAsyncThunk, isRejectedWithValue, Unsubscribe } from "@reduxjs/toolkit";
import { ReparacionType } from "../../types/reparacion";
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
import { enviarReciboAsync } from "../app/app.actions";
import { generarAutoDiagnostico } from "../../utils/utils";
import { PresupuestoProps } from "../../components/Presupuesto.component";

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
  async (presupuesto: PresupuestoProps, { dispatch, rejectWithValue }) => {
    const reparacion: ReparacionType = {
      id: "",
      data: {
        DescripcionUsuRep: presupuesto.DescripcionUsuRep,
        FeRecRep: presupuesto.FeRecRep,
        EstadoRep: presupuesto.EstadoRep,
        PrioridadRep: presupuesto.PrioridadRep,
        FeConRep: presupuesto.FeConRep,
        UsuarioRep: presupuesto.EmailUsu,
        DroneRep: presupuesto.DroneRep,
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
      }
    }

    dispatch(isFetchingStart());
    try {
      // 1. Primero guardar el usuario
      const { guardarUsuarioPersistencia } = await import('../../persistencia/persistencia');
      const usuarioGuardado = await guardarUsuarioPersistencia(usuario);
      reparacion.data.UsuarioRep = usuarioGuardado.id.toString();
      const reparacionGuardada = await guardarReparacionPersistencia(reparacion);
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
  async (presupuesto: PresupuestoProps, { dispatch }) => {
    const reparacion: ReparacionType = {
      id: "",
      data: {
        DescripcionUsuRep: presupuesto.DescripcionUsuRep,
        EstadoRep: presupuesto.EstadoRep,
        PrioridadRep: presupuesto.PrioridadRep,
        FeConRep: presupuesto.FeConRep,
        UsuarioRep: presupuesto.EmailUsu,
        DroneId: presupuesto.DroneId,
        DroneRep: presupuesto.DroneRep,
      }
    }
    const usuario: Usuario = {
      id: presupuesto.EmailUsu,
      data: {
        EmailUsu: presupuesto.EmailUsu,
        NombreUsu: presupuesto.NombreUsu,
        ApellidoUsu: presupuesto.ApellidoUsu,
        TelefonoUsu: presupuesto.TelefonoUsu,
        ProvinciaUsu: presupuesto.ProvinciaUsu,
        CiudadUsu: presupuesto.CiudadUsu,
      }
    }

    dispatch(isFetchingStart());
    try {
      const { guardarUsuarioPersistencia } = await import('../../persistencia/persistencia');
      const usuarioGuardado = await guardarUsuarioPersistencia(usuario);
      reparacion.data.UsuarioRep = usuarioGuardado.id.toString();
      const reparacionGuardada = await guardarReparacionPersistencia(reparacion);
      dispatch(isFetchingComplete());
      return { reparacion: reparacionGuardada, usuario: usuarioGuardado };
    } catch (error: unknown) { // TODO: Hacer tipo de dato para el error
      dispatch(isFetchingComplete());
      throw error;
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
