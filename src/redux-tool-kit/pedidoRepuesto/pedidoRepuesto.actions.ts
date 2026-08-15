import { createAsyncThunk } from '@reduxjs/toolkit';
import { isFetchingComplete, isFetchingStart } from '../app/app.slice';
import { EstadoPedido, PedidoRepuesto, PedidoRepuestoData } from '../../types/pedidoRepuesto';
import {
    guardarPedidoPersistencia,
    eliminarPedidoPersistencia,
    getPedidoPersistencia,
    getRepuestoPersistencia,
    guardarRepuestoPersistencia,
} from '../../persistencia/persistencia';
import { setRepuesto } from '../repuesto/repuesto.slice';
import { RootState } from '../store';
import { sanitizeCuitInput } from '../../utils/cuit';

// Regla de negocio: el estado del pedido no se elige manualmente, se deriva de sus datos.
// 'arrived' y 'cancelled' son terminales: una vez alcanzados, no se recalculan.
export const derivarEstadoPedido = (
    data: PedidoRepuestoData,
    estadoAnterior?: EstadoPedido | null,
): EstadoPedido => {
    if (estadoAnterior === 'cancelled' || estadoAnterior === 'arrived') return estadoAnterior;
    if (data.FechaLlegadaReal) return 'arrived';
    if (data.NumeroPedido) return 'in_transit';
    return 'pending';
};

const agruparCantidadesPorRepuesto = (items: PedidoRepuesto['data']['Items']) => {
    const cantidades = new Map<string, number>();

    items.forEach((item) => {
        const repuestoId = item.data.RepuestoId;
        if (!repuestoId) return;

        const qty = Number(item.data.Cantidad) || 0;
        if (qty <= 0) return;

        cantidades.set(repuestoId, (cantidades.get(repuestoId) || 0) + qty);
    });

    return cantidades;
};

// GUARDAR PEDIDO (crear o actualizar)
export const guardarPedidoAsync = createAsyncThunk(
    'pedidoRepuesto/guardar',
    async (pedido: PedidoRepuesto, { dispatch, getState }) => {
        try {
            dispatch(isFetchingStart());

            // Detectar si el pedido transiciona a "arrived" por primera vez
            // (el estado anterior en el store no era "arrived")
            const state = getState() as RootState;
            const pedidoAnterior = state.pedidoRepuesto.coleccionPedidos[pedido.id] ?? null;

            // Un pedido ya recibido (arrived) es inmutable: no se permite editarlo
            // para preservar la integridad del stock que ya sumo al recibirse.
            if (pedidoAnterior?.data.Estado === 'arrived') {
                dispatch(isFetchingComplete());
                throw new Error('Un pedido recibido (arrived) no puede editarse.');
            }

            // El estado se recalcula siempre a partir de los datos: no se acepta el valor
            // de Estado que venga del formulario.
            const estadoDerivado = derivarEstadoPedido(pedido.data, pedidoAnterior?.data.Estado);
            const pedidoConEstado: PedidoRepuesto = {
                ...pedido,
                data: {
                    ...pedido.data,
                    CUIT: sanitizeCuitInput(pedido.data.CUIT) || null,
                    Estado: estadoDerivado,
                },
            };

            const esPrimerArrived =
                estadoDerivado === 'arrived' &&
                pedidoAnterior?.data.Estado !== 'arrived';

            const guardado = await guardarPedidoPersistencia(pedidoConEstado);
            dispatch(isFetchingComplete());

            // Actualizar precio del repuesto en BD y en el store
            const itemsConPrecio = pedidoConEstado.data.Items.filter(
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

            // Cuando el pedido pasa a "arrived" por primera vez:
            // registrar un movimiento de recepcion (suma stock fisico, sin tocar comprometido).
            if (esPrimerArrived) {
                const { aplicarMovimientoStockPersistencia } = await import('../../persistencia/persistencia');
                const cantidadesPorRepuesto = agruparCantidadesPorRepuesto(pedidoConEstado.data.Items);

                await Promise.all(
                    Array.from(cantidadesPorRepuesto.entries()).map(async ([repuestoId, cantidadRecibida]) => {
                        const actualizado = await aplicarMovimientoStockPersistencia({
                            partId: repuestoId,
                            onHandDelta: cantidadRecibida,
                            committedDelta: 0,
                            kind: 'reception',
                            referenceType: 'purchase_order',
                            referenceId: pedidoConEstado.id,
                            note: null,
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
                    })
                );
            }

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
    async (id: string, { dispatch, getState }) => {
        try {
            dispatch(isFetchingStart());

            // Un pedido recibido (arrived) no puede eliminarse: ya sumo stock fisico
            // y borrarlo dejaria stock fantasma.
            const state = getState() as RootState;
            const pedido = state.pedidoRepuesto.coleccionPedidos[id] ?? null;
            if (pedido?.data.Estado === 'arrived') {
                dispatch(isFetchingComplete());
                throw new Error('Un pedido recibido (arrived) no puede eliminarse.');
            }

            const eliminadoId = await eliminarPedidoPersistencia(id);
            dispatch(isFetchingComplete());
            return eliminadoId;
        } catch (error: unknown) {
            dispatch(isFetchingComplete());
            throw error;
        }
    },
);

// CANCELAR PEDIDO
export const cancelarPedidoAsync = createAsyncThunk(
    'pedidoRepuesto/cancelar',
    async (id: string, { dispatch, getState }) => {
        try {
            dispatch(isFetchingStart());

            const state = getState() as RootState;
            const pedido = state.pedidoRepuesto.coleccionPedidos[id] ?? null;
            if (!pedido) {
                throw new Error('Pedido no encontrado.');
            }
            if (pedido.data.Estado === 'arrived') {
                throw new Error('Un pedido recibido (arrived) no puede cancelarse.');
            }

            const pedidoCancelado: PedidoRepuesto = {
                ...pedido,
                data: { ...pedido.data, Estado: 'cancelled' },
            };
            const guardado = await guardarPedidoPersistencia(pedidoCancelado);
            dispatch(isFetchingComplete());
            return guardado;
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
