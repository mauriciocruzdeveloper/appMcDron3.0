import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    eliminarRepuestoPersistencia,
    getRepuestoPersistencia,
    getRepuestosPorModeloPersistencia,
    guardarRepuestoPersistencia,
    getRepuestosPorProveedorPersistencia,
    aplicarMovimientoStockPersistencia,
} from "../../persistencia/persistencia"; // Actualizado para usar la importación centralizada
import { isFetchingComplete, isFetchingStart } from "../app/app.slice";
import { Repuesto } from "../../types/repuesto";
import { setRepuesto } from "./repuesto.slice";
import { RootState } from "../store";

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

// AJUSTE MANUAL DE STOCK (ledger)
// Registra un movimiento 'adjustment' que modifica el stock fisico (on_hand) sin
// tocar el comprometido. Usar para correcciones de conteo, merma o roturas.
export const ajustarStockManualAsync = createAsyncThunk(
    'repuesto/ajustarStockManual',
    async (
        { repuestoId, delta, nota }: { repuestoId: string; delta: number; nota?: string },
        { dispatch, getState }
    ) => {
        try {
            dispatch(isFetchingStart());

            const actualizado = await aplicarMovimientoStockPersistencia({
                partId: repuestoId,
                onHandDelta: delta,
                committedDelta: 0,
                kind: 'adjustment',
                referenceType: 'manual',
                referenceId: null,
                note: nota ?? null,
            });

            // Mergear con el store para preservar ModelosDroneIds y demas campos.
            const existente = (getState() as RootState).repuesto.coleccionRepuestos[repuestoId];
            dispatch(setRepuesto({
                id: actualizado.id,
                data: {
                    ...(existente?.data || {}),
                    ...actualizado.data,
                    ModelosDroneIds: existente?.data?.ModelosDroneIds ?? actualizado.data.ModelosDroneIds,
                },
            }));

            dispatch(isFetchingComplete());
            return actualizado;
        } catch (error: unknown) {
            console.error("Error al ajustar stock manual:", error);
            dispatch(isFetchingComplete());
            throw error;
        }
    },
);

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
