import { createAsyncThunk } from '@reduxjs/toolkit';
import { isFetchingComplete, isFetchingStart } from '../app/app.slice';
import { PedidoRepuesto } from '../../types/pedidoRepuesto';
import {
    guardarPedidoPersistencia,
    eliminarPedidoPersistencia,
    getPedidoPersistencia,
    getRepuestoPersistencia,
    guardarRepuestoPersistencia,
} from '../../persistencia/persistencia';
import { setRepuesto } from '../repuesto/repuesto.slice';

// GUARDAR PEDIDO (crear o actualizar)
export const guardarPedidoAsync = createAsyncThunk(
    'pedidoRepuesto/guardar',
    async (pedido: PedidoRepuesto, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            const guardado = await guardarPedidoPersistencia(pedido);
            dispatch(isFetchingComplete());

            // Actualizar precio del repuesto en BD y en el store
            const itemsConPrecio = pedido.data.Items.filter(
                i => i.data.RepuestoId && i.data.PrecioUnitario !== null && i.data.PrecioUnitario > 0
            );
            await Promise.all(
                itemsConPrecio.map(async (item) => {
                    // 1. Obtener el repuesto actual para no pisar otros campos
                    const repuesto = await getRepuestoPersistencia(item.data.RepuestoId!);
                    // 2. Actualizar solo el precio en BD
                    const actualizado = await guardarRepuestoPersistencia({
                        ...repuesto,
                        data: { ...repuesto.data, PrecioRepu: item.data.PrecioUnitario! },
                    });
                    // 3. Reflejar en el store
                    dispatch(setRepuesto(actualizado));
                })
            );

            return guardado;
        } catch (error: unknown) {
            dispatch(isFetchingComplete());
            throw error;
        }
    },
);

// ELIMINAR PEDIDO
export const eliminarPedidoAsync = createAsyncThunk(
    'pedidoRepuesto/eliminar',
    async (id: string, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            const eliminadoId = await eliminarPedidoPersistencia(id);
            dispatch(isFetchingComplete());
            return eliminadoId;
        } catch (error: unknown) {
            dispatch(isFetchingComplete());
            throw error;
        }
    },
);

// GET PEDIDO por id
export const getPedidoAsync = createAsyncThunk(
    'pedidoRepuesto/get',
    async (id: string, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            const pedido = await getPedidoPersistencia(id);
            dispatch(isFetchingComplete());
            return pedido;
        } catch (error: unknown) {
            dispatch(isFetchingComplete());
            throw error;
        }
    },
);
