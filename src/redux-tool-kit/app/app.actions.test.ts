import { construirPayloadDroneAbandonado, construirPayloadDroneEnviado, construirPayloadReparacionFinalizada, enviarDroneDiagnosticadoAsync } from './app.actions';
import { ReparacionType } from '../../types/reparacion';
import { callEndpoint } from '../../utils/utils';

jest.mock('../../utils/utils', () => ({
  ...jest.requireActual('../../utils/utils'),
  callEndpoint: jest.fn(),
}));

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

describe('construirPayloadDroneAbandonado', () => {
  it('identifica la reparación, el drone y el destinatario', () => {
    const payload = construirPayloadDroneAbandonado(
      crearReparacion(''),
      'contacto@example.com',
      'DJI Mini 4 Pro',
    );

    expect(payload).toEqual(expect.objectContaining({
      cliente: 'Ada Lovelace',
      nro_reparacion: 'REP-42',
      equipo: 'DJI Mini 4 Pro',
      email: 'contacto@example.com',
    }));
    expect(payload.fecha_notificacion).toBeTruthy();
  });
});

describe('email de drone diagnosticado', () => {
  beforeEach(() => {
    (callEndpoint as jest.Mock).mockResolvedValue({});
  });

  it.each([undefined, '', '   ', '\n\t '])('remite al presupuesto cuando el informe es %p', async informe => {
    const reparacion = crearReparacion('');
    reparacion.data.DescripcionTecRep = informe;
    const resultado = await enviarDroneDiagnosticadoAsync(reparacion)(
      jest.fn(),
      () => ({ usuario: { coleccionUsuarios: {} } }) as any,
      undefined,
    );

    expect(resultado.meta.requestStatus).toBe('fulfilled');
    expect(callEndpoint).toHaveBeenLastCalledWith(expect.objectContaining({
      body: expect.objectContaining({
        diagnostico: 'El diagnóstico se encuentra detallado en el presupuesto enviado.',
      }),
    }));
  });

  it('conserva el informe del tecnico cuando hay texto', async () => {
    const reparacion = crearReparacion('');
    const informe = '  Motor dañado.\nSe recomienda reemplazarlo.  ';
    reparacion.data.DescripcionTecRep = informe;
    await enviarDroneDiagnosticadoAsync(reparacion)(
      jest.fn(),
      () => ({ usuario: { coleccionUsuarios: {} } }) as any,
      undefined,
    );

    expect(callEndpoint).toHaveBeenLastCalledWith(expect.objectContaining({
      body: expect.objectContaining({ diagnostico: informe }),
    }));
  });
});