import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PedidoRepuesto, PedidosRepuesto } from '../../types/pedidoRepuesto';
import { guardarPedidoAsync, eliminarPedidoAsync, cancelarPedidoAsync } from './pedidoRepuesto.actions';

interface PedidoRepuestoState {
    estadoCarga: 'idle' | 'loading' | 'succeeded' | 'failed';
    errorCarga: string | null;
    filter: string;
    coleccionPedidos: PedidosRepuesto;
}

const initialState: PedidoRepuestoState = {
    estadoCarga: 'idle',
    errorCarga: null,
    filter: '',
    coleccionPedidos: {},
};

const pedidoRepuestoSlice = createSlice({
    name: 'pedidoRepuesto',
    initialState,
    reducers: {
        iniciarCargaPedidos: (state) => {
            state.estadoCarga = 'loading';
            state.errorCarga = null;
        },
        setErrorCargaPedidos: (state, action: PayloadAction<string>) => {
            state.estadoCarga = 'failed';
            state.errorCarga = action.payload;
        },
        setPedidos: (state, action: PayloadAction<PedidoRepuesto[]>) => {
            const obj: PedidosRepuesto = {};
            action.payload.forEach(p => { obj[p.id] = p; });
            state.coleccionPedidos = obj;
            state.estadoCarga = 'succeeded';
            state.errorCarga = null;
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
        builder.addCase(cancelarPedidoAsync.fulfilled, (state, action) => {
            const p = action.payload;
            state.coleccionPedidos[p.id] = p;
        });
    },
});

export const { iniciarCargaPedidos, setErrorCargaPedidos, setPedidos, setPedido, setFilter } = pedidoRepuestoSlice.actions;
export default pedidoRepuestoSlice.reducer;
