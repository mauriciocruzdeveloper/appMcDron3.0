import { createAsyncThunk, Unsubscribe } from "@reduxjs/toolkit";
import { ReparacionType } from "../../types/reparacion";
import { setReparaciones } from "./reparacion.slice";
import { getReparacionesPersistencia, guardarReparacionPersistencia } from "../../persistencia/persistenciaFirebase";
import { AppState, isFetchingComplete, isFetchingStart } from "../app/app.slice";

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

// GUARDA Reparación
// export const guardarReparacion = (reparacion) => (dispatch) => {
//     console.log("guardarReparacion()");
//     dispatch(isFetchingStart());
//     return new Promise((resolve, reject) => {
//         guardarReparacionPersistencia(reparacion)
//             .then(reparacion => {
//                 resolve(reparacion);
//             })
//             .catch(error => {
//                 reject(error);
//             })
//             .finally(() => dispatch(isFetchingComplete()));
//     });
// }

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
