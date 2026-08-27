import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    eliminarRepuestoPersistencia,
    getRepuestoPersistencia,
    getRepuestosPorModeloPersistencia,
    guardarRepuestoPersistencia,
    getRepuestosPorProveedorPersistencia,
    aplicarMovimientoStockPersistencia,
    subirImagenConMiniaturaPersistencia,
    eliminarArchivoPersistencia,
} from "../../persistencia/persistencia"; // Actualizado para usar la importación centralizada
import { isFetchingComplete, isFetchingStart } from "../app/app.slice";
import { Repuesto } from "../../types/repuesto";
import { setRepuesto } from "./repuesto.slice";
import { RootState } from "../store";
import { sanitizeBaseName, addTimestampToBase, buildUploadPath } from "../../utils/fileUtils";

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

// SUBIR FOTO DE REPUESTO
export const subirFotoRepuestoAsync = createAsyncThunk(
    'repuesto/subirFoto',
    async ({ repuestoId, file }: { repuestoId: string; file: File }, { dispatch, getState, rejectWithValue }) => {
        try {
            // Android stability blob
            const arrayBuffer = await file.arrayBuffer();
            const stableBlob = new Blob([arrayBuffer], { type: file.type });

            dispatch(isFetchingStart());

            const state = getState() as RootState;
            const repuestoActual = state.repuesto.coleccionRepuestos[repuestoId];
            if (!repuestoActual) {
                throw new Error('Repuesto no encontrado');
            }

            const safeBase = sanitizeBaseName(file.name);
            const fileName = addTimestampToBase(safeBase);
            const path = buildUploadPath({ entityType: 'REPUESTOS', entityId: repuestoId, folder: 'foto', fileName });

            const { originalUrl } = await subirImagenConMiniaturaPersistencia(path, stableBlob);

            const repuestoActualizado: Repuesto = {
                ...repuestoActual,
                data: {
                    ...repuestoActual.data,
                    FotoRepu: originalUrl,
                }
            };

            const guardarResponse = await dispatch(guardarRepuestoAsync(repuestoActualizado));
            if (guardarResponse.meta.requestStatus !== 'fulfilled') {
                throw new Error('Error al actualizar foto del repuesto');
            }

            dispatch(isFetchingComplete());
            return originalUrl;
        } catch (error: any) {
            console.error('Error al subir foto del repuesto:', error);
            dispatch(isFetchingComplete());
            return rejectWithValue(error.message || 'Error al subir la foto del repuesto');
        }
    }
);

// BORRAR FOTO DE REPUESTO
export const borrarFotoRepuestoAsync = createAsyncThunk(
    'repuesto/borrarFoto',
    async ({ repuestoId, fotoUrl }: { repuestoId: string; fotoUrl: string }, { dispatch, getState, rejectWithValue }) => {
        try {
            dispatch(isFetchingStart());

            const state = getState() as RootState;
            const repuestoActual = state.repuesto.coleccionRepuestos[repuestoId];
            if (!repuestoActual) {
                throw new Error('Repuesto no encontrado');
            }

            if (fotoUrl) {
                await eliminarArchivoPersistencia(fotoUrl);
            }

            const repuestoActualizado: Repuesto = {
                ...repuestoActual,
                data: {
                    ...repuestoActual.data,
                    FotoRepu: '',
                }
            };

            const guardarResponse = await dispatch(guardarRepuestoAsync(repuestoActualizado));
            if (guardarResponse.meta.requestStatus !== 'fulfilled') {
                throw new Error('Error al actualizar el repuesto');
            }

            dispatch(isFetchingComplete());
            return '';
        } catch (error: any) {
            console.error('Error al borrar foto del repuesto:', error);
            dispatch(isFetchingComplete());
            return rejectWithValue(error.message || 'Error al borrar la foto del repuesto');
        }
    }
);
