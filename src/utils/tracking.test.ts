import {
  buildAndreaniTrackingUrl,
  buildTrackingUrl,
  isAndreaniTrackingNumber,
  normalizeTrackingNumber,
} from './tracking';

describe('tracking helpers', () => {
  it('normaliza el número de seguimiento quitando espacios', () => {
    expect(normalizeTrackingNumber('  AE-123456789-ES  ')).toBe('AE-123456789-ES');
  });

  it('genera una URL directa de seguimiento para 17TRACK', () => {
    const url = buildTrackingUrl('AE-123456789-ES');

    expect(url).toBe('https://t.17track.net/es#nums=AE-123456789-ES');
  });

  it('no genera URL cuando no hay número de seguimiento', () => {
    expect(buildTrackingUrl('   ')).toBeNull();
  });

  it('detecta un número Andreani de 15 dígitos', () => {
    expect(isAndreaniTrackingNumber(' 360003067941120 ')).toBe(true);
  });

  it.each([
    '36000306794112',
    '3600030679411200',
    '36000306794112A',
    '',
    null,
  ])('no identifica como Andreani el seguimiento %p', (tracking) => {
    expect(isAndreaniTrackingNumber(tracking)).toBe(false);
    expect(buildAndreaniTrackingUrl(tracking)).toBeNull();
  });

  it('genera la URL oficial de seguimiento Andreani', () => {
    expect(buildAndreaniTrackingUrl(' 360003067941120 '))
      .toBe('https://www.andreani.com/envio/360003067941120');
  });
});
