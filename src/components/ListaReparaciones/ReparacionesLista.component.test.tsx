/// <reference types="jest" />

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ReparacionesLista from './ReparacionesLista.component';

jest.mock('../../hooks/useHistory', () => ({
  useHistory: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    goBack: jest.fn(),
    location: { pathname: '/inicio/reparaciones', search: '', hash: '', state: null, key: 'test' },
  }),
}));

const createStore = () => configureStore({
  reducer: {
    app: (state = { usuario: null }, action) => state,
    drone: (state = { coleccionDrones: {} }, action) => state,
    modeloDrone: (state = { coleccionModelosDrone: {} }, action) => state,
    reparacion: (state = {
      filter: {},
      coleccionReparaciones: {
        'rep-1': {
          id: 'rep-1',
          data: {
            EstadoRep: 'Rechazado',
            ModeloDroneNameRep: 'Mini 4 Pro',
            NombreUsu: 'Juan Perez',
            PresuFiRep: 450,
            PresuDiRep: 120,
          },
        },
      },
    }, action) => state,
    intervencion: (state = { coleccionIntervenciones: {} }, action) => state,
    repuesto: (state = { coleccionRepuestos: {} }, action) => state,
    pedidoRepuesto: (state = { coleccionPedidos: {} }, action) => state,
  },
});

describe('ReparacionesLista', () => {
  it('muestra el precio del diagnóstico cuando la reparación está rechazada', () => {
    const store = createStore();

    render(
      <Provider store={store}>
        <ReparacionesLista reparaciones={[{
          id: 'rep-1',
          data: {
            EstadoRep: 'Rechazado',
            ModeloDroneNameRep: 'Mini 4 Pro',
            NombreUsu: 'Juan Perez',
            PresuFiRep: 450,
            PresuDiRep: 120,
          },
        }]} />
      </Provider>
    );

    expect(screen.getByText('$120')).toBeInTheDocument();
    expect(screen.queryByText('$450')).not.toBeInTheDocument();
  });

  it('mantiene el precio del diagnóstico cuando la reparación ya está diagnosticada', () => {
    const store = createStore();

    render(
      <Provider store={store}>
        <ReparacionesLista reparaciones={[{
          id: 'rep-2',
          data: {
            EstadoRep: 'Diagnosticado',
            ModeloDroneNameRep: 'Mini 4 Pro',
            NombreUsu: 'Juan Perez',
            PresuFiRep: 450,
            PresuDiRep: 120,
          },
        }]} />
      </Provider>
    );

    expect(screen.getByText('$120')).toBeInTheDocument();
    expect(screen.queryByText('$450')).not.toBeInTheDocument();
  });
});
