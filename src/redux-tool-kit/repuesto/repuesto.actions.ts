import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    eliminarRepuestoPersistencia,
    getRepuestoPersistencia,
    getRepuestosPorModeloPersistencia,
    guardarRepuestoPersistencia,
    getRepuestosPorProveedorPersistencia,
} from "../../persistencia/persistencia"; // Actualizado para usar la importación centralizada
import { isFetchingComplete, isFetchingStart } from "../app/app.slice";
import { Repuesto } from "../../types/repuesto";

// ELIMINAR REPUESTO
export const eliminarRepuestoAsync = createAsyncThunk(
    'app/eliminarRepuesto',
    async (id: string, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            // La verificación de dependencias ahora se hace en la función de persistencia
            const repuestoEliminado = await eliminarRepuestoPersistencia(id);
            dispatch(isFetchingComplete());
            return repuestoEliminado;
        } catch (error: unknown) {
            console.error("Error al eliminar repuesto:", error);
            dispatch(isFetchingComplete());
            throw error; // Propagamos el error para que se maneje correctamente como "rejected"
        }
    },
)

// GUARDAR REPUESTO
export const guardarRepuestoAsync = createAsyncThunk(
    'app/guardarRepuesto',
    async (repuesto: Repuesto, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            const repuestoGuardado = await guardarRepuestoPersistencia(repuesto);
            dispatch(isFetchingComplete());
            return repuestoGuardado;
        } catch (error: unknown) { // TODO: Hacer tipo de dato para el error
            console.error("Error al guardar repuesto guardarRepuestoAsync:", error);
            dispatch(isFetchingComplete());
            throw error;
        }
    },
);

// GET Repuesto por id
export const getRepuestoAsync = createAsyncThunk(
    'app/getRepuesto',
    async (id: string, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            const repuesto = await getRepuestoPersistencia(id);
            dispatch(isFetchingComplete());
            return repuesto;
        } catch (error: unknown) { // TODO: Hacer tipo de dato para el error
            dispatch(isFetchingComplete());
            return error;
        }
    },
);

// GET Repuestos por modelo de drone
export const getRepuestosPorModeloAsync = createAsyncThunk(
    'app/getRepuestosPorModelo',
    async (modelo: string, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            const repuestos = await getRepuestosPorModeloPersistencia(modelo);
            dispatch(isFetchingComplete());
            return repuestos;
        } catch (error: unknown) { // TODO: Hacer tipo de dato para el error
            dispatch(isFetchingComplete());
            return error;
        }
    },
);

// GET Repuestos por proveedor
export const getRepuestosPorProveedorAsync = createAsyncThunk(
    'app/getRepuestosPorProveedor',
    async (proveedor: string, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            const repuestos = await getRepuestosPorProveedorPersistencia(proveedor);
            dispatch(isFetchingComplete());
            return repuestos;
        } catch (error: unknown) { // TODO: Hacer tipo de dato para el error
            dispatch(isFetchingComplete());
            return error;
        }
    },
);

// // GET todos los repuestos
// export const getRepuestosAsync = createAsyncThunk(
//     'app/getRepuestos',
//     async (_, { dispatch }) => {
//         try {
//             dispatch(isFetchingStart());
//             const unsubscribe = getRepuestosPersistencia((repuestos) => {
//                 dispatch(setRepuestos(repuestos));
//                 dispatch(isFetchingComplete());
//             });
//             return unsubscribe;
//         } catch (error: any) { // TODO: Hacer tipo de dato para el error
//             dispatch(isFetchingComplete());
//             return error;
//         }
//     },
// );
