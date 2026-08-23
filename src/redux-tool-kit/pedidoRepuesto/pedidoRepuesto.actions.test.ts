/// <reference types="jest" />

import { configureStore } from '@reduxjs/toolkit';
import { guardarPedidoPersistencia } from '../../persistencia/persistencia';
import { PedidoRepuesto } from '../../types/pedidoRepuesto';
import { guardarPedidoAsync } from './pedidoRepuesto.actions';

jest.mock('../../persistencia/persistencia', () => ({
    aplicarMovimientoStockPersistencia: jest.fn(),
    eliminarPedidoPersistencia: jest.fn(),
    getPedidoPersistencia: jest.fn(),
    getRepuestoPersistencia: jest.fn(),
    guardarPedidoPersistencia: jest.fn(),
    guardarRepuestoPersistencia: jest.fn(),
}));

const guardarPedidoMock = guardarPedidoPersistencia as jest.Mock;

const crearPedido = (cuit: string): PedidoRepuesto => ({
    id: 'pedido-1',
    data: {
        ProveedorId: 1,
        ProveedorNombre: 'AliExpress',
        FechaPedido: '2026-08-14',
        FechaEstimadaLlegada: null,
        FechaLlegadaReal: null,
        Estado: 'pending',
        NumeroPedido: null,
        CUIT: cuit,
        Notas: '',
        Items: [],
    },
});

const crearStore = () => configureStore({
    reducer: () => ({
        pedidoRepuesto: { coleccionPedidos: {} },
        repuesto: { coleccionRepuestos: {} },
    }),
});

describe('guardarPedidoAsync CUIT', () => {
    beforeEach(() => {
        guardarPedidoMock.mockReset();
        guardarPedidoMock.mockImplementation(async (pedido: PedidoRepuesto) => pedido);
    });

    it('persiste un CUIT válido normalizado', async () => {
        const store = crearStore();
        await store.dispatch(guardarPedidoAsync(crearPedido('27-12345678-0')) as any);

        expect(guardarPedidoMock).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ CUIT: '27123456780' }),
        }));
    });

    it('rechaza la action cuando el CUIT es inválido, sin persistir', async () => {
        const store = crearStore();
        const result = await store.dispatch(guardarPedidoAsync(crearPedido('20123456789')) as any);

        expect(result.meta.requestStatus).toBe('rejected');
        expect(guardarPedidoMock).not.toHaveBeenCalled();
    });
});