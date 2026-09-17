import { createRealtimeReloadScheduler } from './realtimeReloadScheduler.js';

describe('createRealtimeReloadScheduler', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('agrupa una rafaga de eventos en una sola recarga', async () => {
    const reload = jest.fn().mockResolvedValue(undefined);
    const scheduler = createRealtimeReloadScheduler(reload);

    scheduler.scheduleReload();
    scheduler.scheduleReload();
    scheduler.scheduleReload();

    jest.advanceTimersByTime(299);
    expect(reload).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    await Promise.resolve();
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('conserva una recarga final si llegan eventos durante una consulta', async () => {
    let completeFirstReload;
    const firstReload = new Promise(resolve => {
      completeFirstReload = resolve;
    });
    const reload = jest.fn()
      .mockReturnValueOnce(firstReload)
      .mockResolvedValueOnce(undefined);
    const scheduler = createRealtimeReloadScheduler(reload);

    scheduler.scheduleReload();
    jest.advanceTimersByTime(300);
    await Promise.resolve();

    scheduler.scheduleReload();
    jest.advanceTimersByTime(300);
    expect(reload).toHaveBeenCalledTimes(1);

    completeFirstReload();
    await firstReload;
    await Promise.resolve();
    await Promise.resolve();
    jest.advanceTimersByTime(300);
    await Promise.resolve();
    await Promise.resolve();

    expect(reload).toHaveBeenCalledTimes(2);
  });

  it('cancela recargas pendientes al cerrar la suscripcion', () => {
    const reload = jest.fn();
    const scheduler = createRealtimeReloadScheduler(reload);

    scheduler.scheduleReload();
    scheduler.stop();
    jest.advanceTimersByTime(300);

    expect(reload).not.toHaveBeenCalled();
  });
});