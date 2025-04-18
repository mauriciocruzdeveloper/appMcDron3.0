import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    eliminarModeloDronePersistencia,
    getModeloDronePersistencia,
    getModelosDronePorFabricantePersistencia,
    guardarModeloDronePersistencia,
} from "../../persistencia/persistenciaFirebase";
import { isFetchingComplete, isFetchingStart } from "../app/app.slice";
import { ModeloDrone } from "../../types/modeloDrone";

// ELIMINAR MODELO DE DRONE
export const eliminarModeloDroneAsync = createAsyncThunk(
    'app/eliminarModeloDrone',
    async (id: string, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            const modeloDroneEliminado = await eliminarModeloDronePersistencia(id);
            dispatch(isFetchingComplete());
            return modeloDroneEliminado;
        } catch (error: any) { // TODO: Hacer tipo de dato para el error
            console.error(error);
            dispatch(isFetchingComplete());
            throw error;
        }
    },
)

// GUARDAR MODELO DE DRONE
export const guardarModeloDroneAsync = createAsyncThunk(
    'app/guardarModeloDrone',
    async (modeloDrone: ModeloDrone, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            const modeloDroneGuardado = await guardarModeloDronePersistencia(modeloDrone);
            dispatch(isFetchingComplete());
            return modeloDroneGuardado;
        } catch (error: any) { // TODO: Hacer tipo de dato para el error
            dispatch(isFetchingComplete());
            return error;
        }
    },
);

// GET ModeloDrone por id
export const getModeloDroneAsync = createAsyncThunk(
    'app/getModeloDrone',
    async (id: string, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            const modeloDrone = await getModeloDronePersistencia(id);
            dispatch(isFetchingComplete());
            return modeloDrone;
        } catch (error: any) { // TODO: Hacer tipo de dato para el error
            dispatch(isFetchingComplete());
            return error;
        }
    },
);

// GET ModelosDrone por fabricante
export const getModelosDronePorFabricanteAsync = createAsyncThunk(
    'app/getModelosDronePorFabricante',
    async (fabricante: string, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            const modelosDrone = await getModelosDronePorFabricantePersistencia(fabricante);
            dispatch(isFetchingComplete());
            return modelosDrone;
        } catch (error: any) { // TODO: Hacer tipo de dato para el error
            dispatch(isFetchingComplete());
            return error;
        }
    },
);

// // GET todos los modelos de drone
// export const getModelosDroneAsync = createAsyncThunk(
//     'app/getModelosDrone',
//     async (_, { dispatch }) => {
//         try {
//             dispatch(isFetchingStart());
//             const unsubscribe = getModelosDronePersistencia((modelosDrone) => {
//                 dispatch(setModelosDrone(modelosDrone));
//                 dispatch(isFetchingComplete());
//             });
//             return unsubscribe;
//         } catch (error: any) { // TODO: Hacer tipo de dato para el error
//             dispatch(isFetchingComplete());
//             return error;
//         }
//     },
// );
