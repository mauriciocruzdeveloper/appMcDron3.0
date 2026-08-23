/// <reference types="jest" />

import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { guardarUsuarioPersistencia } from '../../persistencia/persistencia';
import { Usuario } from '../../types/usuario';
import { guardarUsuarioAsync } from './usuario.actions';

declare const jest: typeof import('@jest/globals').jest;

jest.mock('../../persistencia/persistencia');

const guardarUsuarioMock = guardarUsuarioPersistencia as ReturnType<typeof jest.fn>;

const crearUsuario = (cuit: string): Usuario => ({
    id: 'usuario-1',
    data: {
        NombreUsu: 'Cliente',
        TelefonoUsu: '',
        Role: 'cliente',
        CUIT: cuit,
    },
});

const crearStore = () => configureStore({ reducer: (state = {}) => state });

describe('guardarUsuarioAsync', () => {
    beforeEach(() => {
        guardarUsuarioMock.mockReset();
    });

    it('persiste el CUIT válido normalizado', async () => {
        guardarUsuarioMock.mockImplementation(async (usuario: Usuario) => usuario);

        const store = crearStore();
        const result = await store.dispatch(guardarUsuarioAsync(crearUsuario('27-12345678-0')) as any);

        expect(result.meta.requestStatus).toBe('fulfilled');
        expect(guardarUsuarioMock).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ CUIT: '27123456780' }),
        }));
    });

    it('rechaza la action cuando el CUIT es inválido, sin persistir', async () => {
        guardarUsuarioMock.mockImplementation(async (usuario: Usuario) => usuario);

        const store = crearStore();
        const result = await store.dispatch(guardarUsuarioAsync(crearUsuario('20123456789')) as any);

        expect(result.meta.requestStatus).toBe('rejected');
        expect(guardarUsuarioMock).not.toHaveBeenCalled();
    });

    it('rechaza la action cuando falla la persistencia', async () => {
        guardarUsuarioMock.mockRejectedValue(new Error('No se pudo guardar el CUIT'));

        const store = crearStore();
        const result = await store.dispatch(guardarUsuarioAsync(crearUsuario('27123456780')) as any);

        expect(result).toMatchObject({
            error: { message: 'No se pudo guardar el CUIT' },
            meta: { requestStatus: 'rejected' },
        });
    });
});