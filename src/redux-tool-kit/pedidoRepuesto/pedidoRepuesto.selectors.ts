import { RootState } from '../store';
import { PedidoRepuesto } from '../../types/pedidoRepuesto';
import { ESTADOS_PEDIDO } from '../../types/pedidoRepuesto';

export const selectPedidosArray = (state: RootState): PedidoRepuesto[] =>
    Object.values(state.pedidoRepuesto.coleccionPedidos);

export const selectPedidoFilter = (state: RootState): string =>
    state.pedidoRepuesto.filter;

export const selectTienePedidos = (state: RootState): boolean =>
    Object.keys(state.pedidoRepuesto.coleccionPedidos).length > 0;

export const selectPedidoPorId = (state: RootState, id: string): PedidoRepuesto | null =>
    state.pedidoRepuesto.coleccionPedidos[id] ?? null;

export const selectPedidosFiltrados = (
    state: RootState,
    filtroEstado: string,
): PedidoRepuesto[] => {
    const ORDEN_ESTADO: Record<string, number> = {
        in_transit: 0,
        pending: 1,
        arrived: 2,
        cancelled: 3,
    };
    const filter = state.pedidoRepuesto.filter.toLowerCase();
    return Object.values(state.pedidoRepuesto.coleccionPedidos)
        .filter(p => {
            const matchTexto =
                !filter ||
                p.data.ProveedorNombre.toLowerCase().includes(filter) ||
                (p.data.NumeroPedido ?? '').toLowerCase().includes(filter) ||
                p.data.Items.some(i => i.data.NombreRepuesto.toLowerCase().includes(filter));
            const matchEstado = !filtroEstado || p.data.Estado === filtroEstado;
            return matchTexto && matchEstado;
        })
        .sort((a, b) =>
            (ORDEN_ESTADO[a.data.Estado] ?? 99) - (ORDEN_ESTADO[b.data.Estado] ?? 99)
        );
};

export const selectEstadisticasPedidos = (state: RootState) => {
    const pedidos = Object.values(state.pedidoRepuesto.coleccionPedidos);
    const result: Record<string, number> = {};
    ESTADOS_PEDIDO.forEach(e => { result[e.value] = 0; });
    pedidos.forEach(p => { result[p.data.Estado] = (result[p.data.Estado] ?? 0) + 1; });
    return result;
};

// Pedidos que contienen un repuesto específico (por RepuestoId en sus Items)
export const selectPedidosPorRepuestoId = (state: RootState, repuestoId: string): PedidoRepuesto[] =>
    Object.values(state.pedidoRepuesto.coleccionPedidos).filter(pedido =>
        pedido.data.Items.some(item => item.data.RepuestoId === repuestoId)
    );
