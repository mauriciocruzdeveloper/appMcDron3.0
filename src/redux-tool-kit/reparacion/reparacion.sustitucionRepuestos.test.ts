import { configureStore } from '@reduxjs/toolkit';
import reparacionReducer, {
  setAsignacionesCompromiso,
  setIntervencionesDeReparacionActual,
  setReparaciones,
} from './reparacion.slice';
import repuestoReducer, { setRepuestos } from '../repuesto/repuesto.slice';
import intervencionReducer, { setIntervenciones } from '../intervencion/intervencion.slice';
import {
  actualizarRepuestosAsignacionAsync,
  cambiarEstadoReparacionAsync,
} from './reparacion.actions';
import { selectCompromisoPorRepuesto } from './reparacion.selectors';
import {
  actualizarEstadoReparacionPersistencia,
  actualizarRepuestosAsignacionPersistencia,
  aplicarMovimientoStockPersistencia,
  getIntervencionPersistencia,
  getIntervencionesPorReparacionPersistencia,
  guardarReparacionPersistencia,
} from '../../persistencia/persistencia';
import { EstadoAsignacion, OrigenAsignacion } from '../../types/intervencion';
import { ReparacionType } from '../../types/reparacion';

jest.mock('../../persistencia/persistencia', () => ({
  actualizarEstadoReparacionPersistencia: jest.fn(),
  actualizarRepuestosAsignacionPersistencia: jest.fn(),
  aplicarMovimientoStockPersistencia: jest.fn(),
  getIntervencionPersistencia: jest.fn(),
  getIntervencionesPorReparacionPersistencia: jest.fn(),
  guardarReparacionPersistencia: jest.fn(),
}));

jest.mock('../app/app.actions', () => ({
  enviarReciboAsync: jest.fn(),
  enviarDroneReparadoAsync: jest.fn(),
  enviarDroneDiagnosticadoAsync: jest.fn(),
  enviarEmailAvisoAbandonoAsync: jest.fn(),
  enviarDroneEnviadoAsync: jest.fn(),
  enviarReparacionFinalizadaAsync: jest.fn(),
}));

const actualizarRepuestosMock = actualizarRepuestosAsignacionPersistencia as jest.Mock;
const getIntervencionesMock = getIntervencionesPorReparacionPersistencia as jest.Mock;
const getIntervencionMock = getIntervencionPersistencia as jest.Mock;
const guardarReparacionMock = guardarReparacionPersistencia as jest.Mock;
const actualizarEstadoRepMock = actualizarEstadoReparacionPersistencia as jest.Mock;
const aplicarMovimientoStockMock = aplicarMovimientoStockPersistencia as jest.Mock;

const crearStore = () =>
  configureStore({
    reducer: {
      reparacion: reparacionReducer,
      repuesto: repuestoReducer,
      intervencion: intervencionReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });

const crearReparacionBase = (estado = 'Aceptado', informe = ''): ReparacionType => ({
  id: 'rep-1',
  data: {
    EstadoRep: estado,
    PrioridadRep: 1,
    FeConRep: null,
    ModeloDroneNameRep: 'DJI Mini 3',
    DescripcionUsuRep: 'Golpe en brazo',
    DescripcionTecRep: informe,
    PresuFiRep: 45000,
    UsuarioRep: 'usu-1',
  },
});

describe('actualizarRepuestosAsignacionAsync y consumo con repuesto sustituto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    actualizarRepuestosMock.mockResolvedValue({ success: true, data: { id: 'asig-1' } });
    guardarReparacionMock.mockImplementation(async (rep) => rep);
    actualizarEstadoRepMock.mockResolvedValue(undefined);
    aplicarMovimientoStockMock.mockImplementation(async ({ partId, onHandDelta }) => ({
      id: partId,
      data: {
        NombreRepu: partId,
        StockRepu: 5 + onHandDelta,
      },
    }));
  });

  const poblarStoreBase = (estado = 'Aceptado', informe = 'Revisión general OK.') => {
    const store = crearStore();
    store.dispatch(setReparaciones([crearReparacionBase(estado, informe)]));
    store.dispatch(
      setIntervenciones([
        {
          id: 'int-brazo',
          data: {
            NombreInt: 'Cambio de brazo delantero',
            DescripcionInt: '',
            RepuestosIds: ['rep-brazo'],
            PrecioManoObra: 15000,
            DuracionEstimada: 40,
          },
        },
      ]),
    );
    store.dispatch(
      setRepuestos([
        {
          id: 'rep-brazo',
          data: {
            NombreRepu: 'Brazo delantero Mini 3',
            DescripcionRepu: '',
            ModelosDroneIds: ['mod-mini3'],
            ProveedorRepu: '',
            PrecioRepu: 30000,
            StockRepu: 0,
            UnidadesComprometidas: 0,
          },
        },
        {
          id: 'rep-motor',
          data: {
            NombreRepu: 'Motor brushless Mini 3',
            DescripcionRepu: '',
            ModelosDroneIds: ['mod-mini2'],
            ProveedorRepu: '',
            PrecioRepu: 12000,
            StockRepu: 3,
            UnidadesComprometidas: 0,
          },
        },
        {
          id: 'rep-obsoleto',
          data: {
            NombreRepu: 'Motor viejo discontinuado',
            DescripcionRepu: '',
            Obsoleta: true,
            ModelosDroneIds: [],
            ProveedorRepu: '',
            PrecioRepu: 8000,
            StockRepu: 1,
            UnidadesComprometidas: 0,
          },
        },
      ]),
    );
    store.dispatch(
      setIntervencionesDeReparacionActual([
        {
          id: 'asig-1',
          data: {
            reparacionId: 'rep-1',
            intervencionId: 'int-brazo',
            estado: EstadoAsignacion.PENDIENTE,
            origen: OrigenAsignacion.PRESUPUESTADA,
            incluyeRepuestosTaller: true,
            repuestosSnapshot: [{ partId: 'rep-brazo', quantity: 1 }],
            PrecioManoObra: 15000,
            PrecioPiezas: 30000,
            PrecioTotal: 45000,
          },
        },
      ]),
    );
    store.dispatch(
      setAsignacionesCompromiso([
        {
          id: 'asig-1',
          reparacionId: 'rep-1',
          estadoReparacion: estado,
          incluyeRepuestosTaller: true,
          repuestosSnapshot: [{ partId: 'rep-brazo', quantity: 1 }],
        },
      ]),
    );
    return store;
  };

  it('sustituye repuesto en asignación presupuestada sin tocar PresuFiRep, actualiza compromiso y aclara en el informe', async () => {
    const store = poblarStoreBase('Aceptado', 'Revisión general OK.');
    getIntervencionesMock.mockResolvedValue([
      {
        id: 'asig-1',
        data: {
          reparacionId: 'rep-1',
          intervencionId: 'int-brazo',
          estado: EstadoAsignacion.PENDIENTE,
          origen: OrigenAsignacion.PRESUPUESTADA,
          incluyeRepuestosTaller: true,
          repuestosSnapshot: [{ partId: 'rep-motor', quantity: 1 }],
          PrecioManoObra: 15000,
          PrecioPiezas: 30000,
          PrecioTotal: 45000,
        },
      },
    ]);

    const res = await store.dispatch(
      actualizarRepuestosAsignacionAsync({
        asignacionId: 'asig-1',
        repuestos: [{ partId: 'rep-motor', quantity: 1 }],
      }) as any,
    );

    expect(res.meta.requestStatus).toBe('fulfilled');
    expect(actualizarRepuestosMock).toHaveBeenCalledWith('asig-1', {
      repuestosSnapshot: [{ partId: 'rep-motor', quantity: 1 }],
      incluyeRepuestosTaller: true,
      parts_cost: undefined,
      total_cost: undefined,
    });

    const state = store.getState() as any;
    expect(state.reparacion.coleccionReparaciones['rep-1'].data.PresuFiRep).toBe(45000);
    expect(state.reparacion.coleccionReparaciones['rep-1'].data.DescripcionTecRep).toBe(
      'Revisión general OK.\n- Cambio de brazo delantero: resuelto utilizando Motor brushless Mini 3.',
    );
    expect(selectCompromisoPorRepuesto(state)).toEqual({ 'rep-motor': 1 });
  });

  it('permite resolver sin repuestos de stock y luego restaurar el original limpiando la aclaración', async () => {
    const store = poblarStoreBase('Repuestos', 'Se desarmó carcasa.');
    getIntervencionesMock.mockResolvedValueOnce([
      {
        id: 'asig-1',
        data: {
          reparacionId: 'rep-1',
          intervencionId: 'int-brazo',
          estado: EstadoAsignacion.PENDIENTE,
          origen: OrigenAsignacion.PRESUPUESTADA,
          incluyeRepuestosTaller: false,
          repuestosSnapshot: [],
          PrecioManoObra: 15000,
          PrecioPiezas: 30000,
          PrecioTotal: 45000,
        },
      },
    ]);

    await store.dispatch(
      actualizarRepuestosAsignacionAsync({
        asignacionId: 'asig-1',
        repuestos: [],
      }) as any,
    );

    let state = store.getState() as any;
    expect(selectCompromisoPorRepuesto(state)).toEqual({});
    expect(state.reparacion.coleccionReparaciones['rep-1'].data.DescripcionTecRep).toBe(
      'Se desarmó carcasa.\n- Cambio de brazo delantero: resuelto reparando el componente sin reemplazo completo de pieza.',
    );

    // Ahora restaurar original
    getIntervencionMock.mockResolvedValue({
      id: 'int-brazo',
      data: {
        NombreInt: 'Cambio de brazo delantero',
        RepuestosIds: ['rep-brazo'],
        _partsRelations: [{ part_id: 'rep-brazo', quantity: 1 }],
      },
    });
    getIntervencionesMock.mockResolvedValueOnce([
      {
        id: 'asig-1',
        data: {
          reparacionId: 'rep-1',
          intervencionId: 'int-brazo',
          estado: EstadoAsignacion.PENDIENTE,
          origen: OrigenAsignacion.PRESUPUESTADA,
          incluyeRepuestosTaller: true,
          repuestosSnapshot: [{ partId: 'rep-brazo', quantity: 1 }],
          PrecioManoObra: 15000,
          PrecioPiezas: 30000,
          PrecioTotal: 45000,
        },
      },
    ]);

    const resRestaurar = await store.dispatch(
      actualizarRepuestosAsignacionAsync({
        asignacionId: 'asig-1',
        restaurarOriginal: true,
      }) as any,
    );

    expect(resRestaurar.meta.requestStatus).toBe('fulfilled');
    state = store.getState() as any;
    expect(state.reparacion.coleccionReparaciones['rep-1'].data.DescripcionTecRep).toBe(
      'Se desarmó carcasa.',
    );
    expect(state.reparacion.coleccionReparaciones['rep-1'].data.PresuFiRep).toBe(45000);
  });

  it('recalcula costos propios en asignación adicional sin alterar PresuFiRep', async () => {
    const store = poblarStoreBase('Aceptado', '');
    store.dispatch(
      setIntervencionesDeReparacionActual([
        {
          id: 'asig-adic',
          data: {
            reparacionId: 'rep-1',
            intervencionId: 'int-brazo',
            estado: EstadoAsignacion.PENDIENTE,
            origen: OrigenAsignacion.ADICIONAL,
            incluyeRepuestosTaller: true,
            repuestosSnapshot: [{ partId: 'rep-brazo', quantity: 1 }],
            PrecioManoObra: 15000,
            PrecioPiezas: 30000,
            PrecioTotal: 45000,
          },
        },
      ]),
    );
    getIntervencionesMock.mockResolvedValue([]);

    const res = await store.dispatch(
      actualizarRepuestosAsignacionAsync({
        asignacionId: 'asig-adic',
        repuestos: [{ partId: 'rep-motor', quantity: 2 }],
      }) as any,
    );

    expect(res.meta.requestStatus).toBe('fulfilled');
    expect(actualizarRepuestosMock).toHaveBeenCalledWith('asig-adic', {
      repuestosSnapshot: [{ partId: 'rep-motor', quantity: 2 }],
      incluyeRepuestosTaller: true,
      parts_cost: 24000,
      total_cost: 39000,
    });
    expect(
      (store.getState() as any).reparacion.coleccionReparaciones['rep-1'].data.PresuFiRep,
    ).toBe(45000);
  });

  it('rechaza modificar asignaciones completadas, reparaciones fuera de Aceptado/Repuestos o repuestos obsoletos', async () => {
    const storeFueraEstado = poblarStoreBase('Presupuestado');
    const resFueraEstado = await storeFueraEstado.dispatch(
      actualizarRepuestosAsignacionAsync({
        asignacionId: 'asig-1',
        repuestos: [{ partId: 'rep-motor', quantity: 1 }],
      }) as any,
    );
    expect(resFueraEstado.meta.requestStatus).toBe('rejected');

    const storeObsoleto = poblarStoreBase('Aceptado');
    const resObsoleto = await storeObsoleto.dispatch(
      actualizarRepuestosAsignacionAsync({
        asignacionId: 'asig-1',
        repuestos: [{ partId: 'rep-obsoleto', quantity: 1 }],
      }) as any,
    );
    expect(resObsoleto.meta.requestStatus).toBe('rejected');

    const storeCompletada = poblarStoreBase('Aceptado');
    storeCompletada.dispatch(
      setIntervencionesDeReparacionActual([
        {
          id: 'asig-1',
          data: {
            reparacionId: 'rep-1',
            intervencionId: 'int-brazo',
            estado: EstadoAsignacion.COMPLETADA,
            origen: OrigenAsignacion.PRESUPUESTADA,
            incluyeRepuestosTaller: true,
            repuestosSnapshot: [{ partId: 'rep-brazo', quantity: 1 }],
            PrecioManoObra: 15000,
            PrecioPiezas: 30000,
            PrecioTotal: 45000,
          },
        },
      ]),
    );
    const resCompletada = await storeCompletada.dispatch(
      actualizarRepuestosAsignacionAsync({
        asignacionId: 'asig-1',
        repuestos: [{ partId: 'rep-motor', quantity: 1 }],
      }) as any,
    );
    expect(resCompletada.meta.requestStatus).toBe('rejected');
    expect(actualizarRepuestosMock).not.toHaveBeenCalled();
  });

  it('al pasar a Reparado consume el repuesto sustituto con nota en stock_movement y no el original', async () => {
    const store = poblarStoreBase('Aceptado');
    getIntervencionesMock.mockResolvedValue([
      {
        id: 'asig-1',
        data: {
          reparacionId: 'rep-1',
          intervencionId: 'int-brazo',
          estado: EstadoAsignacion.COMPLETADA,
          origen: OrigenAsignacion.PRESUPUESTADA,
          incluyeRepuestosTaller: true,
          repuestosSnapshot: [{ partId: 'rep-motor', quantity: 1 }],
          PrecioManoObra: 15000,
          PrecioPiezas: 30000,
          PrecioTotal: 45000,
        },
      },
    ]);

    const res = await store.dispatch(
      cambiarEstadoReparacionAsync({
        reparacionId: 'rep-1',
        nuevoEstado: 'Reparado',
        enviarEmail: false,
      }) as any,
    );

    expect(res.meta.requestStatus).toBe('fulfilled');
    expect(aplicarMovimientoStockMock).toHaveBeenCalledTimes(1);
    expect(aplicarMovimientoStockMock).toHaveBeenCalledWith({
      partId: 'rep-motor',
      onHandDelta: -1,
      committedDelta: 0,
      kind: 'consumption',
      referenceType: 'repair',
      referenceId: 'rep-1',
      note: 'Repuesto ajustado en intervención: Cambio de brazo delantero',
    });
  });
});
