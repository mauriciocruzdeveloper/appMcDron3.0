import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    eliminarModeloDronePersistencia,
    getModeloDronePersistencia,
    getModelosDronePorFabricantePersistencia,
    guardarModeloDronePersistencia,
    getModelosDronePersistencia,
} from "../../persistencia/persistenciaFirebase";
import { isFetchingComplete, isFetchingStart } from "../app/app.slice";
import { ModeloDrone } from "../../types/modeloDrone";
import { setModelosDrone } from "./modeloDrone.slice";

// ELIMINAR MODELO DE DRONE
export const eliminarModeloDroneAsync = createAsyncThunk(
    'app/eliminarModeloDrone',
    async (id: string, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            const modeloDroneEliminado = await eliminarModeloDronePersistencia(id);
            console.log("!!! modeloDroneEliminado", modeloDroneEliminado);
            dispatch(isFetchingComplete());
            return modeloDroneEliminado;
        } catch (error: any) {
            console.log("!!! error", error);
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
        } catch (error: any) {
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
        } catch (error: any) {
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
        } catch (error: any) {
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
//         } catch (error: any) {
//             dispatch(isFetchingComplete());
//             return error;
//         }
//     },
// );
