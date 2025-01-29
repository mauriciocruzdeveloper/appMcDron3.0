import { createAsyncThunk, Unsubscribe } from "@reduxjs/toolkit";
import { ReparacionType } from "../../types/reparacion";
import { setReparaciones } from "./reparacion.slice";
import { eliminarReparacionPersistencia, getReparacionesPersistencia, getReparacionPersistencia, guardarPresupuestoPersistencia, guardarReparacionPersistencia } from "../../persistencia/persistenciaFirebase";
import { AppState, isFetchingComplete, isFetchingStart } from "../app/app.slice";
import { Usuario } from "../../types/usuario";

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
        } catch (error: any) {
        return;
        }
    },
)

// GUARDA Presupuesto
export const guardarPresupuestoAsync = createAsyncThunk(
    'app/guardarPresupuesto',
    async (presupuesto: {
        reparacion: ReparacionType,
        usuario: Usuario,
    }, { dispatch }) => {
        console.log("guardarPresupuestoAsync()");
        dispatch(isFetchingStart());
        try {
            await guardarPresupuestoPersistencia(presupuesto);
            dispatch(isFetchingComplete());
            return presupuesto;
        } catch (error: any) {
            dispatch(isFetchingComplete());
            return error;
        }
    },
);

// GUARDA REPARACION
export const guardarReparacionAsync = createAsyncThunk(
    'app/guardarReparacion',
    async (reparacion: ReparacionType, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            const reparacionGuardada = await guardarReparacionPersistencia(reparacion);
            dispatch(isFetchingComplete());
            return reparacionGuardada;
        } catch (error: any) {
            dispatch(isFetchingComplete());
            return error;
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
        } catch (error: any) {
            dispatch(isFetchingComplete());
            return error;
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
        } catch (error: any) {
            dispatch(isFetchingComplete());
            return error;
        }
    },
);
