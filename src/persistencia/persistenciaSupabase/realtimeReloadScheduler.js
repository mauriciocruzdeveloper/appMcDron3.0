export const createRealtimeReloadScheduler = (reload, delay = 300) => {
  let timeout = null;
  let reloadInProgress = null;
  let pendingReload = false;
  let stopped = false;

  const executeReload = async () => {
    timeout = null;
    if (stopped) return;

    if (reloadInProgress) {
      pendingReload = true;
      return reloadInProgress;
    }

    reloadInProgress = Promise.resolve().then(reload);

    try {
      await reloadInProgress;
    } finally {
      reloadInProgress = null;
      if (pendingReload && !stopped) {
        pendingReload = false;
        scheduleReload();
      }
    }
  };

  const scheduleReload = () => {
    if (stopped) return;

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      executeReload();
    }, delay);
  };

  const stop = () => {
    stopped = true;
    pendingReload = false;
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return { scheduleReload, stop };
};