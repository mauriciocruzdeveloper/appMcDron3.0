/// <reference types="jest" />

import { describe, expect, it } from '@jest/globals';
import {
    esEmailOpcionalValido,
    esEmailValido,
    MENSAJE_EMAIL_INVALIDO,
    normalizarEmail,
    validarEmail,
    validarEmailOpcional,
} from './validarEmail';

describe('validarEmail', () => {
    it.each([
        'cliente@gmail.com',
        'juan.perez@dominio.com.ar',
        'user_123+dji@sub.empresa-drones.org',
        '  cliente@gmail.com  ',
        'INFO@MAURICIOCRUZDRONES.COM.AR',
    ])('acepta el email válido %p', (email) => {
        expect(esEmailValido(email)).toBe(true);
        expect(esEmailOpcionalValido(email)).toBe(true);
        expect(() => validarEmail(email)).not.toThrow();
        expect(() => validarEmailOpcional(email)).not.toThrow();
    });

    it.each([
        '',
        '   ',
        'maría@gmail.com',
        'josé.lópez@gmail.com',
        'cliente@gmáil.com',
        'ñoño@gmail.com',
        'pingüino@gmail.com',
        'juan perez@gmail.com',
        'juan@gmail .com',
        'juangmail.com',
        'juan@@gmail.com',
        '@gmail.com',
        'juan@',
        'juan@gmail',
        'juan@gmail.c',
        'juan@gmail.123',
        '.juan@gmail.com',
        'juan.@gmail.com',
        'juan..perez@gmail.com',
        'juan@-gmail.com',
        'juan@gmail-.com',
    ])('rechaza el email inválido %p', (email) => {
        expect(esEmailValido(email)).toBe(false);
        expect(() => validarEmail(email)).toThrow(MENSAJE_EMAIL_INVALIDO);
    });

    it('permite valores vacíos cuando el email es opcional pero rechaza formatos inválidos', () => {
        expect(esEmailOpcionalValido('')).toBe(true);
        expect(esEmailOpcionalValido('   ')).toBe(true);
        expect(esEmailOpcionalValido(undefined)).toBe(true);
        expect(() => validarEmailOpcional('')).not.toThrow();
        expect(() => validarEmailOpcional('maría@gmail.com')).toThrow(MENSAJE_EMAIL_INVALIDO);
    });

    it('normaliza espacios laterales sin alterar el resto del correo', () => {
        expect(normalizarEmail('  cliente@gmail.com  ')).toBe('cliente@gmail.com');
        expect(normalizarEmail(undefined)).toBe('');
    });
});
