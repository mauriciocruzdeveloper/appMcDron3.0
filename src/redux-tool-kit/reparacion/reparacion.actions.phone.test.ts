/// <reference types="jest" />

import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { guardarUsuarioPersistencia } from '../../persistencia/persistencia';
import { MENSAJE_TELEFONO_ARGENTINO_INVALIDO } from '../../usecases/validarTelefonoArgentino';
import {
  guardarPresupuestadoAsync,
  guardarReciboAsync,
  guardarTransitoAsync,
} from './reparacion.actions';

declare const jest: typeof import('@jest/globals').jest;

jest.mock('../../persistencia/persistencia');

const guardarUsuarioMock = guardarUsuarioPersistencia as ReturnType<typeof jest.fn>;
const crearStore = () => configureStore({ reducer: (state = {}) => state });

describe('validación de teléfono en altas de reparación', () => {
  beforeEach(() => {
    guardarUsuarioMock.mockReset();
  });

  it.each([
    ['recepción', guardarReciboAsync],
    ['tránsito', guardarTransitoAsync],
    ['presupuesto', guardarPresupuestadoAsync],
  ])('rechaza %s antes de persistir el usuario', async (_flujo, action) => {
    const store = crearStore();
    const result = await store.dispatch(action({ TelefonoUsu: '12345' } as any) as any);

    expect(result).toMatchObject({
      payload: MENSAJE_TELEFONO_ARGENTINO_INVALIDO,
      meta: { requestStatus: 'rejected' },
    });
    expect(guardarUsuarioMock).not.toHaveBeenCalled();
  });
});