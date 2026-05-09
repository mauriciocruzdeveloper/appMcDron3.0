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
    const filter = state.pedidoRepuesto.filter.toLowerCase();
    return Object.values(state.pedidoRepuesto.coleccionPedidos).filter(p => {
        const matchTexto =
            !filter ||
            p.data.ProveedorNombre.toLowerCase().includes(filter) ||
            (p.data.NumeroPedido ?? '').toLowerCase().includes(filter) ||
            p.data.Items.some(i => i.data.NombreRepuesto.toLowerCase().includes(filter));
        const matchEstado = !filtroEstado || p.data.Estado === filtroEstado;
        return matchTexto && matchEstado;
    });
};

export const selectEstadisticasPedidos = (state: RootState) => {
    const pedidos = Object.values(state.pedidoRepuesto.coleccionPedidos);
    const result: Record<string, number> = {};
    ESTADOS_PEDIDO.forEach(e => { result[e.value] = 0; });
    pedidos.forEach(p => { result[p.data.Estado] = (result[p.data.Estado] ?? 0) + 1; });
    return result;
};
