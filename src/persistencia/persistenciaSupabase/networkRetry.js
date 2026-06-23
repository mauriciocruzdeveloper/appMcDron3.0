// Helper de reintento para errores de red transitorios (DNS, "Failed to fetch", etc.)
// No reintenta errores de negocio/PostgREST (RLS, validaciones, constraints).

const MENSAJES_RED_TRANSITORIA = [
  'failed to fetch',
  'networkerror',
  'network error',
  'fetch failed',
  'err_name_not_resolved',
  'err_internet_disconnected',
  'err_connection',
  'err_timed_out',
  'load failed',
];

// Determina si un error es un fallo de red transitorio (sin respuesta del servidor).
export const esErrorRedTransitorio = (error) => {
  if (!error) return false;
  // Los errores de PostgREST traen un "code" (ej. '23505', 'PGRST116'); esos no se reintentan.
  if (error.code) return false;
  const mensaje = String(error.message || error).toLowerCase();
  return MENSAJES_RED_TRANSITORIA.some((m) => mensaje.includes(m));
};

// Ejecuta una operación async reintentando solo ante errores de red transitorios,
// con backoff exponencial. Lanza el último error si se agotan los intentos.
export const conReintento = async (operacion, { intentos = 3, esperaBaseMs = 400 } = {}) => {
  let ultimoError;
  for (let intento = 1; intento <= intentos; intento++) {
    try {
      return await operacion();
    } catch (error) {
      ultimoError = error;
      if (!esErrorRedTransitorio(error) || intento === intentos) {
        throw error;
      }
      const espera = esperaBaseMs * 2 ** (intento - 1);
      console.warn(`Error de red transitorio (intento ${intento}/${intentos}). Reintentando en ${espera}ms...`, error);
      await new Promise((resolve) => setTimeout(resolve, espera));
    }
  }
  throw ultimoError;
};
