import { createAsyncThunk, Unsubscribe } from "@reduxjs/toolkit";
import { ReparacionType } from "../../types/reparacion";
import { setReparaciones, setIntervencionesDeReparacionActual } from "./reparacion.slice";
import { 
  eliminarReparacionPersistencia, 
  getReparacionesPersistencia, 
  getReparacionPersistencia, 
  guardarPresupuestoPersistencia,
  guardarReparacionPersistencia, 
  getIntervencionesPorReparacionPersistencia, 
  agregarIntervencionAReparacionPersistencia, 
  eliminarIntervencionDeReparacionPersistencia 
} from "../../persistencia/persistencia";
import { AppState, isFetchingComplete, isFetchingStart } from "../app/app.slice";
import { Usuario } from "../../types/usuario";
import { enviarReciboAsync } from "../app/app.actions";
import { generarAutoDiagnostico } from "../../utils/utils";

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
    async (presupuesto: {
        reparacion: ReparacionType,
        usuario: Usuario,
    }, { dispatch }) => {

        dispatch(isFetchingStart());
        try {
            await guardarPresupuestoPersistencia(presupuesto);
            await dispatch(enviarReciboAsync(presupuesto.reparacion));
            dispatch(isFetchingComplete());
            return presupuesto;
        } catch (error: unknown) { // TODO: Hacer tipo de dato para el error
            dispatch(isFetchingComplete());
            throw error;
        }
    },
);

// GUARDA Transito
export const guardarTransitoAsync = createAsyncThunk(
  'app/guardarPresupuesto',
  async (presupuesto: {
      reparacion: ReparacionType,
      usuario: Usuario,
  }, { dispatch }) => {
      dispatch(isFetchingStart());
      try {
          await guardarPresupuestoPersistencia(presupuesto);
          dispatch(isFetchingComplete());
          return presupuesto;
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
  async ({reparacionId, intervencionId}: {reparacionId: string, intervencionId: string}, { dispatch }) => {
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
  async ({reparacionId, intervencionId}: {reparacionId: string, intervencionId: string}, { dispatch }) => {
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
