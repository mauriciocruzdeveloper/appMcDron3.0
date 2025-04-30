/**
 * Archivo centralizado para la exportación de funciones de persistencia.
 * Para cambiar entre implementaciones (Firebase/Supabase), simplemente
 * modifica las importaciones en este archivo.
 */

// CONFIGURA EL BACKEND AQUÍ - Comenta la línea que no necesites
// import * as backend from './persistenciaFirebase';
import * as backend from './persistenciaSupabase';

// AUTENTICACIÓN
export const loginPersistencia = backend.loginPersistencia;
export const registroPersistencia = backend.registroPersistencia;

// REPARACIONES
export const getReparacionesPersistencia = backend.getReparacionesPersistencia;
export const getReparacionPersistencia = backend.getReparacionPersistencia;
export const guardarReparacionPersistencia = backend.guardarReparacionPersistencia;
export const eliminarReparacionPersistencia = backend.eliminarReparacionPersistencia;
export const guardarPresupuestoPersistencia = backend.guardarPresupuestoPersistencia;

// INTERVENCIONES Y RELACIONES
export const getIntervencionesPorReparacionPersistencia = backend.getIntervencionesPorReparacionPersistencia;
export const agregarIntervencionAReparacionPersistencia = backend.agregarIntervencionAReparacionPersistencia;
export const eliminarIntervencionDeReparacionPersistencia = backend.eliminarIntervencionDeReparacionPersistencia;

// USUARIOS / CLIENTES
export const getUsuariosPersistencia = backend.getUsuariosPersistencia;
export const getClientePersistencia = backend.getClientePersistencia;
export const getClientePorEmailPersistencia = backend.getClientePorEmailPersistencia;
export const guardarUsuarioPersistencia = backend.guardarUsuarioPersistencia;
export const eliminarUsuarioPersistencia = backend.eliminarUsuarioPersistencia;

// MENSAJES
export const sendMessagePersistencia = backend.sendMessagePersistencia;
export const getMessagesPersistencia = backend.getMessagesPersistencia;
export const actualizarLeidosPersistencia = backend.actualizarLeidosPersistencia;
export const notificacionesPorMensajesPersistencia = backend.notificacionesPorMensajesPersistencia;

// LOCALIDADES Y PROVINCIAS
export const getProvinciasSelectPersistencia = backend.getProvinciasSelectPersistencia;
export const getLocPorProvPersistencia = backend.getLocPorProvPersistencia;

// REPUESTOS
export const getRepuestoPersistencia = backend.getRepuestoPersistencia;
export const getRepuestosPorModeloPersistencia = backend.getRepuestosPorModeloPersistencia;
export const getRepuestosPorProveedorPersistencia = backend.getRepuestosPorProveedorPersistencia;
export const guardarRepuestoPersistencia = backend.guardarRepuestoPersistencia;
export const eliminarRepuestoPersistencia = backend.eliminarRepuestoPersistencia;
export const getRepuestosPersistencia = backend.getRepuestosPersistencia;

// MODELOS DE DRONE
export const getModeloDronePersistencia = backend.getModeloDronePersistencia;
export const getModelosDronePorFabricantePersistencia = backend.getModelosDronePorFabricantePersistencia;
export const guardarModeloDronePersistencia = backend.guardarModeloDronePersistencia;
export const eliminarModeloDronePersistencia = backend.eliminarModeloDronePersistencia;
export const getModelosDronePersistencia = backend.getModelosDronePersistencia;

// DRONES
export const getDronePersistencia = backend.getDronePersistencia;
export const getDronesPorModeloDronePersistencia = backend.getDronesPorModeloDronePersistencia;
export const getDronesPorPropietarioPersistencia = backend.getDronesPorPropietarioPersistencia;
export const guardarDronePersistencia = backend.guardarDronePersistencia;
export const eliminarDronePersistencia = backend.eliminarDronePersistencia;
export const getDronesPersistencia = backend.getDronesPersistencia;

// INTERVENCIONES
export const getIntervencionPersistencia = backend.getIntervencionPersistencia;
export const getIntervencionesPorModeloDronePersistencia = backend.getIntervencionesPorModeloDronePersistencia;
export const guardarIntervencionPersistencia = backend.guardarIntervencionPersistencia;
export const eliminarIntervencionPersistencia = backend.eliminarIntervencionPersistencia;
export const getIntervencionesPersistencia = backend.getIntervencionesPersistencia;
