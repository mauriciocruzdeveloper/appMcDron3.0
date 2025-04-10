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
import { setIntervenciones } from "./intervencion.slice";

// ELIMINAR INTERVENCIÓN
export const eliminarIntervencionAsync = createAsyncThunk(
  'app/eliminarIntervencion',
  async (id: string, { dispatch }) => {
    try {
      dispatch(isFetchingStart());
      const intervencionEliminada = await eliminarIntervencionPersistencia(id);
      console.log("!!! intervencionEliminada", intervencionEliminada);
      dispatch(isFetchingComplete());
      return intervencionEliminada;
    } catch (error: any) {
      console.log("!!! error", error);
      dispatch(isFetchingComplete());
      throw error;
    }
  },
)

// GUARDAR INTERVENCIÓN
export const guardarIntervencionAsync = createAsyncThunk(
  'app/guardarIntervencion',
  async (intervencion: Intervencion, { dispatch }) => {
    try {
      dispatch(isFetchingStart());
      const intervencionGuardada = await guardarIntervencionPersistencia(intervencion);
      dispatch(isFetchingComplete());
      return intervencionGuardada;
    } catch (error: any) {
      dispatch(isFetchingComplete());
      return error;
    }
  },
);

// GET Intervención por id
export const getIntervencionAsync = createAsyncThunk(
  'app/getIntervencion',
  async (id: string, { dispatch }) => {
    try {
      dispatch(isFetchingStart());
      const intervencion = await getIntervencionPersistencia(id);
      dispatch(isFetchingComplete());
      return intervencion;
    } catch (error: any) {
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
    } catch (error: any) {
      dispatch(isFetchingComplete());
      return error;
    }
  },
);
