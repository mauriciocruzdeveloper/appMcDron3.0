/// <reference types="jest" />

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ListaPedidos from './ListaPedidos.component';

jest.mock('../hooks/useHistory', () => ({
    useHistory: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        goBack: jest.fn(),
        location: { pathname: '/inicio/pedidos', search: '', hash: '', state: null, key: 'test' },
    }),
}));

const createStore = () => configureStore({
    reducer: {
        pedidoRepuesto: (state = {
            filter: '',
            coleccionPedidos: {
                'pedido-1': {
                    id: 'pedido-1',
                    data: {
                        ProveedorId: 1,
                        ProveedorNombre: 'AliExpress',
                        FechaPedido: '2026-08-14',
                        FechaEstimadaLlegada: null,
                        FechaLlegadaReal: null,
                        Estado: 'pending',
                        NumeroPedido: 'TRACK-123',
                        CUIT: '27123456780',
                        Notas: '',
                        Items: [
                            {
                                id: 'item-1',
                                data: {
                                    PedidoId: 'pedido-1',
                                    RepuestoId: 'repuesto-1',
                                    NombreRepuesto: 'Helice',
                                    Cantidad: 2,
                                    PrecioUnitario: null,
                                },
                            },
                        ],
                    },
                },
            },
        }, action) => state,
        repuesto: (state = {
            filter: '',
            coleccionRepuestos: {
                'repuesto-1': {
                    id: 'repuesto-1',
                    data: {
                        NombreRepu: 'Helice',
                        ProveedorRepu: 'AliExpress',
                        ModelosDroneIds: [],
                        Obsoleta: false,
                    },
                },
            },
            modelosDroneSelect: [],
            proveedoresSelect: [],
        }, action) => state,
        modeloDrone: (state = {
            filter: '',
            coleccionModelosDrone: {},
            selectedModeloDrone: null,
            isFetchingModeloDrone: false,
        }, action) => state,
    },
});

describe('ListaPedidos', () => {
    it('muestra el CUIT del pedido cuando existe', () => {
        const store = createStore();

        render(
            <Provider store={store}>
                <ListaPedidos />
            </Provider>
        );

        expect(screen.getByText(/CUIT:\s*27123456780/i)).toBeInTheDocument();
    });
});
