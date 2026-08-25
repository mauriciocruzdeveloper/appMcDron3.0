/// <reference types="jest" />

import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import EstadisticasModelosDrone from './EstadisticasModelosDrone.component';

jest.mock('react-chartjs-2', () => ({
    Bar: () => <div data-testid="ranking-chart" />,
}));

const crearStore = () => configureStore({
    reducer: {
        reparacion: (state = {
            coleccionReparaciones: {
                'rep-1': {
                    id: 'rep-1',
                    data: {
                        EstadoRep: 'Finalizado',
                        PrioridadRep: 1,
                        FeConRep: Date.now(),
                        FeFinRep: Date.now(),
                        ModeloDroneNameRep: 'Mini 3 Pro',
                        DescripcionUsuRep: '',
                        UsuarioRep: 'usuario-1',
                        DroneId: 'drone-1',
                    },
                },
            },
        }, action) => state,
        drone: (state = {
            coleccionDrones: {
                'drone-1': {
                    id: 'drone-1',
                    data: {
                        ModeloDroneId: 'modelo-1',
                        Propietario: 'usuario-1',
                        Nombre: 'Drone de prueba',
                        NumeroSerie: 'SERIE-1',
                    },
                },
            },
        }, action) => state,
        modeloDrone: (state = {
            coleccionModelosDrone: {
                'modelo-1': {
                    id: 'modelo-1',
                    data: {
                        NombreModelo: 'Mini 3 Pro',
                        Fabricante: 'DJI',
                        DescripcionModelo: '',
                        PrecioReferencia: 0,
                        code: 'MINI3',
                    },
                },
            },
        }, action) => state,
    },
});

describe('EstadisticasModelosDrone', () => {
    it('muestra el ranking y propone las cajas disponibles', () => {
        render(
            <Provider store={crearStore()}>
                <EstadisticasModelosDrone />
            </Provider>
        );

        expect(screen.getByRole('heading', { name: /estadísticas por modelo de drone/i }))
            .toBeInTheDocument();
        expect(screen.getByTestId('ranking-chart')).toBeInTheDocument();
        expect(screen.getAllByText(/mini 3 pro/i).length).toBeGreaterThan(0);
        expect(screen.getByText('Caja 1')).toBeInTheDocument();
        expect(screen.getAllByText('Modelo exclusivo')).toHaveLength(25);
    });

    it('rechaza una cantidad de cajas vacía', () => {
        render(
            <Provider store={crearStore()}>
                <EstadisticasModelosDrone />
            </Provider>
        );

        fireEvent.change(screen.getByLabelText(/cantidad de cajas disponibles/i), {
            target: { value: '' },
        });

        expect(screen.getByText(/ingresá un número entero mayor o igual a uno/i))
            .toBeInTheDocument();
        expect(screen.queryByText('Caja 1')).not.toBeInTheDocument();
    });
});