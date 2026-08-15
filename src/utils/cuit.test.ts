/// <reference types="jest" />

import { isValidCuit, normalizeCuit, sanitizeCuitInput } from './cuit';

describe('cuit helpers', () => {
  it('normaliza un CUIT con separadores y caracteres extraños', () => {
    expect(normalizeCuit('20-12345678-9')).toBe('20123456789');
    expect(normalizeCuit('  27 / 12345678 / 0  ')).toBe('27123456780');
  });

  it('mantiene el campo opcional vacío cuando no hay valor', () => {
    expect(normalizeCuit('')).toBe('');
    expect(normalizeCuit(null)).toBe('');
    expect(sanitizeCuitInput('abc')).toBe('');
  });

  it('acepta solamente CUIT completos con dígito verificador válido', () => {
    expect(isValidCuit('27-12345678-0')).toBe(true);
    expect(sanitizeCuitInput('27-12345678-0')).toBe('27123456780');

    expect(isValidCuit('20-12345678-9')).toBe(false);
    expect(sanitizeCuitInput('20-12345678-9')).toBe('');
    expect(sanitizeCuitInput('271234567801')).toBe('');
    expect(sanitizeCuitInput('123')).toBe('');
  });
});
