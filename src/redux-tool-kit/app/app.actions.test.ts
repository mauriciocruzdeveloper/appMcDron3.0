import { construirPayloadDroneEnviado, construirPayloadReparacionFinalizada } from './app.actions';
import { ReparacionType } from '../../types/reparacion';

const crearReparacion = (seguimiento: string): ReparacionType => ({
  id: 'repair-id',
  data: {
    NombreUsu: 'Ada',
    ApellidoUsu: 'Lovelace',
    EmailUsu: 'ada@example.com',
    TelefonoUsu: '3415555555',
    UsuarioRep: 'user-id',
    ModeloDroneNameRep: 'DJI Mini 4 Pro',
    IdPublicoRep: 'REP-42',
    FeEntRep: 1788278400000,
    SeguimientoEntregaRep: seguimiento,
  } as any,
});

describe('construirPayloadDroneEnviado', () => {
  it('normaliza el codigo e incluye el enlace oficial para Andreani', () => {
    const payload = construirPayloadDroneEnviado(
      crearReparacion(' 360003067941120 '),
      'contacto@example.com',
      'DJI Mini 4 Pro',
    );

    expect(payload.seguimiento).toBe('360003067941120');
    expect(payload.url_seguimiento).toBe('https://www.andreani.com/envio/360003067941120');
    expect(payload.email).toBe('contacto@example.com');
  });

  it('incluye el codigo sin enlace Andreani para otro transportista', () => {
    const payload = construirPayloadDroneEnviado(
      crearReparacion('MLAR123456789AR'),
      'ada@example.com',
      'DJI Mini 4 Pro',
    );

    expect(payload.seguimiento).toBe('MLAR123456789AR');
    expect(payload.url_seguimiento).toBeNull();
  });
});

describe('construirPayloadReparacionFinalizada', () => {
  it('identifica la reparacion, el drone y el destinatario', () => {
    const payload = construirPayloadReparacionFinalizada(
      crearReparacion('360003067941120'),
      'contacto@example.com',
      'DJI Mini 4 Pro',
    );

    expect(payload).toEqual(expect.objectContaining({
      cliente: 'Ada Lovelace',
      nro_reparacion: 'REP-42',
      equipo: 'DJI Mini 4 Pro',
      email: 'contacto@example.com',
    }));
  });
});