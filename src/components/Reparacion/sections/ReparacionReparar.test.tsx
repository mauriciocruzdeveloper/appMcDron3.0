import '@testing-library/jest-dom';
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { ReparacionReparar } from './ReparacionReparar';
import {
    agregarIntervencionAReparacionAsync,
    actualizarIncluirRepuestoAsignacionAsync,
    actualizarRepuestosAsignacionAsync,
    getIntervencionesPorReparacionAsync,
} from '../../../redux-tool-kit/reparacion/reparacion.actions';
import { AsignacionIntervencion, EstadoAsignacion, OrigenAsignacion } from '../../../types/intervencion';

const mockOpenModal = jest.fn();
const mockAgregarIntervencion = jest.fn();
const mockActualizarIncluirRepuesto = jest.fn();
const mockActualizarRepuestosAsignacion = jest.fn();

jest.mock('../../../redux-tool-kit/reparacion', () =>
    jest.requireActual('../../../redux-tool-kit/reparacion/reparacion.selectors')
);
jest.mock('../../../redux-tool-kit/reparacion/reparacion.actions', () => ({
    agregarIntervencionAReparacionAsync: jest.fn(),
    actualizarIncluirRepuestoAsignacionAsync: jest.fn(),
    actualizarRepuestosAsignacionAsync: jest.fn(),
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
    ComboBox: ({ options, value, onChange, placeholder }: any) => (
        <select
            aria-label={placeholder || 'Seleccionar una intervención...'}
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
    informe = '',
}: {
    estado?: string;
    isAdmin?: boolean;
    asignaciones?: AsignacionIntervencion[];
    informe?: string;
} = {}) => {
    const store = configureStore({
        reducer: {
            reparacion: (state = {
                coleccionReparaciones: {
                    'rep-1': {
                        id: 'rep-1',
                        data: {
                            EstadoRep: estado,
                            DescripcionTecRep: informe,
                            FeFinRep: null,
                        },
                    },
                },
                intervencionesDeReparacionActual: asignaciones,
                asignacionesCompromiso: [],
            }) => state,
            intervencion: (state = {
                coleccionIntervenciones: catalogoIntervencionesMock,
            }) => state,
            repuesto: (state = {
                coleccionRepuestos: {
                    'rep-motor': {
                        id: 'rep-motor',
                        data: { NombreRepu: 'Brazo con motor original', StockRepu: 0, ModelosDroneIds: [] },
                    },
                    'rep-sustituto': {
                        id: 'rep-sustituto',
                        data: { NombreRepu: 'Motor suelto compatible', StockRepu: 4, ModelosDroneIds: [] },
                    },
                },
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
        mockActualizarRepuestosAsignacion.mockResolvedValue({ descripcionTecActualizada: '' });
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
        (actualizarRepuestosAsignacionAsync as unknown as jest.Mock).mockImplementation(payload => () => {
            const resultado = Promise.resolve({});
            return Object.assign(resultado, { unwrap: () => mockActualizarRepuestosAsignacion(payload) });
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
        expect(screen.queryByRole('button', { name: /Cambiar repuestos/i })).not.toBeInTheDocument();
    });

    it('permite reemplazar el repuesto de una asignación presupuestada pendiente por un sustituto', async () => {
        renderReparar({
            informe: 'Diagnóstico previo.',
            asignaciones: [
                {
                    id: 'asig-presu',
                    data: {
                        reparacionId: 'rep-1',
                        intervencionId: 'int-con-repuesto',
                        estado: EstadoAsignacion.PENDIENTE,
                        origen: OrigenAsignacion.PRESUPUESTADA,
                        incluyeRepuestosTaller: true,
                        repuestosSnapshot: [{ partId: 'rep-motor', quantity: 1 }],
                        PrecioManoObra: 5000,
                        PrecioPiezas: 20000,
                        PrecioTotal: 25000,
                    },
                },
            ],
        });

        fireEvent.click(screen.getByRole('button', { name: /Cambiar repuestos de Cambio de motor/i }));

        const selectorInventario = screen.getByLabelText('Buscar repuesto en inventario...');
        fireEvent.change(selectorInventario, { target: { value: 'rep-sustituto' } });

        fireEvent.click(screen.getByRole('button', { name: 'Reemplazar' }));

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Guardar repuestos' }));
        });

        expect(mockActualizarRepuestosAsignacion).toHaveBeenCalledWith({
            asignacionId: 'asig-presu',
            repuestos: [{ partId: 'rep-sustituto', quantity: 1 }],
            textoInformeActual: 'Diagnóstico previo.',
        });
    });

    it('permite dejar una asignación presupuestada sin repuesto de stock', async () => {
        renderReparar({
            informe: '',
            asignaciones: [
                {
                    id: 'asig-sin-stock',
                    data: {
                        reparacionId: 'rep-1',
                        intervencionId: 'int-con-repuesto',
                        estado: EstadoAsignacion.PENDIENTE,
                        origen: OrigenAsignacion.PRESUPUESTADA,
                        incluyeRepuestosTaller: true,
                        repuestosSnapshot: [{ partId: 'rep-motor', quantity: 1 }],
                        PrecioManoObra: 5000,
                        PrecioPiezas: 20000,
                        PrecioTotal: 25000,
                    },
                },
            ],
        });

        fireEvent.click(screen.getByRole('button', { name: /Cambiar repuestos de Cambio de motor/i }));
        fireEvent.click(screen.getByRole('button', { name: 'Sin repuesto de stock' }));

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Guardar repuestos' }));
        });

        expect(mockActualizarRepuestosAsignacion).toHaveBeenCalledWith({
            asignacionId: 'asig-sin-stock',
            repuestos: [],
            textoInformeActual: '',
        });
    });

    it('muestra badge Repuesto sustituto y permite restaurar el repuesto original', async () => {
        renderReparar({
            informe: '- Cambio de motor: resuelto utilizando Motor suelto compatible.',
            asignaciones: [
                {
                    id: 'asig-sust',
                    data: {
                        reparacionId: 'rep-1',
                        intervencionId: 'int-con-repuesto',
                        estado: EstadoAsignacion.PENDIENTE,
                        origen: OrigenAsignacion.PRESUPUESTADA,
                        incluyeRepuestosTaller: true,
                        repuestosSnapshot: [{ partId: 'rep-sustituto', quantity: 1 }],
                        PrecioManoObra: 5000,
                        PrecioPiezas: 20000,
                        PrecioTotal: 25000,
                    },
                },
            ],
        });

        expect(screen.getByText('Repuesto sustituto')).toBeInTheDocument();
        expect(screen.getByText('Repuesto a usar: Motor suelto compatible')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Cambiar repuestos de Cambio de motor/i }));

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Restaurar original' }));
        });

        expect(mockActualizarRepuestosAsignacion).toHaveBeenCalledWith({
            asignacionId: 'asig-sust',
            restaurarOriginal: true,
            textoInformeActual: '- Cambio de motor: resuelto utilizando Motor suelto compatible.',
        });
    });
});
