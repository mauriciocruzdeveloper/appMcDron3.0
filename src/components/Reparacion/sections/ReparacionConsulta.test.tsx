import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { ReparacionConsulta } from './ReparacionConsulta';

jest.mock('../../../redux-tool-kit/reparacion', () =>
    jest.requireActual('../../../redux-tool-kit/reparacion/reparacion.selectors')
);
jest.mock('../../../redux-tool-kit/reparacion/reparacion.actions', () => ({
    actualizarCampoReparacionAsync: jest.fn(),
    cambiarEstadoReparacionAsync: jest.fn(),
    cambiarModeloDroneEnReparacionAsync: jest.fn(),
}));
jest.mock('../../../hooks/useDebouncedField', () => ({
    useDebouncedField: ({ valorInicial }: { valorInicial: string }) => ({
        value: valorInicial,
        isSaving: false,
        onChange: jest.fn(),
    }),
}));
jest.mock('../../../utils/sendEmails', () => ({
    enviarEmailVacio: jest.fn(),
}));
jest.mock('./ReparacionSeccionColapsable', () => ({
    ReparacionSeccionColapsable: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
}));

interface RenderConsultaOptions {
    isAdmin?: boolean;
    reparacionData?: Record<string, unknown>;
    drones?: Record<string, unknown>;
    modelosDrone?: Record<string, unknown>;
}

const renderConsulta = ({
    isAdmin = true,
    reparacionData = {},
    drones = {},
    modelosDrone = {},
}: RenderConsultaOptions = {}) => {
    const store = configureStore({
        reducer: {
            reparacion: (state = {
                coleccionReparaciones: {
                    'rep-1': {
                        id: 'rep-1',
                        data: {
                            EstadoRep: 'Consulta',
                            UsuarioRep: 'usu-1',
                            DescripcionUsuRep: 'No enciende',
                            ...reparacionData,
                        },
                    },
                },
                intervencionesDeReparacionActual: [],
            }) => state,
            usuario: (state = {
                coleccionUsuarios: {
                    'usu-1': {
                        id: 'usu-1',
                        data: {
                            NombreUsu: 'Juan',
                            ApellidoUsu: 'Pérez',
                            EmailUsu: 'juan@gmail.com',
                            TelefonoUsu: '3416559834',
                            Role: 'cliente',
                        },
                    },
                },
            }) => state,
            drone: (state = { coleccionDrones: drones }) => state,
            modeloDrone: (state = { coleccionModelosDrone: modelosDrone }) => state,
        },
    });

    return render(
        <MemoryRouter>
            <Provider store={store}>
                <ReparacionConsulta reparacionId="rep-1" isAdmin={isAdmin} />
            </Provider>
        </MemoryRouter>
    );
};

describe('ReparacionConsulta - Acceso a editar modelo de drone', () => {
    const catalogoModelos = {
        'mod-1': {
            id: 'mod-1',
            data: {
                NombreModelo: 'Mini 4 Pro',
                Fabricante: 'DJI',
                DescripcionModelo: '',
                PrecioReferencia: 1500000,
            },
        },
    };

    it('muestra enlace para editar el modelo cuando hay DroneId con ModeloDroneId asignado', () => {
        renderConsulta({
            isAdmin: true,
            reparacionData: { DroneId: 'drone-1' },
            drones: {
                'drone-1': {
                    id: 'drone-1',
                    data: {
                        Nombre: 'Mini 4 Pro - Juan',
                        ModeloDroneId: 'mod-1',
                        Propietario: 'usu-1',
                        NumeroSerie: '',
                        Observaciones: '',
                    },
                },
            },
            modelosDrone: catalogoModelos,
        });

        const link = screen.getByRole('link', { name: 'Editar modelo de drone' });
        expect(link).toHaveAttribute('href', '/inicio/modelos-drone/mod-1');
    });

    it('muestra enlace para editar el modelo cuando no hay DroneId pero el nombre coincide con el catálogo', () => {
        renderConsulta({
            isAdmin: true,
            reparacionData: { ModeloDroneNameRep: 'Mini 4 Pro' },
            modelosDrone: catalogoModelos,
        });

        const link = screen.getByRole('link', { name: 'Editar modelo de drone' });
        expect(link).toHaveAttribute('href', '/inicio/modelos-drone/mod-1');
    });

    it('oculta el enlace cuando no hay modelo del catálogo asociado', () => {
        renderConsulta({
            isAdmin: true,
            reparacionData: { ModeloDroneNameRep: 'Modelo inexistente' },
            modelosDrone: catalogoModelos,
        });

        expect(screen.queryByRole('link', { name: 'Editar modelo de drone' })).not.toBeInTheDocument();
    });

    it('oculta el enlace cuando el usuario no es admin', () => {
        renderConsulta({
            isAdmin: false,
            reparacionData: { DroneId: 'drone-1' },
            drones: {
                'drone-1': {
                    id: 'drone-1',
                    data: {
                        Nombre: 'Mini 4 Pro - Juan',
                        ModeloDroneId: 'mod-1',
                        Propietario: 'usu-1',
                        NumeroSerie: '',
                        Observaciones: '',
                    },
                },
            },
            modelosDrone: catalogoModelos,
        });

        expect(screen.queryByRole('link', { name: 'Editar modelo de drone' })).not.toBeInTheDocument();
    });
});
