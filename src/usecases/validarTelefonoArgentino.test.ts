/// <reference types="jest" />

import { describe, expect, it } from '@jest/globals';
import {
    esTelefonoArgentinoValido,
    MENSAJE_TELEFONO_ARGENTINO_INVALIDO,
    validarTelefonoArgentino,
} from './validarTelefonoArgentino';

describe('validarTelefonoArgentino', () => {
    it.each([
        '',
        '   ',
        '3416559834',
        '03416559834',
        '+543416559834',
        '+5493416559834',
        '(0341) 655-9834',
        '+54 9 (341) 655-9834',
        '0341 15-655-9834',
        '011 15-1234-5678',
    ])('acepta el formato argentino %p', (telefono) => {
        expect(esTelefonoArgentinoValido(telefono)).toBe(true);
        expect(() => validarTelefonoArgentino(telefono)).not.toThrow();
    });

    it.each([
        '341655983',
        '34165598345',
        '+553416559834',
        '5493416559834',
        '+54+93416559834',
        '9416559834',
        '341/6559834',
        'telefono',
    ])('rechaza el formato no admitido %p', (telefono) => {
        expect(esTelefonoArgentinoValido(telefono)).toBe(false);
        expect(() => validarTelefonoArgentino(telefono)).toThrow(MENSAJE_TELEFONO_ARGENTINO_INVALIDO);
    });
});