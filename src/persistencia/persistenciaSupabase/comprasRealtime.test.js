import { supabase } from './supabaseClient';
import { getPedidosPersistencia } from './pedidosPersistencia';
import { getRepuestosPersistencia } from './repuestosPersistencia';
import { getAsignacionesCompromisoPersistencia } from './reparacionesPersistencia';

jest.mock('./supabaseClient', () => ({ supabase: {
  from: jest.fn(), channel: jest.fn(), removeChannel: jest.fn(),
} }));
jest.mock('./archivosPersistencia', () => ({ eliminarArchivoPersistencia: jest.fn() }));

describe('errores de datos de compras en realtime', () => {
  let callbacks;
  let resultado;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    callbacks = [];
    resultado = { data: [], error: null };
    supabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockImplementation(() => Promise.resolve(resultado)),
      in: jest.fn().mockImplementation(() => Promise.resolve(resultado)),
    }));
    supabase.channel.mockImplementation(() => ({
      on: jest.fn().mockImplementation(function(evento, filtro, callback) {
        callbacks.push(callback);
        return this;
      }),
      subscribe: jest.fn().mockReturnThis(),
    }));
  });

  afterEach(() => { jest.useRealTimers(); });

  it.each([
    ['repuestos', getRepuestosPersistencia],
    ['pedidos', getPedidosPersistencia],
    ['asignaciones', getAsignacionesCompromisoPersistencia],
  ])('notifica errores de %s y permite recuperacion sin publicar vacio falso', async (nombre, cargar) => {
    const publicar = jest.fn();
    const onError = jest.fn();
    const unsubscribe = nombre === 'asignaciones'
      ? await cargar(publicar, ['Aceptado', 'Repuestos'], onError)
      : await cargar(publicar, onError);
    expect(publicar).toHaveBeenCalledTimes(1);
    const error = new Error('Sin conexion');
    resultado = { data: null, error };
    await callbacks[0]();
    jest.advanceTimersByTime(300);
    for (let paso = 0; paso < 8; paso += 1) await Promise.resolve();
    expect(onError).toHaveBeenCalledWith(error);
    expect(publicar).toHaveBeenCalledTimes(1);
    resultado = { data: [], error: null };
    await callbacks[0]();
    jest.advanceTimersByTime(300);
    for (let paso = 0; paso < 8; paso += 1) await Promise.resolve();
    expect(publicar).toHaveBeenCalledTimes(2);
    unsubscribe();
    expect(supabase.removeChannel).toHaveBeenCalledTimes(2);
  });
});