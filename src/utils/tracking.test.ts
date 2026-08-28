import {
  buildAndreaniTrackingUrl,
  buildMailAmericasTrackingUrl,
  buildTrackingUrl,
  isAndreaniTrackingNumber,
  isMailAmericasTrackingNumber,
  normalizeTrackingNumber,
} from './tracking';

describe('tracking helpers', () => {
  it('normaliza el número de seguimiento quitando espacios', () => {
    expect(normalizeTrackingNumber('  AE-123456789-ES  ')).toBe('AE-123456789-ES');
  });

  it('genera una URL de seguimiento por defecto para ParcelsApp', () => {
    const url = buildTrackingUrl('AE-123456789-ES');

    expect(url).toBe('https://parcelsapp.com/es/tracking/AE-123456789-ES');
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

  it('detecta un número de seguimiento MailAmericas', () => {
    expect(isMailAmericasTrackingNumber(' MLAR048983277EX ')).toBe(true);
    expect(isMailAmericasTrackingNumber('mlar048983277ex')).toBe(true);
  });

  it.each([
    '123456',
    'AE-123456789-ES',
    '',
    null,
  ])('no identifica como MailAmericas el seguimiento %p', (tracking) => {
    expect(isMailAmericasTrackingNumber(tracking)).toBe(false);
    expect(buildMailAmericasTrackingUrl(tracking)).toBeNull();
  });

  it('genera la URL oficial de seguimiento MailAmericas', () => {
    expect(buildMailAmericasTrackingUrl(' MLAR048983277EX '))
      .toBe('https://mailamericas.com/tracking?number_id=MLAR048983277EX');
  });

  it('buildTrackingUrl devuelve la URL directa de MailAmericas o Andreani según el proveedor', () => {
    expect(buildTrackingUrl('MLAR048983277EX'))
      .toBe('https://mailamericas.com/tracking?number_id=MLAR048983277EX');
    expect(buildTrackingUrl('360003067941120'))
      .toBe('https://www.andreani.com/envio/360003067941120');
  });
});
