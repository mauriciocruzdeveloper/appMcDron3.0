/// <reference types="jest" />

import { configureStore } from '@reduxjs/toolkit';
import { actualizarEstadoReparacionPersistencia, getReparacionesPorIntervencionPersistencia } from '../../persistencia/persistencia';
import { ReparacionRelacionada } from '../../types/reparacion';
import { enviarDroneEnviadoAsync, enviarReparacionFinalizadaAsync } from '../app/app.actions';
import {
  cambiarEstadoReparacionAsync,
  getReparacionesPorIntervencionAsync,
} from './reparacion.actions';
import reparacionReducer, { setReparaciones } from './reparacion.slice';
import {
  selectEstadoReparacionesPorIntervencionId,
  selectPuedeAvanzarA,
  selectReparacionesPorIntervencionId,
} from './reparacion.selectors';

jest.mock('../../persistencia/persistencia', () => ({
  actualizarEstadoReparacionPersistencia: jest.fn().mockResolvedValue(undefined),
  getReparacionesPorIntervencionPersistencia: jest.fn(),
}));

jest.mock('../app/app.actions', () => {
  return {
    enviarReciboAsync: jest.fn(),
    enviarDroneReparadoAsync: jest.fn(),
    enviarDroneDiagnosticadoAsync: jest.fn(),
    enviarDroneEnviadoAsync: jest.fn(),
    enviarReparacionFinalizadaAsync: jest.fn(),
  };
});

const getReparacionesMock = getReparacionesPorIntervencionPersistencia as jest.Mock;
const actualizarEstadoMock = actualizarEstadoReparacionPersistencia as jest.Mock;
const enviarDroneEnviadoMock = enviarDroneEnviadoAsync as unknown as jest.Mock;
const enviarReparacionFinalizadaMock = enviarReparacionFinalizadaAsync as unknown as jest.Mock;

const crearResultadoEmail = () => () => {
  const resultado: any = Promise.resolve({});
  resultado.unwrap = () => Promise.resolve({});
  return resultado;
};

const crearStore = () => configureStore({
  reducer: {
    reparacion: reparacionReducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware({
    serializableCheck: false,
  }),
});

const crearReparacion = (id: string): ReparacionRelacionada => ({
  id,
  data: {
    EstadoRep: 'Recibido',
    PrioridadRep: 1,
    FeConRep: null,
    ModeloDroneNameRep: 'Mavic Mini',
  },
});

describe('reparaciones por intervención', () => {
  beforeEach(() => {
    getReparacionesMock.mockReset();
  });

  it('carga y selecciona las reparaciones para el id solicitado', async () => {
    getReparacionesMock.mockResolvedValue([crearReparacion('rep-1')]);
    const store = crearStore();

    await store.dispatch(getReparacionesPorIntervencionAsync('int-1') as any);

    expect(selectReparacionesPorIntervencionId(store.getState() as any, 'int-1'))
      .toEqual([crearReparacion('rep-1')]);
    expect(selectEstadoReparacionesPorIntervencionId(store.getState() as any, 'int-1'))
      .toBe('succeeded');
  });

  it('ignora una respuesta anterior que llega después para el mismo id', async () => {
    let resolverPrimera: (reparaciones: ReparacionRelacionada[]) => void = () => undefined;
    let resolverSegunda: (reparaciones: ReparacionRelacionada[]) => void = () => undefined;
    getReparacionesMock
      .mockImplementationOnce(() => new Promise(resolve => { resolverPrimera = resolve; }))
      .mockImplementationOnce(() => new Promise(resolve => { resolverSegunda = resolve; }));
    const store = crearStore();

    const primera = store.dispatch(getReparacionesPorIntervencionAsync('int-1') as any);
    const segunda = store.dispatch(getReparacionesPorIntervencionAsync('int-1') as any);

    resolverSegunda([crearReparacion('rep-nueva')]);
    await segunda;
    resolverPrimera([crearReparacion('rep-vieja')]);
    await primera;

    expect(selectReparacionesPorIntervencionId(store.getState() as any, 'int-1'))
      .toEqual([crearReparacion('rep-nueva')]);
  });

  it('vacía el resultado y expone el error cuando la consulta falla', async () => {
    getReparacionesMock.mockRejectedValue(new Error('falló la consulta'));
    const store = crearStore();

    await store.dispatch(getReparacionesPorIntervencionAsync('int-1') as any);

    expect(selectReparacionesPorIntervencionId(store.getState() as any, 'int-1')).toEqual([]);
    expect(selectEstadoReparacionesPorIntervencionId(store.getState() as any, 'int-1'))
      .toBe('failed');
  });
});

describe('seguimiento requerido para enviar', () => {
  beforeEach(() => {
    actualizarEstadoMock.mockClear();
    enviarDroneEnviadoMock.mockImplementation(crearResultadoEmail);
    enviarReparacionFinalizadaMock.mockImplementation(crearResultadoEmail);
  });

  const cargarReparacionCobrada = (seguimiento: string) => {
    const store = crearStore();
    store.dispatch(setReparaciones([{
      ...crearReparacion('rep-envio'),
      data: {
        ...crearReparacion('rep-envio').data,
        EstadoRep: 'Cobrado',
        SeguimientoEntregaRep: seguimiento,
      },
    }]));
    return store;
  };

  it('no permite avanzar a Enviado con seguimiento vacío', () => {
    const store = cargarReparacionCobrada('   ');

    expect(selectPuedeAvanzarA('rep-envio', 'Enviado')(store.getState() as any))
      .toBe(false);
  });

  it('permite avanzar a Enviado con seguimiento informado', () => {
    const store = cargarReparacionCobrada('360003067941120');

    expect(selectPuedeAvanzarA('rep-envio', 'Enviado')(store.getState() as any))
      .toBe(true);
  });

  it('rechaza desde el thunk un intento de envío sin seguimiento', async () => {
    const store = cargarReparacionCobrada('');

    const resultado = await store.dispatch(cambiarEstadoReparacionAsync({
      reparacionId: 'rep-envio',
      nuevoEstado: 'Enviado',
    }) as any);

    expect(resultado.meta.requestStatus).toBe('rejected');
    expect((resultado.payload as Error).message)
      .toBe('El número de seguimiento es obligatorio para marcar la reparación como Enviado');
  });

  it('envía solamente el email de drone enviado al pasar a Enviado', async () => {
    const store = cargarReparacionCobrada('360003067941120');

    const resultado = await store.dispatch(cambiarEstadoReparacionAsync({
      reparacionId: 'rep-envio',
      nuevoEstado: 'Enviado',
      enviarEmail: true,
    }) as any);

    expect(resultado.meta.requestStatus).toBe('fulfilled');
    expect(enviarDroneEnviadoMock).toHaveBeenCalledTimes(1);
    expect(enviarReparacionFinalizadaMock).not.toHaveBeenCalled();
  });

  it('informa el fallo del email después de persistir el estado Enviado', async () => {
    enviarDroneEnviadoMock.mockImplementationOnce(() => () => {
      const resultado: any = Promise.resolve({});
      resultado.unwrap = () => Promise.reject(new Error('falló el email'));
      return resultado;
    });
    const store = cargarReparacionCobrada('360003067941120');

    const resultado = await store.dispatch(cambiarEstadoReparacionAsync({
      reparacionId: 'rep-envio',
      nuevoEstado: 'Enviado',
      enviarEmail: true,
    }) as any);

    expect(actualizarEstadoMock).toHaveBeenCalledTimes(1);
    expect(resultado.meta.requestStatus).toBe('rejected');
    expect(resultado.payload).toEqual({ emailFailed: true });
  });

  it('envía solamente el email de cierre al pasar de Enviado a Finalizado', async () => {
    const store = cargarReparacionCobrada('360003067941120');
    store.dispatch(setReparaciones([{
      ...crearReparacion('rep-envio'),
      data: {
        ...crearReparacion('rep-envio').data,
        EstadoRep: 'Enviado',
        SeguimientoEntregaRep: '360003067941120',
        FeEntRep: Date.now(),
      },
    }]));

    const resultado = await store.dispatch(cambiarEstadoReparacionAsync({
      reparacionId: 'rep-envio',
      nuevoEstado: 'Finalizado',
      enviarEmail: true,
    }) as any);

    expect(resultado.meta.requestStatus).toBe('fulfilled');
    expect(enviarReparacionFinalizadaMock).toHaveBeenCalledTimes(1);
    expect(enviarDroneEnviadoMock).not.toHaveBeenCalled();
  });
});
