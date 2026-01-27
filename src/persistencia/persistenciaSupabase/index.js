// ARCHIVO PRINCIPAL DE PERSISTENCIA - REFACTORIZADO
// Este archivo mantiene la compatibilidad con el código existente
// reimportando todas las funciones desde los archivos especializados

// === CLIENTE SUPABASE ===
export { supabase } from './supabaseClient.js';

// === REPARACIONES ===
export {
  agregarIntervencionAReparacionPersistencia,
  getIntervencionesPorReparacionPersistencia,
  eliminarIntervencionDeReparacionPersistencia,
  actualizarEstadoAsignacionPersistencia,
  actualizarDescripcionAsignacionPersistencia,
  actualizarFotosAsignacionPersistencia,
  getReparacionesPersistencia,
  getReparacionPersistencia,
  guardarReparacionPersistencia,
  eliminarReparacionPersistencia,
} from './reparacionesPersistencia.js';

// === USUARIOS ===
export {
  getUsuariosPersistencia,
  getClientePersistencia,
  getClientePorEmailPersistencia,
  guardarUsuarioPersistencia,
  eliminarUsuarioPersistencia
} from './usuariosPersistencia.js';

// === REPUESTOS ===
export {
  getRepuestoPersistencia,
  getRepuestosPorModeloPersistencia,
  getRepuestosPorProveedorPersistencia,
  guardarRepuestoPersistencia,
  eliminarRepuestoPersistencia,
  getRepuestosPersistencia
} from './repuestosPersistencia.js';

// === DRONES Y MODELOS ===
export {
  getModeloDronePersistencia,
  getModelosDronePorFabricantePersistencia,
  guardarModeloDronePersistencia,
  eliminarModeloDronePersistencia,
  getModelosDronePersistencia,
  getDronePersistencia,
  getDronesPorModeloDronePersistencia,
  getDronesPorPropietarioPersistencia,
  guardarDronePersistencia,
  eliminarDronePersistencia,
  getDronesPersistencia
} from './dronesPersistencia.js';

// === INTERVENCIONES ===
export {
  getIntervencionPersistencia,
  getIntervencionesPorModeloDronePersistencia,
  guardarIntervencionPersistencia,
  eliminarIntervencionPersistencia,
  getIntervencionesPersistencia
} from './intervencionesPersistencia.js';

// === ARCHIVOS ===
export {
  subirArchivoPersistencia,
  subirImagenConMiniaturaPersistencia,
  eliminarArchivoPersistencia
} from './archivosPersistencia.js';

// === MENSAJES ===
export {
  sendMessagePersistencia,
  getMessagesPersistencia,
  actualizarLeidosPersistencia,
  notificacionesPorMensajesPersistencia
} from './mensajesPersistencia.js';

// === AUTENTICACIÓN ===
export {
  reenviarEmailVerificacionPersistencia,
  loginPersistencia,
  cambiarPasswordPersistencia,
  registroUsuarioEndpointPersistencia
} from './autenticacionPersistencia.js';

// === UTILIDADES ===
export {
  getProvinciasSelectPersistencia,
  getLocPorProvPersistencia
} from './utilidadesPersistencia.js';

// === DIAGNÓSTICO WEBSOCKET ===
export {
  verificarConexionWebSocket,
  diagnosticarCanalesWebSocket,
  verificarSaludWebSocket,
  obtenerEstadisticasCanales,
  reconectarCanalesCerrados
} from './websocketDiagnostico.js';
