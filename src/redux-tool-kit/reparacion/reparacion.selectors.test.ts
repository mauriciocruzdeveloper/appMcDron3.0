/// <reference types="jest" />

import { configureStore } from '@reduxjs/toolkit';
import { getReparacionesPorIntervencionPersistencia } from '../../persistencia/persistencia';
import { ReparacionRelacionada } from '../../types/reparacion';
import appReducer from '../app/app.slice';
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
  getReparacionesPorIntervencionPersistencia: jest.fn(),
}));

const getReparacionesMock = getReparacionesPorIntervencionPersistencia as jest.Mock;

const crearStore = () => configureStore({
  reducer: {
    app: appReducer,
    reparacion: reparacionReducer,
  },
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
});
