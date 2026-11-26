import '@testing-library/jest-dom';
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
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

interface RenderPresupuestoOptions {
    isAdmin?: boolean;
    reparacionExtra?: Record<string, unknown>;
    drones?: Record<string, unknown>;
    modelosDrone?: Record<string, unknown>;
}

const renderPresupuesto = (
    estado: string,
    isAdminOrOptions: boolean | RenderPresupuestoOptions = true,
) => {
    const options: RenderPresupuestoOptions = typeof isAdminOrOptions === 'boolean'
        ? { isAdmin: isAdminOrOptions }
        : isAdminOrOptions;
    const isAdmin = options.isAdmin ?? true;

    const store = configureStore({
        reducer: {
            reparacion: (state = {
                coleccionReparaciones: { 'rep-1': { id: 'rep-1', data: {
                    EstadoRep: estado,
                    AdelantoRep: 5000,
                    PresuFiRep: 20000,
                    ...(options.reparacionExtra || {}),
                } } },
                intervencionesDeReparacionActual: [],
            }) => state,
            drone: (state = { coleccionDrones: options.drones || {} }) => state,
            modeloDrone: (state = { coleccionModelosDrone: options.modelosDrone || {} }) => state,
        },
    });
    return render(
        <MemoryRouter>
            <Provider store={store}>
                <ReparacionPresupuesto reparacionId="rep-1" isAdmin={isAdmin} />
            </Provider>
        </MemoryRouter>
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

describe('Presupuesto - Porcentaje respecto al modelo de drone', () => {
    it('muestra el porcentaje y valor de referencia cuando el modelo tiene precio cargado', () => {
        renderPresupuesto('Revisado', {
            reparacionExtra: { DroneId: 'drone-1', PresuFiRep: 150000 },
            drones: {
                'drone-1': { id: 'drone-1', data: { ModeloDroneId: 'mod-1', Nombre: 'Mavic' } },
            },
            modelosDrone: {
                'mod-1': {
                    id: 'mod-1',
                    data: {
                        NombreModelo: 'Mavic 3',
                        Fabricante: 'DJI',
                        DescripcionModelo: '',
                        PrecioReferencia: 1000000,
                        code: 'MAV3',
                    },
                },
            },
        });

        const leyenda = screen.getByTestId('presupuesto-porcentaje-modelo');
        expect(leyenda).toHaveTextContent('Representa el 15% del valor del modelo Mavic 3');
    });

    it('muestra leyenda y enlace para cargar precio cuando el modelo no tiene PrecioReferencia', () => {
        renderPresupuesto('Revisado', {
            reparacionExtra: { DroneId: 'drone-1', PresuFiRep: 150000 },
            drones: {
                'drone-1': { id: 'drone-1', data: { ModeloDroneId: 'mod-2', Nombre: 'Mini' } },
            },
            modelosDrone: {
                'mod-2': {
                    id: 'mod-2',
                    data: {
                        NombreModelo: 'Mini 4 Pro',
                        Fabricante: 'DJI',
                        DescripcionModelo: '',
                        PrecioReferencia: 0,
                        code: 'M4P',
                    },
                },
            },
        });

        const leyenda = screen.getByTestId('presupuesto-porcentaje-modelo');
        expect(leyenda).toHaveTextContent('El modelo Mini 4 Pro no tiene precio de referencia cargado.');
        const link = screen.getByRole('link', { name: 'Cargar precio' });
        expect(link).toHaveAttribute('href', '/inicio/modelos-drone/mod-2');
    });

    it('muestra leyenda cuando no hay modelo asociado en catálogo', () => {
        renderPresupuesto('Revisado', {
            reparacionExtra: { ModeloDroneNameRep: 'Drone casero' },
        });

        expect(screen.getByTestId('presupuesto-porcentaje-modelo')).toHaveTextContent(
            'Sin modelo de drone asociado en el catálogo para calcular porcentaje.'
        );
    });

    it('no muestra porcentaje ni leyenda a usuarios no administradores', () => {
        renderPresupuesto('Presupuestado', {
            isAdmin: false,
            reparacionExtra: { DroneId: 'drone-1', PresuFiRep: 150000 },
            drones: {
                'drone-1': { id: 'drone-1', data: { ModeloDroneId: 'mod-1', Nombre: 'Mavic' } },
            },
            modelosDrone: {
                'mod-1': {
                    id: 'mod-1',
                    data: {
                        NombreModelo: 'Mavic 3',
                        Fabricante: 'DJI',
                        DescripcionModelo: '',
                        PrecioReferencia: 1000000,
                        code: 'MAV3',
                    },
                },
            },
        });

        expect(screen.queryByTestId('presupuesto-porcentaje-modelo')).not.toBeInTheDocument();
    });
});