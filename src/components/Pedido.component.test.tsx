/// <reference types="jest" />

import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PedidoComponent from './Pedido.component';

const mockOpenModal = jest.fn();

jest.mock('./Modal/useModal', () => ({
    useModal: () => ({
        openModal: mockOpenModal,
    }),
}));

jest.mock('../hooks/useHistory', () => ({
    useHistory: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        goBack: jest.fn(),
        location: { pathname: '/inicio/pedidos/new', search: '', hash: '', state: null, key: 'test' },
    }),
}));

const createStore = (withItem = false) => configureStore({
    reducer: {
        pedidoRepuesto: (state = {
            filter: '',
            coleccionPedidos: withItem ? {
                'pedido-1': {
                    id: 'pedido-1',
                    data: {
                        ProveedorId: 1,
                        ProveedorNombre: 'AliExpress',
                        FechaPedido: '2026-08-14',
                        FechaEstimadaLlegada: null,
                        FechaLlegadaReal: null,
                        Estado: 'pending',
                        NumeroPedido: null,
                        CUIT: null,
                        Notas: '',
                        Items: [
                            {
                                id: 'item-1',
                                data: {
                                    PedidoId: 'pedido-1',
                                    RepuestoId: 'repuesto-1',
                                    NombreRepuesto: 'Motor',
                                    Cantidad: 1,
                                    PrecioUnitario: 1000,
                                },
                            },
                        ],
                    },
                },
            } : {},
        }) => state,
        repuesto: (state = {
            filter: '',
            coleccionRepuestos: {
                'repuesto-1': {
                    id: 'repuesto-1',
                    data: {
                        NombreRepu: 'Motor',
                        ProveedorRepu: 'AliExpress',
                        PrecioRepu: 1000,
                        ModelosDroneIds: [],
                        Obsoleta: false,
                    },
                },
            },
            modelosDroneSelect: [],
            proveedoresSelect: [],
        }) => state,
        modeloDrone: (state = {
            filter: '',
            coleccionModelosDrone: {},
            selectedModeloDrone: null,
            isFetchingModeloDrone: false,
        }) => state,
        usuario: (state = {
            filter: '',
            coleccionUsuarios: {},
        }) => state,
    },
});

describe('PedidoComponent - input Cantidad', () => {
    beforeEach(() => {
        mockOpenModal.mockReset();
    });

    it('permite borrar el 1 por defecto y escribir otra cantidad directamente', () => {
        const store = createStore();

        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/inicio/pedidos/new']}>
                    <Routes>
                        <Route path="/inicio/pedidos/:id" element={<PedidoComponent />} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );

        fireEvent.click(screen.getByRole('button', { name: /agregar repuesto/i }));

        const inputCantidad = screen.getByLabelText(/cantidad \*/i) as HTMLInputElement;
        expect(inputCantidad.value).toBe('1');

        fireEvent.change(inputCantidad, { target: { value: '' } });
        expect(inputCantidad.value).toBe('');

        fireEvent.change(inputCantidad, { target: { value: '2' } });
        expect(inputCantidad.value).toBe('2');
    });

    it('impide guardar cuando la cantidad quedó vacía', () => {
        const store = createStore(true);

        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/inicio/pedidos/pedido-1']}>
                    <Routes>
                        <Route path="/inicio/pedidos/:id" element={<PedidoComponent />} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );

        const inputCantidad = screen.getByLabelText(/cantidad \*/i) as HTMLInputElement;
        expect(inputCantidad.value).toBe('1');

        fireEvent.change(inputCantidad, { target: { value: '' } });
        expect(inputCantidad.value).toBe('');

        fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

        expect(mockOpenModal).toHaveBeenCalledWith(expect.objectContaining({
            mensaje: 'La cantidad de cada repuesto debe ser al menos 1.',
            tipo: 'warning',
        }));
    });
});
