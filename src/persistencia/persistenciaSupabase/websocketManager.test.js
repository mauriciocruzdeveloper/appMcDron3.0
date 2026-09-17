import { supabase } from './supabaseClient.js';
import { stopWebSocketManager, verifyAndReconnectChannels } from './websocketManager.js';

jest.mock('./supabaseClient.js', () => ({
  supabase: {
    realtime: {
      channels: [],
    },
    removeChannel: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@supabase/supabase-js', () => ({
  REALTIME_CHANNEL_STATES: {
    closed: 'closed',
    errored: 'errored',
    joined: 'joined',
  },
}));

describe('websocketManager', () => {
  let dispatchEventSpy;
  let dateNowSpy;

  beforeEach(() => {
    jest.useFakeTimers();
    dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
    dateNowSpy = jest.spyOn(Date, 'now');
    supabase.removeChannel.mockClear();
    supabase.realtime.channels = [
      { state: 'closed', topic: 'realtime:test' },
    ];
  });

  afterEach(() => {
    stopWebSocketManager();
    dispatchEventSpy.mockRestore();
    dateNowSpy.mockRestore();
    jest.useRealTimers();
  });

  it('sincroniza inmediatamente y agrupa reconexiones repetidas durante cinco minutos', async () => {
    dateNowSpy.mockReturnValue(1000);
    await verifyAndReconnectChannels();

    expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
    expect(dispatchEventSpy.mock.calls[0][0].type).toBe('mcdron:realtime-reload');

    dateNowSpy.mockReturnValue(2000);
    await verifyAndReconnectChannels();
    await verifyAndReconnectChannels();

    expect(dispatchEventSpy).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime((5 * 60 * 1000) - 1001);
    expect(dispatchEventSpy).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1);
    expect(dispatchEventSpy).toHaveBeenCalledTimes(2);
  });

  it('no emite otra recarga cuando la verificacion pertenece a una recarga en curso', async () => {
    dateNowSpy.mockReturnValue(1000);

    await verifyAndReconnectChannels(false);

    expect(supabase.removeChannel).toHaveBeenCalledTimes(1);
    expect(dispatchEventSpy).not.toHaveBeenCalled();
  });
});