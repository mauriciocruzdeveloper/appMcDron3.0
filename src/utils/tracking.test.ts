import { buildTrackingUrl, normalizeTrackingNumber } from './tracking';

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
});
