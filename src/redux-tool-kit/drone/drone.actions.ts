import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    eliminarDronePersistencia,
    getDronePersistencia,
    getDronesPorModeloDronePersistencia,
    guardarDronePersistencia,
    getDronesPorPropietarioPersistencia,
} from "../../persistencia/persistencia"; // Actualizado para usar la importación centralizada
import { isFetchingComplete, isFetchingStart } from "../app/app.slice";
import { Drone } from "../../types/drone";

// ELIMINAR DRONE
export const eliminarDroneAsync = createAsyncThunk(
    'app/eliminarDrone',
    async (id: string, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            const droneEliminado = await eliminarDronePersistencia(id);
            dispatch(isFetchingComplete());
            return droneEliminado;
        } catch (error: any) { // TODO: Hacer tipo de dato para el error
            console.error(error);
            dispatch(isFetchingComplete());
            throw error;
        }
    },
)

// GUARDAR DRONE
export const guardarDroneAsync = createAsyncThunk(
    'app/guardarDrone',
    async (drone: Drone, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            const droneGuardado = await guardarDronePersistencia(drone);
            dispatch(isFetchingComplete());
            return droneGuardado;
        } catch (error: any) { // TODO: Hacer tipo de dato para el error
            dispatch(isFetchingComplete());
            throw error;
        }
    },
);

// GET Drone por id
export const getDroneAsync = createAsyncThunk(
    'app/getDrone',
    async (id: string, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            const drone = await getDronePersistencia(id);
            dispatch(isFetchingComplete());
            return drone;
        } catch (error: any) { // TODO: Hacer tipo de dato para el error
            dispatch(isFetchingComplete());
            throw error;
        }
    },
);

// GET Drones por modelo de drone
export const getDronesPorModeloDroneAsync = createAsyncThunk(
    'app/getDronesPorModeloDrone',
    async (modeloDroneId: string, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            const drones = await getDronesPorModeloDronePersistencia(modeloDroneId);
            dispatch(isFetchingComplete());
            return drones;
        } catch (error: any) { // TODO: Hacer tipo de dato para el error
            dispatch(isFetchingComplete());
            throw error;
        }
    },
);

// GET Drones por propietario
export const getDronesPorPropietarioAsync = createAsyncThunk(
    'app/getDronesPorPropietario',
    async (propietario: string, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            const drones = await getDronesPorPropietarioPersistencia(propietario);
            dispatch(isFetchingComplete());
            return drones;
        } catch (error: any) { // TODO: Hacer tipo de dato para el error
            dispatch(isFetchingComplete());
            throw error;
        }
    },
);

// // GET todos los drones
// export const getDronesAsync = createAsyncThunk(
//     'app/getDrones',
//     async (_, { dispatch }) => {
//         try {
//             dispatch(isFetchingStart());
//             const unsubscribe = getDronesPersistencia((drones) => {
//                 dispatch(setDrones(drones));
//                 dispatch(isFetchingComplete());
//             });
//             return unsubscribe;
//         } catch (error: any) { // TODO: Hacer tipo de dato para el error
//             dispatch(isFetchingComplete());
//             return error;
//         }
//     },
// );
