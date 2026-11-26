/// <reference types="jest" />

import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { guardarUsuarioPersistencia } from '../../persistencia/persistencia';
import { MENSAJE_EMAIL_INVALIDO } from '../../usecases/validarEmail';
import {
  guardarPresupuestadoAsync,
  guardarReciboAsync,
  guardarTransitoAsync,
} from './reparacion.actions';

declare const jest: typeof import('@jest/globals').jest;

jest.mock('../../persistencia/persistencia');

const guardarUsuarioMock = guardarUsuarioPersistencia as ReturnType<typeof jest.fn>;
const crearStore = () => configureStore({ reducer: (state = {}) => state });

describe('validación de email en altas de reparación', () => {
  beforeEach(() => {
    guardarUsuarioMock.mockReset();
  });

  it.each([
    ['recepción con tilde', guardarReciboAsync, 'maría@gmail.com'],
    ['tránsito con tilde', guardarTransitoAsync, 'josé@gmail.com'],
    ['presupuesto con ñ', guardarPresupuestadoAsync, 'ñoño@gmail.com'],
    ['recepción mal formado', guardarReciboAsync, 'cliente@gmail'],
  ])('rechaza %s antes de persistir el usuario', async (_flujo, action, emailInvalido) => {
    const store = crearStore();
    const result = await store.dispatch(
      action({
        EmailUsu: emailInvalido,
        TelefonoUsu: '3416559834',
        NombreUsu: 'María',
      } as any) as any,
    );

    expect(result).toMatchObject({
      payload: MENSAJE_EMAIL_INVALIDO,
      meta: { requestStatus: 'rejected' },
    });
    expect(guardarUsuarioMock).not.toHaveBeenCalled();
  });
});
