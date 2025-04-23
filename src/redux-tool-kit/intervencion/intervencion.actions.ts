import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  eliminarIntervencionPersistencia,
  getIntervencionPersistencia,
  getIntervencionesPorModeloDronePersistencia,
  guardarIntervencionPersistencia,
  getIntervencionesPersistencia,
} from "../../persistencia/persistenciaFirebase";
import { isFetchingComplete, isFetchingStart } from "../app/app.slice";
import { Intervencion } from "../../types/intervencion";
import { RootState } from '../store';

// ELIMINAR INTERVENCIÓN
export const eliminarIntervencionAsync = createAsyncThunk(
  'intervencion/eliminarIntervencion',
  async (id: string, { dispatch }) => {
    try {
      dispatch(isFetchingStart());
      // La verificación de dependencias ahora se hace en la función de persistencia
      const intervencionEliminada = await eliminarIntervencionPersistencia(id);
      dispatch(isFetchingComplete());
      return intervencionEliminada;
    } catch (error: any) {
      console.error("Error al eliminar intervención:", error);
      dispatch(isFetchingComplete());
      throw error; // Propagamos el error para que se maneje correctamente como "rejected"
    }
  },
)

// GUARDAR INTERVENCIÓN
export const guardarIntervencionAsync = createAsyncThunk(
  'intervencion/guardarIntervencion',
  async (intervencion: Intervencion, { dispatch }) => {
    try {
      dispatch(isFetchingStart());
      const intervencionGuardada = await guardarIntervencionPersistencia(intervencion);
      dispatch(isFetchingComplete());
      return intervencionGuardada;
    } catch (error: any) { // TODO: Hacer tipo de dato para el error
      dispatch(isFetchingComplete());
      return error;
    }
  },
);

// GET Intervención por id
export const getIntervencionAsync = createAsyncThunk(
  'intervencion/getIntervencion',
  async (id: string, { dispatch }) => {
    try {
      dispatch(isFetchingStart());
      const intervencion = await getIntervencionPersistencia(id);
      dispatch(isFetchingComplete());
      return intervencion;
    } catch (error: any) { // TODO: Hacer tipo de dato para el error
      dispatch(isFetchingComplete());
      return error;
    }
  },
);

// GET Intervenciones por modelo de drone
export const getIntervencionesPorModeloDroneAsync = createAsyncThunk(
  'app/getIntervencionesPorModeloDrone',
  async (modeloDroneId: string, { dispatch }) => {
    try {
      dispatch(isFetchingStart());
      const intervenciones = await getIntervencionesPorModeloDronePersistencia(modeloDroneId);
      dispatch(isFetchingComplete());
      return intervenciones;
    } catch (error: any) { // TODO: Hacer tipo de dato para el error
      dispatch(isFetchingComplete());
      return error;
    }
  },
);
