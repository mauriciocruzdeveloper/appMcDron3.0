/// <reference types="jest" />

import { configureStore } from '@reduxjs/toolkit';
import {
  agregarIntervencionAReparacionPersistencia,
  actualizarFechaAvisoAbandonoPersistencia,
  actualizarEstadoReparacionPersistencia,
  aplicarMovimientoStockPersistencia,
  actualizarPreciosPiezasAsignacionPersistencia,
  eliminarIntervencionDeReparacionPersistencia,
  getIntervencionPersistencia,
  getIntervencionesPorReparacionPersistencia,
  getReparacionesPorIntervencionPersistencia,
  guardarReparacionPersistencia,
} from '../../persistencia/persistencia';
import { EstadoAsignacion, OrigenAsignacion } from '../../types/intervencion';
import { ReparacionRelacionada, ReparacionType } from '../../types/reparacion';
import { enviarEmailAvisoAbandonoAsync, enviarDroneEnviadoAsync, enviarReparacionFinalizadaAsync } from '../app/app.actions';
import repuestoReducer, { setRepuestos } from '../repuesto/repuesto.slice';
import { RootState } from '../store';
import {
  agregarIntervencionAReparacionAsync,
  actualizarIncluirRepuestoAsignacionAsync,
  cancelarAvisoAbandonoAsync,
  cambiarEstadoReparacionAsync,
  eliminarIntervencionDeReparacionAsync,
  enviarAvisoAbandonoAsync,
  getReparacionesPorIntervencionAsync,
} from './reparacion.actions';
import reparacionReducer, { setIntervencionesDeReparacionActual, setReparaciones } from './reparacion.slice';
import {
  selectEstadoReparacionesPorIntervencionId,
  selectIntervencionesPresupuestadas,
  selectPuedeAvanzarA,
  selectReparacionesListasParaAvisoAbandono,
  selectReparacionesPorIntervencionId,
  selectTotalIntervenciones,
} from './reparacion.selectors';

jest.mock('../../persistencia/persistencia', () => ({
  agregarIntervencionAReparacionPersistencia: jest.fn(),
  actualizarFechaAvisoAbandonoPersistencia: jest.fn().mockResolvedValue(undefined),
  actualizarEstadoReparacionPersistencia: jest.fn().mockResolvedValue(undefined),
  aplicarMovimientoStockPersistencia: jest.fn(),
  actualizarPreciosPiezasAsignacionPersistencia: jest.fn(),
  eliminarIntervencionDeReparacionPersistencia: jest.fn(),
  getIntervencionPersistencia: jest.fn(),
  getIntervencionesPorReparacionPersistencia: jest.fn(),
  getReparacionesPorIntervencionPersistencia: jest.fn(),
  guardarReparacionPersistencia: jest.fn(),
}));

jest.mock('../app/app.actions', () => {
  return {
    enviarReciboAsync: jest.fn(),
    enviarDroneReparadoAsync: jest.fn(),
    enviarDroneDiagnosticadoAsync: jest.fn(),
    enviarEmailAvisoAbandonoAsync: jest.fn(),
    enviarDroneEnviadoAsync: jest.fn(),
    enviarReparacionFinalizadaAsync: jest.fn(),
  };
});

const getReparacionesMock = getReparacionesPorIntervencionPersistencia as jest.Mock;
const getIntervencionesMock = getIntervencionesPorReparacionPersistencia as jest.Mock;
const getIntervencionMock = getIntervencionPersistencia as jest.Mock;
const agregarIntervencionMock = agregarIntervencionAReparacionPersistencia as jest.Mock;
const eliminarIntervencionMock = eliminarIntervencionDeReparacionPersistencia as jest.Mock;
const guardarReparacionMock = guardarReparacionPersistencia as jest.Mock;
const actualizarEstadoMock = actualizarEstadoReparacionPersistencia as jest.Mock;
const actualizarFechaAvisoMock = actualizarFechaAvisoAbandonoPersistencia as jest.Mock;
const aplicarMovimientoStockMock = aplicarMovimientoStockPersistencia as jest.Mock;
const actualizarPreciosPiezasMock = actualizarPreciosPiezasAsignacionPersistencia as jest.Mock;
const enviarDroneEnviadoMock = enviarDroneEnviadoAsync as unknown as jest.Mock;
const enviarDroneAbandonadoMock = enviarEmailAvisoAbandonoAsync as unknown as jest.Mock;
const enviarReparacionFinalizadaMock = enviarReparacionFinalizadaAsync as unknown as jest.Mock;

const crearResultadoEmail = () => () => {
  const resultado: any = Promise.resolve({});
  resultado.unwrap = () => Promise.resolve({});
  return resultado;
};

const crearStore = () => configureStore({
  reducer: {
    reparacion: reparacionReducer,
    repuesto: repuestoReducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware({
    serializableCheck: false,
  }),
});

const crearReparacion = (id: string): ReparacionType => ({
  id,
  data: {
    EstadoRep: 'Recibido',
    PrioridadRep: 1,
    FeConRep: null,
    ModeloDroneNameRep: 'Mavic Mini',
    DescripcionUsuRep: '',
    UsuarioRep: 'usuario-test',
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

describe('abandono de reparación', () => {
  beforeEach(() => {
    actualizarEstadoMock.mockClear();
    actualizarFechaAvisoMock.mockClear();
    actualizarFechaAvisoMock.mockResolvedValue(undefined);
    enviarDroneAbandonadoMock.mockReset();
    enviarDroneAbandonadoMock.mockImplementation(crearResultadoEmail);
  });

  const puedeAbandonarDesde = (estado: string) => {
    const store = crearStore();
    store.dispatch(setReparaciones([{
      ...crearReparacion('rep-abandono'),
      data: {
        ...crearReparacion('rep-abandono').data,
        EstadoRep: estado,
        FechaAvisoAbandono: Date.now() - 8 * 24 * 60 * 60 * 1000,
      },
    }]));

    return selectPuedeAvanzarA('rep-abandono', 'Abandonado')(store.getState() as any);
  };

  it.each(['Respondido', 'Transito', 'Presupuestado', 'Repuestos', 'Reparado', 'Diagnosticado', 'Cobrado'])(
    'permite abandonar desde el estado de espera %s',
    (estado) => {
      expect(puedeAbandonarDesde(estado)).toBe(true);
    }
  );

  it.each(['Consulta', 'Recibido', 'Revisado', 'Aceptado', 'Rechazado', 'Enviado', 'Finalizado', 'Cancelado', 'Abandonado', 'Entregado'])(
    'no permite abandonar desde el estado excluido %s',
    (estado) => {
      expect(puedeAbandonarDesde(estado)).toBe(false);
    }
  );

  it('rechaza desde el thunk abandonar un estado operativo sin persistir cambios', async () => {
    actualizarEstadoMock.mockClear();
    const store = crearStore();
    store.dispatch(setReparaciones([crearReparacion('rep-abandono')]));

    const resultado = await store.dispatch(cambiarEstadoReparacionAsync({
      reparacionId: 'rep-abandono',
      nuevoEstado: 'Abandonado',
      enviarEmail: true,
    }) as any);

    expect(resultado.meta.requestStatus).toBe('rejected');
    expect((resultado.payload as Error).message)
      .toBe('Transición no permitida: Recibido → Abandonado');
    expect(actualizarEstadoMock).not.toHaveBeenCalled();
    expect(enviarDroneAbandonadoMock).not.toHaveBeenCalled();
  });

  it('envía el aviso, registra su fecha y conserva el estado', async () => {
    const store = crearStore();
    store.dispatch(setReparaciones([{
      ...crearReparacion('rep-abandono'),
      data: {
        ...crearReparacion('rep-abandono').data,
        EstadoRep: 'Presupuestado',
        FeRecRep: new Date(2020, 0, 1).getTime(),
      },
    }]));

    const resultado = await store.dispatch(enviarAvisoAbandonoAsync('rep-abandono') as any);

    expect(resultado.meta.requestStatus).toBe('fulfilled');
    expect(enviarDroneAbandonadoMock).toHaveBeenCalledTimes(1);
    expect(actualizarFechaAvisoMock).toHaveBeenCalledWith('rep-abandono', expect.any(Number));
    expect(store.getState().reparacion.coleccionReparaciones['rep-abandono'].data.EstadoRep)
      .toBe('Presupuestado');
    expect(store.getState().reparacion.coleccionReparaciones['rep-abandono'].data.FechaAvisoAbandono)
      .toEqual(expect.any(Number));
  });

  it('no registra fecha ni cambia estado si falla el email', async () => {
    enviarDroneAbandonadoMock.mockImplementationOnce(() => () => {
      const resultado: any = Promise.resolve({});
      resultado.unwrap = () => Promise.reject(new Error('falló el email'));
      return resultado;
    });
    const store = crearStore();
    store.dispatch(setReparaciones([{
      ...crearReparacion('rep-abandono'),
      data: {
        ...crearReparacion('rep-abandono').data,
        EstadoRep: 'Presupuestado',
        FeRecRep: new Date(2020, 0, 1).getTime(),
      },
    }]));

    const resultado = await store.dispatch(enviarAvisoAbandonoAsync('rep-abandono') as any);

    expect(actualizarFechaAvisoMock).not.toHaveBeenCalled();
    expect(store.getState().reparacion.coleccionReparaciones['rep-abandono'].data.EstadoRep)
      .toBe('Presupuestado');
    expect(store.getState().reparacion.coleccionReparaciones['rep-abandono'].data.FechaAvisoAbandono)
      .toBeUndefined();
    expect(resultado.meta.requestStatus).toBe('rejected');
  });

  it('cancela el aviso sin cambiar el estado', async () => {
    const store = crearStore();
    store.dispatch(setReparaciones([{
      ...crearReparacion('rep-abandono'),
      data: {
        ...crearReparacion('rep-abandono').data,
        EstadoRep: 'Presupuestado',
        FechaAvisoAbandono: Date.now() - 1000,
      },
    }]));

    const resultado = await store.dispatch(cancelarAvisoAbandonoAsync('rep-abandono') as any);

    expect(resultado.meta.requestStatus).toBe('fulfilled');
    expect(actualizarFechaAvisoMock).toHaveBeenCalledWith('rep-abandono', null);
    expect(store.getState().reparacion.coleccionReparaciones['rep-abandono'].data.EstadoRep)
      .toBe('Presupuestado');
    expect(store.getState().reparacion.coleccionReparaciones['rep-abandono'].data.FechaAvisoAbandono)
      .toBeNull();
  });

  it('rechaza el abandono antes de que se cumplan siete días', async () => {
    const store = crearStore();
    store.dispatch(setReparaciones([{
      ...crearReparacion('rep-abandono'),
      data: {
        ...crearReparacion('rep-abandono').data,
        EstadoRep: 'Presupuestado',
        FechaAvisoAbandono: Date.now() - 6 * 24 * 60 * 60 * 1000,
      },
    }]));

    const resultado = await store.dispatch(cambiarEstadoReparacionAsync({
      reparacionId: 'rep-abandono',
      nuevoEstado: 'Abandonado',
      enviarEmail: false,
    }) as any);

    expect(resultado.meta.requestStatus).toBe('rejected');
    expect(actualizarEstadoMock).not.toHaveBeenCalled();
  });

  it('marca definitivamente como abandonado después de siete días sin enviar otro email', async () => {
    const store = crearStore();
    store.dispatch(setReparaciones([{
      ...crearReparacion('rep-abandono'),
      data: {
        ...crearReparacion('rep-abandono').data,
        EstadoRep: 'Presupuestado',
        FechaAvisoAbandono: Date.now() - 8 * 24 * 60 * 60 * 1000,
      },
    }]));

    const resultado = await store.dispatch(cambiarEstadoReparacionAsync({
      reparacionId: 'rep-abandono',
      nuevoEstado: 'Abandonado',
      enviarEmail: false,
    }) as any);

    expect(resultado.meta.requestStatus).toBe('fulfilled');
    expect(actualizarEstadoMock).toHaveBeenCalledTimes(1);
    expect(enviarDroneAbandonadoMock).not.toHaveBeenCalled();
    expect(store.getState().reparacion.coleccionReparaciones['rep-abandono'].data.EstadoRep)
      .toBe('Abandonado');
  });
});

describe('reparaciones listas para aviso de abandono', () => {
  const ahora = new Date(2026, 8, 20, 12, 0).getTime();
  const haceCuatroMeses = new Date(2026, 4, 20, 12, 0).getTime();
  const haceDosMeses = new Date(2026, 6, 20, 12, 0).getTime();

  it('filtra por antigüedad, estado elegible y ausencia de aviso', () => {
    const store = crearStore();
    store.dispatch(setReparaciones([
      {
        ...crearReparacion('lista-1'),
        data: {
          ...crearReparacion('lista-1').data,
          EstadoRep: 'Presupuestado',
          FeRecRep: haceCuatroMeses,
        },
      },
      {
        ...crearReparacion('lista-2'),
        data: {
          ...crearReparacion('lista-2').data,
          EstadoRep: 'Cobrado',
          FeRecRep: haceCuatroMeses - 1,
        },
      },
      {
        ...crearReparacion('reciente'),
        data: {
          ...crearReparacion('reciente').data,
          EstadoRep: 'Presupuestado',
          FeRecRep: haceDosMeses,
        },
      },
      {
        ...crearReparacion('avisada'),
        data: {
          ...crearReparacion('avisada').data,
          EstadoRep: 'Presupuestado',
          FeRecRep: haceCuatroMeses,
          FechaAvisoAbandono: ahora - 1000,
        },
      },
      {
        ...crearReparacion('estado-excluido'),
        data: {
          ...crearReparacion('estado-excluido').data,
          EstadoRep: 'Recibido',
          FeRecRep: haceCuatroMeses,
        },
      },
    ]));

    const resultado = selectReparacionesListasParaAvisoAbandono(
      store.getState() as any,
      ahora
    );

    expect(resultado.map(reparacion => reparacion.id)).toEqual(['lista-2', 'lista-1']);
  });

  it('mantiene la referencia para los mismos argumentos', () => {
    const store = crearStore();
    store.dispatch(setReparaciones([{
      ...crearReparacion('lista-1'),
      data: {
        ...crearReparacion('lista-1').data,
        EstadoRep: 'Presupuestado',
        FeRecRep: haceCuatroMeses,
      },
    }]));

    const primero = selectReparacionesListasParaAvisoAbandono(store.getState() as any, ahora);
    const segundo = selectReparacionesListasParaAvisoAbandono(store.getState() as any, ahora);

    expect(segundo).toBe(primero);
  });
});

describe('consumo de repuestos al reparar', () => {
  beforeEach(() => {
    actualizarEstadoMock.mockClear();
    getIntervencionesMock.mockReset();
    getIntervencionMock.mockReset();
    aplicarMovimientoStockMock.mockReset();
    aplicarMovimientoStockMock.mockImplementation(({ partId, onHandDelta, committedDelta }) =>
      Promise.resolve({
        id: partId,
        data: {
          NombreRepu: partId,
          DescripcionRepu: '',
          ModelosDroneIds: [],
          ProveedorRepu: '',
          PrecioRepu: 0,
          StockRepu: 10 + onHandDelta,
          UnidadesComprometidas: Math.max(0, 10 + committedDelta),
        },
      })
    );
  });

  it('consume solo las asignaciones completadas y libera las pendientes', async () => {
    getIntervencionesMock.mockResolvedValue([
      {
        id: 'asignacion-completada',
        data: {
          reparacionId: 'rep-stock',
          intervencionId: 'intervencion-completada',
          estado: EstadoAsignacion.COMPLETADA,
          origen: OrigenAsignacion.PRESUPUESTADA,
          repuestosSnapshot: [
            { partId: 'parte-completada', quantity: 2 },
            { partId: 'parte-compartida', quantity: 1 },
          ],
        },
      },
      {
        id: 'asignacion-pendiente',
        data: {
          reparacionId: 'rep-stock',
          intervencionId: 'intervencion-pendiente',
          estado: EstadoAsignacion.PENDIENTE,
          origen: OrigenAsignacion.PRESUPUESTADA,
          repuestosSnapshot: [
            { partId: 'parte-pendiente', quantity: 3 },
            { partId: 'parte-compartida', quantity: 4 },
          ],
        },
      },
    ]);

    const store = crearStore();
    store.dispatch(setReparaciones([{
      ...crearReparacion('rep-stock'),
      data: {
        ...crearReparacion('rep-stock').data,
        EstadoRep: 'Aceptado',
      },
    }]));
    store.dispatch(setRepuestos(['parte-completada', 'parte-pendiente', 'parte-compartida'].map(id => ({
      id,
      data: {
        NombreRepu: id,
        DescripcionRepu: '',
        ModelosDroneIds: [],
        ProveedorRepu: '',
        PrecioRepu: 0,
        StockRepu: 10,
        UnidadesComprometidas: 10,
      },
    }))));

    const resultado = await store.dispatch(cambiarEstadoReparacionAsync({
      reparacionId: 'rep-stock',
      nuevoEstado: 'Reparado',
    }) as any);

    expect(resultado.meta.requestStatus).toBe('fulfilled');
    expect(aplicarMovimientoStockMock).toHaveBeenCalledWith(expect.objectContaining({
      partId: 'parte-completada',
      onHandDelta: -2,
      committedDelta: -2,
      kind: 'consumption',
    }));
    expect(aplicarMovimientoStockMock).toHaveBeenCalledWith(expect.objectContaining({
      partId: 'parte-compartida',
      onHandDelta: -1,
      committedDelta: -1,
      kind: 'consumption',
    }));
    expect(aplicarMovimientoStockMock).toHaveBeenCalledWith(expect.objectContaining({
      partId: 'parte-pendiente',
      onHandDelta: 0,
      committedDelta: -3,
      kind: 'release',
    }));
    expect(aplicarMovimientoStockMock).toHaveBeenCalledWith(expect.objectContaining({
      partId: 'parte-compartida',
      onHandDelta: 0,
      committedDelta: -4,
      kind: 'release',
    }));
    expect(aplicarMovimientoStockMock).toHaveBeenCalledTimes(4);
    expect(getIntervencionMock).not.toHaveBeenCalled();
  });
});

describe('intervenciones adicionales', () => {
  beforeEach(() => {
    agregarIntervencionMock.mockReset();
    eliminarIntervencionMock.mockReset();
    getIntervencionesMock.mockReset();
    getIntervencionMock.mockReset();
    guardarReparacionMock.mockReset();
    aplicarMovimientoStockMock.mockReset();
    actualizarPreciosPiezasMock.mockReset();
    guardarReparacionMock.mockImplementation((reparacion: ReparacionType) => Promise.resolve(reparacion));
    actualizarPreciosPiezasMock.mockResolvedValue({ success: true, data: {} });
    aplicarMovimientoStockMock.mockImplementation(({ partId, onHandDelta, committedDelta }) =>
      Promise.resolve({
        id: partId,
        data: {
          NombreRepu: partId,
          DescripcionRepu: '',
          ModelosDroneIds: [],
          ProveedorRepu: '',
          PrecioRepu: 0,
          StockRepu: 10 + onHandDelta,
          UnidadesComprometidas: Math.max(0, committedDelta),
        },
      })
    );
  });

  it('persiste el origen, congela los repuestos y reserva la demanda adicional', async () => {
    getIntervencionMock.mockResolvedValue({
      id: 'intervencion-extra',
      data: {
        PrecioManoObra: 100,
        _partsRelations: [
          { part_id: 'parte-a', quantity: 2, part: { price: 50 } },
          { part_id: 'parte-b', quantity: 1, part: { price: 25 } },
        ],
      },
    });
    agregarIntervencionMock.mockResolvedValue({ success: true, data: { id: 'asignacion-extra' } });
    getIntervencionesMock.mockResolvedValue([{
      id: 'asignacion-extra',
      data: {
        reparacionId: 'rep-adicional',
        intervencionId: 'intervencion-extra',
        estado: EstadoAsignacion.PENDIENTE,
        origen: OrigenAsignacion.ADICIONAL,
        repuestosSnapshot: [
          { partId: 'parte-a', quantity: 2 },
          { partId: 'parte-b', quantity: 1 },
        ],
        PrecioManoObra: 100,
        PrecioPiezas: 125,
        PrecioTotal: 225,
      },
    }]);

    const store = crearStore();
    store.dispatch(setReparaciones([{
      ...crearReparacion('rep-adicional'),
      data: { ...crearReparacion('rep-adicional').data, EstadoRep: 'Aceptado' },
    }]));
    store.dispatch(setRepuestos(['parte-a', 'parte-b'].map(id => ({
      id,
      data: {
        NombreRepu: id,
        DescripcionRepu: '',
        ModelosDroneIds: [],
        ProveedorRepu: '',
        PrecioRepu: 0,
        StockRepu: 10,
        UnidadesComprometidas: 0,
      },
    }))));

    const resultado = await store.dispatch(agregarIntervencionAReparacionAsync({
      reparacionId: 'rep-adicional',
      intervencionId: 'intervencion-extra',
      origen: OrigenAsignacion.ADICIONAL,
    }) as any);

    expect(resultado.meta.requestStatus).toBe('fulfilled');
    expect(agregarIntervencionMock).toHaveBeenCalledWith(
      'rep-adicional',
      'intervencion-extra',
      expect.objectContaining({
        origen: OrigenAsignacion.ADICIONAL,
        repuestosSnapshot: [
          { partId: 'parte-a', quantity: 2 },
          { partId: 'parte-b', quantity: 1 },
        ],
      }),
    );
    expect(aplicarMovimientoStockMock).toHaveBeenCalledWith(expect.objectContaining({
      partId: 'parte-a',
      committedDelta: 2,
      kind: 'reservation',
    }));
    expect(aplicarMovimientoStockMock).toHaveBeenCalledWith(expect.objectContaining({
      partId: 'parte-b',
      committedDelta: 1,
      kind: 'reservation',
    }));
    expect(guardarReparacionMock).not.toHaveBeenCalled();
  });

  it('libera la reserva al eliminar una intervención adicional pendiente', async () => {
    eliminarIntervencionMock.mockResolvedValue({ success: true });
    getIntervencionesMock.mockResolvedValue([]);

    const store = crearStore();
    store.dispatch(setReparaciones([{
      ...crearReparacion('rep-adicional'),
      data: { ...crearReparacion('rep-adicional').data, EstadoRep: 'Aceptado' },
    }]));
    store.dispatch(setIntervencionesDeReparacionActual([{
      id: 'asignacion-extra',
      data: {
        reparacionId: 'rep-adicional',
        intervencionId: 'intervencion-extra',
        estado: EstadoAsignacion.PENDIENTE,
        origen: OrigenAsignacion.ADICIONAL,
        repuestosSnapshot: [{ partId: 'parte-a', quantity: 2 }],
        PrecioManoObra: 100,
        PrecioPiezas: 100,
        PrecioTotal: 200,
      },
    }]));
    store.dispatch(setRepuestos([{
      id: 'parte-a',
      data: {
        NombreRepu: 'parte-a',
        DescripcionRepu: '',
        ModelosDroneIds: [],
        ProveedorRepu: '',
        PrecioRepu: 0,
        StockRepu: 10,
        UnidadesComprometidas: 2,
      },
    }]));

    const resultado = await store.dispatch(eliminarIntervencionDeReparacionAsync({
      reparacionId: 'rep-adicional',
      intervencionId: 'asignacion-extra',
    }) as any);

    expect(resultado.meta.requestStatus).toBe('fulfilled');
    expect(aplicarMovimientoStockMock).toHaveBeenCalledWith(expect.objectContaining({
      partId: 'parte-a',
      onHandDelta: 0,
      committedDelta: -2,
      kind: 'release',
    }));
    expect(eliminarIntervencionMock).toHaveBeenCalledWith('rep-adicional', 'asignacion-extra');
    expect(guardarReparacionMock).not.toHaveBeenCalled();
  });

  it('excluye las adicionales de la lista y del total del presupuesto', () => {
    const store = crearStore();
    store.dispatch(setIntervencionesDeReparacionActual([
      {
        id: 'asignacion-presupuestada',
        data: {
          reparacionId: 'rep-adicional',
          intervencionId: 'intervencion-original',
          estado: EstadoAsignacion.PENDIENTE,
          origen: OrigenAsignacion.PRESUPUESTADA,
          PrecioManoObra: 100,
          PrecioPiezas: 50,
          PrecioTotal: 150,
        },
      },
      {
        id: 'asignacion-extra',
        data: {
          reparacionId: 'rep-adicional',
          intervencionId: 'intervencion-extra',
          estado: EstadoAsignacion.PENDIENTE,
          origen: OrigenAsignacion.ADICIONAL,
          PrecioManoObra: 200,
          PrecioPiezas: 75,
          PrecioTotal: 275,
        },
      },
    ]));

    const state = store.getState() as unknown as RootState;
    expect(selectIntervencionesPresupuestadas(state)).toHaveLength(1);
    expect(selectIntervencionesPresupuestadas(state)[0].id).toBe('asignacion-presupuestada');
    expect(selectTotalIntervenciones(state)).toBe(150);
  });

  it('actualiza el costo propio de una adicional sin modificar el presupuesto final', async () => {
    const store = crearStore();
    const asignacionAdicional = {
      id: 'asignacion-extra',
      data: {
        reparacionId: 'rep-adicional',
        intervencionId: 'intervencion-extra',
        estado: EstadoAsignacion.PENDIENTE,
        origen: OrigenAsignacion.ADICIONAL,
        PrecioManoObra: 100,
        PrecioPiezas: 50,
        PrecioTotal: 150,
      },
    };
    store.dispatch(setIntervencionesDeReparacionActual([asignacionAdicional]));
    getIntervencionesMock.mockResolvedValue([asignacionAdicional]);

    const resultado = await store.dispatch(actualizarIncluirRepuestoAsignacionAsync({
      asignacionId: 'asignacion-extra',
      intervencionId: 'intervencion-extra',
      incluirRepuesto: false,
    }) as any);

    expect(resultado.meta.requestStatus).toBe('fulfilled');
    expect(actualizarPreciosPiezasMock).toHaveBeenCalledWith(
      'asignacion-extra',
      'rep-adicional',
      0,
      100,
      null,
    );
  });
});
