import '@testing-library/jest-dom';
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { ReparacionReparar } from './ReparacionReparar';
import {
    agregarIntervencionAReparacionAsync,
    actualizarIncluirRepuestoAsignacionAsync,
    getIntervencionesPorReparacionAsync,
} from '../../../redux-tool-kit/reparacion/reparacion.actions';
import { AsignacionIntervencion, EstadoAsignacion, OrigenAsignacion } from '../../../types/intervencion';

const mockOpenModal = jest.fn();
const mockAgregarIntervencion = jest.fn();
const mockActualizarIncluirRepuesto = jest.fn();

jest.mock('../../../redux-tool-kit/reparacion', () =>
    jest.requireActual('../../../redux-tool-kit/reparacion/reparacion.selectors')
);
jest.mock('../../../redux-tool-kit/reparacion/reparacion.actions', () => ({
    agregarIntervencionAReparacionAsync: jest.fn(),
    actualizarIncluirRepuestoAsignacionAsync: jest.fn(),
    cambiarEstadoReparacionAsync: jest.fn(),
    eliminarIntervencionDeReparacionAsync: jest.fn(),
    getIntervencionesPorReparacionAsync: jest.fn(() => () => Promise.resolve()),
    cambiarEstadoAsignacionAsync: jest.fn(),
}));
jest.mock('../../../redux-tool-kit/app/app.actions', () => ({
    subirFotoInformeAsync: jest.fn(),
    borrarFotoInformeAsync: jest.fn(),
}));
jest.mock('../../../hooks/useDebouncedField', () => ({
    useDebouncedField: ({ valorInicial }: { valorInicial: number | string }) => ({
        value: valorInicial, isSaving: false, onChange: jest.fn(),
    }),
}));
jest.mock('../../Modal/useModal', () => ({ useModal: () => ({ openModal: mockOpenModal }) }));
jest.mock('./ReparacionSeccionColapsable', () => ({
    ReparacionSeccionColapsable: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
}));
jest.mock('../../common', () => ({
    ComboBox: ({ options, value, onChange }: any) => (
        <select
            aria-label="Seleccionar una intervención..."
            value={value}
            onChange={(e) => {
                const selected = options.find((o: any) => o.value === e.target.value) || null;
                onChange(selected);
            }}
        >
            <option value="">Seleccionar...</option>
            {options.map((o: any) => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
        </select>
    ),
}));

const catalogoIntervencionesMock = {
    'int-con-repuesto': {
        id: 'int-con-repuesto',
        data: {
            NombreInt: 'Cambio de motor',
            DescripcionInt: '',
            RepuestosIds: ['rep-motor'],
            PrecioManoObra: 5000,
            DuracionEstimada: 30,
        },
    },
    'int-sin-repuesto': {
        id: 'int-sin-repuesto',
        data: {
            NombreInt: 'Calibración IMU',
            DescripcionInt: '',
            RepuestosIds: [],
            PrecioManoObra: 3000,
            DuracionEstimada: 15,
        },
    },
};

const renderReparar = ({
    estado = 'Aceptado',
    isAdmin = true,
    asignaciones = [],
}: {
    estado?: string;
    isAdmin?: boolean;
    asignaciones?: AsignacionIntervencion[];
} = {}) => {
    const store = configureStore({
        reducer: {
            reparacion: (state = {
                coleccionReparaciones: {
                    'rep-1': {
                        id: 'rep-1',
                        data: {
                            EstadoRep: estado,
                            DescripcionTecRep: '',
                            FeFinRep: null,
                        },
                    },
                },
                intervencionesDeReparacionActual: asignaciones,
            }) => state,
            intervencion: (state = {
                coleccionIntervenciones: catalogoIntervencionesMock,
            }) => state,
            drone: (state = { coleccionDrones: {} }) => state,
        },
    });

    return render(
        <Provider store={store}>
            <ReparacionReparar reparacionId="rep-1" isAdmin={isAdmin} />
        </Provider>
    );
};

describe('ReparacionReparar - repuesto opcional en intervenciones adicionales', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAgregarIntervencion.mockResolvedValue(true);
        mockActualizarIncluirRepuesto.mockResolvedValue({});
        (getIntervencionesPorReparacionAsync as unknown as jest.Mock).mockImplementation(
            () => () => Promise.resolve()
        );
        (agregarIntervencionAReparacionAsync as unknown as jest.Mock).mockImplementation(payload => () => {
            const resultado = Promise.resolve(true);
            return Object.assign(resultado, { unwrap: () => mockAgregarIntervencion(payload) });
        });
        (actualizarIncluirRepuestoAsignacionAsync as unknown as jest.Mock).mockImplementation(payload => () => {
            const resultado = Promise.resolve({});
            return Object.assign(resultado, { unwrap: () => mockActualizarIncluirRepuesto(payload) });
        });
    });

    it('permite desmarcar el uso de repuesto del taller al agregar una intervención con piezas', async () => {
        renderReparar();

        const selector = screen.getByLabelText('Seleccionar una intervención...');
        fireEvent.change(selector, { target: { value: 'int-con-repuesto' } });

        const checkRepuesto = screen.getByLabelText('Usar repuesto del taller') as HTMLInputElement;
        expect(checkRepuesto).toBeChecked();

        fireEvent.click(checkRepuesto);
        expect(checkRepuesto).not.toBeChecked();

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /Agregar/i }));
        });

        expect(mockAgregarIntervencion).toHaveBeenCalledWith({
            reparacionId: 'rep-1',
            intervencionId: 'int-con-repuesto',
            origen: OrigenAsignacion.ADICIONAL,
            incluirRepuesto: false,
        });
    });

    it('no muestra el check de repuesto cuando la intervención seleccionada no tiene piezas', () => {
        renderReparar();

        const selector = screen.getByLabelText('Seleccionar una intervención...');
        fireEvent.change(selector, { target: { value: 'int-sin-repuesto' } });

        expect(screen.queryByLabelText('Usar repuesto del taller')).not.toBeInTheDocument();
    });

    it('muestra indicador Repuesto no incluido y permite alternarlo en adicional pendiente con piezas', async () => {
        renderReparar({
            asignaciones: [
                {
                    id: 'asig-1',
                    data: {
                        reparacionId: 'rep-1',
                        intervencionId: 'int-con-repuesto',
                        estado: EstadoAsignacion.PENDIENTE,
                        origen: OrigenAsignacion.ADICIONAL,
                        incluyeRepuestosTaller: false,
                        repuestosSnapshot: [{ partId: 'rep-motor', quantity: 1 }],
                        PrecioManoObra: 5000,
                        PrecioPiezas: 0,
                        PrecioTotal: 5000,
                    },
                },
                {
                    id: 'asig-2',
                    data: {
                        reparacionId: 'rep-1',
                        intervencionId: 'int-sin-repuesto',
                        estado: EstadoAsignacion.PENDIENTE,
                        origen: OrigenAsignacion.ADICIONAL,
                        incluyeRepuestosTaller: false,
                        repuestosSnapshot: [],
                        PrecioManoObra: 3000,
                        PrecioPiezas: 0,
                        PrecioTotal: 3000,
                    },
                },
            ],
        });

        expect(screen.getAllByText('Repuesto no incluido')).toHaveLength(1);

        const switches = screen.getAllByRole('switch', { name: 'Usar repuesto del taller' });
        expect(switches).toHaveLength(1);
        expect(switches[0]).not.toBeChecked();

        await act(async () => {
            fireEvent.click(switches[0]);
        });

        expect(mockActualizarIncluirRepuesto).toHaveBeenCalledWith({
            asignacionId: 'asig-1',
            intervencionId: 'int-con-repuesto',
            incluirRepuesto: true,
        });
    });

    it('conserva el badge pero oculta el switch cuando la adicional está completada', () => {
        renderReparar({
            asignaciones: [
                {
                    id: 'asig-completada',
                    data: {
                        reparacionId: 'rep-1',
                        intervencionId: 'int-con-repuesto',
                        estado: EstadoAsignacion.COMPLETADA,
                        origen: OrigenAsignacion.ADICIONAL,
                        incluyeRepuestosTaller: false,
                        repuestosSnapshot: [{ partId: 'rep-motor', quantity: 1 }],
                        PrecioManoObra: 5000,
                        PrecioPiezas: 0,
                        PrecioTotal: 5000,
                    },
                },
            ],
        });

        expect(screen.getByText('Repuesto no incluido')).toBeInTheDocument();
        expect(screen.queryByRole('switch', { name: 'Usar repuesto del taller' })).not.toBeInTheDocument();
    });
});
