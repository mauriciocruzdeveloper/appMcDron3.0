import '@testing-library/jest-dom';
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { ReparacionPresupuesto } from './ReparacionPresupuesto';
import { cambiarEstadoReparacionAsync } from '../../../redux-tool-kit/reparacion/reparacion.actions';

const mockOpenModal = jest.fn();
const mockGuardarEstado = jest.fn();

jest.mock('../../../redux-tool-kit/reparacion', () =>
    jest.requireActual('../../../redux-tool-kit/reparacion/reparacion.selectors')
);
jest.mock('../../../redux-tool-kit/reparacion/reparacion.actions', () => ({
    cambiarEstadoReparacionAsync: jest.fn(payload => () => {
        const resultado = Promise.resolve();
        return Object.assign(resultado, { unwrap: () => mockGuardarEstado(payload) });
    }),
}));
jest.mock('../../../redux-tool-kit/app/app.actions', () => ({
    enviarPresupuestoAsync: jest.fn(),
    generarPDFPresupuestoAsync: jest.fn(),
}));
jest.mock('../../../hooks/useDebouncedField', () => ({
    useDebouncedField: ({ valorInicial }: { valorInicial: number | string }) => ({
        value: valorInicial, isSaving: false, onChange: jest.fn(),
    }),
}));
jest.mock('../../IntervencionesReparacion.component', () => () => <div>Intervenciones presupuestadas</div>);
jest.mock('../../Modal/useModal', () => ({ useModal: () => ({ openModal: mockOpenModal }) }));
jest.mock('./ReparacionSeccionColapsable', () => ({
    ReparacionSeccionColapsable: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
}));

const renderPresupuesto = (estado: string, isAdmin = true) => {
    const store = configureStore({
        reducer: {
            reparacion: (state = {
                coleccionReparaciones: { 'rep-1': { id: 'rep-1', data: {
                    EstadoRep: estado, AdelantoRep: 5000, PresuFiRep: 20000,
                } } },
                intervencionesDeReparacionActual: [],
            }) => state,
            drone: (state = { coleccionDrones: {} }) => state,
        },
    });
    return render(
        <Provider store={store}>
            <ReparacionPresupuesto reparacionId="rep-1" isAdmin={isAdmin} />
        </Provider>
    );
};

describe('Presupuesto - Esperando adelanto', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGuardarEstado.mockResolvedValue(undefined);
        (cambiarEstadoReparacionAsync as unknown as jest.Mock).mockImplementation(payload => () => {
            const resultado = Promise.resolve();
            return Object.assign(resultado, { unwrap: () => mockGuardarEstado(payload) });
        });
    });

    it('pausa una reparacion aceptada sin enviar email', async () => {
        renderPresupuesto('Aceptado');
        await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Esperar adelanto' })));
        expect(cambiarEstadoReparacionAsync).toHaveBeenCalledWith({
            reparacionId: 'rep-1', nuevoEstado: 'Esperando adelanto', enviarEmail: false,
        });
    });

    it('muestra adelanto y presupuesto y permite volver manualmente a Aceptado', async () => {
        renderPresupuesto('Esperando adelanto');
        expect(screen.getByRole('status')).toHaveTextContent('Esperando adelanto');
        expect(screen.getByDisplayValue('5000')).toBeInTheDocument();
        expect(screen.getByDisplayValue('20000')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Esperar adelanto' })).not.toBeInTheDocument();
        await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Volver a Aceptado' })));
        expect(cambiarEstadoReparacionAsync).toHaveBeenCalledWith({
            reparacionId: 'rep-1', nuevoEstado: 'Aceptado', enviarEmail: false,
        });
    });

    it.each(['Presupuestado', 'Repuestos'])('no ofrece pausa por adelanto desde %s', estado => {
        renderPresupuesto(estado);
        expect(screen.queryByRole('button', { name: 'Esperar adelanto' })).not.toBeInTheDocument();
    });

    it('oculta los cambios de estado a usuarios no administradores', () => {
        renderPresupuesto('Esperando adelanto', false);
        expect(screen.getByRole('status')).toHaveTextContent('Esperando adelanto');
        expect(screen.queryByRole('button', { name: 'Volver a Aceptado' })).not.toBeInTheDocument();
    });

    it('informa un error si no se puede persistir la pausa', async () => {
        mockGuardarEstado.mockRejectedValueOnce(new Error('Error al guardar'));
        renderPresupuesto('Aceptado');
        await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Esperar adelanto' })));
        expect(mockOpenModal).toHaveBeenCalledWith(expect.objectContaining({
            tipo: 'danger', mensaje: 'Error al guardar',
        }));
        expect(screen.getByRole('button', { name: 'Esperar adelanto' })).toBeEnabled();
    });
});