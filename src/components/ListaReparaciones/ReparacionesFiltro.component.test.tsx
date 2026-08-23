import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ReparacionesFiltro from './ReparacionesFiltro.component';

const createStore = () => configureStore({
  reducer: {
    reparacion: (state = {
      filter: {
        estadosPrioritarios: false,
        search: '',
        estadosReparacion: ['Reparado'],
      },
      coleccionReparaciones: {},
      intervencionesDeReparacionActual: [],
    }, action) => state,
    modeloDrone: (state = {
      filter: '',
      coleccionModelosDrone: {
        'modelo-1': {
          id: 'modelo-1',
          data: {
            NombreModelo: 'Mavic',
          },
        },
      },
      selectedModeloDrone: null,
      isFetchingModeloDrone: false,
    }, action) => state,
  },
});

describe('ReparacionesFiltro', () => {
  it('muestra el botón de restaurar filtros aunque el panel esté cerrado', () => {
    const onReset = jest.fn();
    const store = createStore();

    render(
      <Provider store={store}>
        <ReparacionesFiltro
          selectedModelo=""
          onModeloChange={jest.fn()}
          onReset={onReset}
        />
      </Provider>
    );

    expect(screen.getByRole('button', { name: /restaurar filtros/i })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/buscar reparaciones/i)).not.toBeInTheDocument();
  });
});
