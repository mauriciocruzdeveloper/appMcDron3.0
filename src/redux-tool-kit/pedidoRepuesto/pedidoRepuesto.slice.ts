import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PedidoRepuesto, PedidosRepuesto } from '../../types/pedidoRepuesto';
import { guardarPedidoAsync, eliminarPedidoAsync } from './pedidoRepuesto.actions';

interface PedidoRepuestoState {
    filter: string;
    coleccionPedidos: PedidosRepuesto;
}

const initialState: PedidoRepuestoState = {
    filter: '',
    coleccionPedidos: {},
};

const pedidoRepuestoSlice = createSlice({
    name: 'pedidoRepuesto',
    initialState,
    reducers: {
        setPedidos: (state, action: PayloadAction<PedidoRepuesto[]>) => {
            const obj: PedidosRepuesto = {};
            action.payload.forEach(p => { obj[p.id] = p; });
            state.coleccionPedidos = obj;
        },
        setPedido: (state, action: PayloadAction<PedidoRepuesto>) => {
            const p = action.payload;
            state.coleccionPedidos[p.id] = p;
        },
        setFilter: (state, action: PayloadAction<string>) => {
            state.filter = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(guardarPedidoAsync.fulfilled, (state, action) => {
            const p = action.payload;
            state.coleccionPedidos[p.id] = p;
        });
        builder.addCase(eliminarPedidoAsync.fulfilled, (state, action) => {
            delete state.coleccionPedidos[action.payload];
        });
    },
});

export const { setPedidos, setPedido, setFilter } = pedidoRepuestoSlice.actions;
export default pedidoRepuestoSlice.reducer;
