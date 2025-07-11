import { supabase } from './supabaseClient.js';
import { REALTIME_CHANNEL_STATES } from '@supabase/supabase-js';

// Verificar conexión WebSocket y estado de canales activos
export const verificarConexionWebSocket = async () => {
  try {
    // Lista de canales que deberían estar activos en la aplicación
    const canalesToVerificar = [
      'reparaciones-changes',
      'usuarios-changes',
      'repuestos-changes',
      'repuestos-modelos-changes',
      'modelos-drone-changes',
      'drones-changes',
      'intervenciones-changes',
      'part-intervention-changes'
    ];

    console.log('=== VERIFICACIÓN DE CANALES WEBSOCKET ===');

    // Verificar el estado general de Realtime
    const realtimeState = supabase.realtime?.connection?.state;
    console.log('Estado de conexión Realtime:', realtimeState);

    // Obtener todos los canales activos
    const canalesActivos = supabase.realtime?.channels || {};
    const nombresCanalesActivos = Object.keys(canalesActivos);

    console.log('Canales totales registrados:', nombresCanalesActivos.length);
    console.log('Nombres de canales:', nombresCanalesActivos);

    // Verificar cada canal específico
    let canalesConectados = 0;
    const estadoCanales = {};

    canalesToVerificar.forEach(nombreCanal => {
      const canal = canalesActivos[nombreCanal];
      if (canal) {
        const estado = canal.state;
        estadoCanales[nombreCanal] = estado;
        console.log(`Canal "${nombreCanal}": ${estado}`);

        if (estado === REALTIME_CHANNEL_STATES.joined) {
          canalesConectados++;
        }
      } else {
        estadoCanales[nombreCanal] = 'NO_ENCONTRADO';
        console.log(`Canal "${nombreCanal}": NO ENCONTRADO`);
      }
    });

    const porcentajeConectados = (canalesConectados / canalesToVerificar.length) * 100;

    console.log(`Canales conectados: ${canalesConectados}/${canalesToVerificar.length} (${porcentajeConectados.toFixed(1)}%)`);
    console.log('==========================================');

    // Retornar información detallada
    return {
      realtimeConectado: realtimeState === 'open',
      canalesEsperados: canalesToVerificar.length,
      canalesConectados: canalesConectados,
      porcentajeConectados: porcentajeConectados,
      estadoCanales: estadoCanales,
      todoOk: realtimeState === 'open' && canalesConectados === canalesToVerificar.length
    };

  } catch (error) {
    console.error('Error al verificar conexión al websocket:', error);
    return {
      realtimeConectado: false,
      canalesEsperados: 0,
      canalesConectados: 0,
      porcentajeConectados: 0,
      estadoCanales: {},
      todoOk: false,
      error: error.message
    };
  }
};

// Función de diagnóstico mejorada que verifica canales reales
export const diagnosticarCanalesWebSocket = async () => {
  try {
    console.log('=== DIAGNÓSTICO COMPLETO DE CANALES WEBSOCKET ===');

    // Obtener el estado de la conexión Realtime
    const realtimeConection = supabase.realtime?.connection;
    const estadoConexion = realtimeConection?.state || 'DESCONOCIDO';

    console.log('Estado de conexión principal:', estadoConexion);
    console.log('URL de conexión:', realtimeConection?.endPoint || 'No disponible');

    // Obtener todos los canales registrados
    const canales = supabase.realtime?.channels || {};
    const nombresCanales = Object.keys(canales);

    console.log(`\nCanales registrados: ${nombresCanales.length}`);

    if (nombresCanales.length === 0) {
      console.log('⚠️  No hay canales registrados');
      return {
        conexionPrincipal: estadoConexion,
        totalCanales: 0,
        canalesActivos: 0,
        canalesConProblemas: 0,
        detalleCanales: []
      };
    }

    let canalesActivos = 0;
    let canalesConProblemas = 0;
    const detalleCanales = [];

    // Verificar cada canal
    nombresCanales.forEach(nombreCanal => {
      const canal = canales[nombreCanal];
      const estado = canal.state;
      const esActivo = estado === REALTIME_CHANNEL_STATES.joined;

      if (esActivo) {
        canalesActivos++;
        console.log(`✅ Canal "${nombreCanal}": ${estado}`);
      } else {
        canalesConProblemas++;
        console.log(`❌ Canal "${nombreCanal}": ${estado}`);
      }

      detalleCanales.push({
        nombre: nombreCanal,
        estado: estado,
        activo: esActivo,
        subscripciones: canal.bindings ? Object.keys(canal.bindings).length : 0
      });
    });

    console.log(`\nResumen:`);
    console.log(`- Canales activos: ${canalesActivos}`);
    console.log(`- Canales con problemas: ${canalesConProblemas}`);
    console.log(`- Total: ${nombresCanales.length}`);

    const todoOk = estadoConexion === 'open' && canalesConProblemas === 0;
    console.log(`\nEstado general: ${todoOk ? '✅ TODO OK' : '⚠️  HAY PROBLEMAS'}`);
    console.log('=============================================');

    return {
      conexionPrincipal: estadoConexion,
      totalCanales: nombresCanales.length,
      canalesActivos: canalesActivos,
      canalesConProblemas: canalesConProblemas,
      detalleCanales: detalleCanales,
      todoOk: todoOk
    };

  } catch (error) {
    console.error('Error en diagnóstico de canales:', error);
    return {
      conexionPrincipal: 'ERROR',
      totalCanales: 0,
      canalesActivos: 0,
      canalesConProblemas: 0,
      detalleCanales: [],
      todoOk: false,
      error: error.message
    };
  }
};

// Función para verificar la salud general del WebSocket
export const verificarSaludWebSocket = async () => {
  try {
    console.log('=== VERIFICACIÓN DE SALUD WEBSOCKET ===');

    const diagnostico = await diagnosticarCanalesWebSocket();

    // Criterios de salud
    const criterios = {
      conexionActiva: diagnostico.conexionPrincipal === 'open',
      hayCanales: diagnostico.totalCanales > 0,
      mayoriaCanajesActivos: diagnostico.canalesActivos > (diagnostico.totalCanales * 0.8),
      pocosProblemas: diagnostico.canalesConProblemas <= 2
    };

    const puntuacion = Object.values(criterios).filter(Boolean).length;
    const saludPorcentaje = (puntuacion / Object.keys(criterios).length) * 100;

    let nivelSalud;
    if (saludPorcentaje >= 100) nivelSalud = 'EXCELENTE';
    else if (saludPorcentaje >= 75) nivelSalud = 'BUENA';
    else if (saludPorcentaje >= 50) nivelSalud = 'REGULAR';
    else nivelSalud = 'MALA';

    console.log('Criterios de evaluación:');
    console.log(`- Conexión activa: ${criterios.conexionActiva ? '✅' : '❌'}`);
    console.log(`- Canales registrados: ${criterios.hayCanales ? '✅' : '❌'}`);
    console.log(`- Mayoría de canales activos: ${criterios.mayoriaCanajesActivos ? '✅' : '❌'}`);
    console.log(`- Pocos problemas: ${criterios.pocosProblemas ? '✅' : '❌'}`);
    console.log(`\nSalud WebSocket: ${saludPorcentaje.toFixed(1)}% - ${nivelSalud}`);
    console.log('=====================================');

    return {
      ...diagnostico,
      criterios,
      saludPorcentaje,
      nivelSalud
    };

  } catch (error) {
    console.error('Error en verificación de salud:', error);
    return {
      error: error.message,
      saludPorcentaje: 0,
      nivelSalud: 'ERROR'
    };
  }
};

// Obtener estadísticas detalladas de todos los canales
export const obtenerEstadisticasCanales = () => {
  try {
    const canales = supabase.realtime?.channels || {};
    const estadisticas = {
      totalCanales: Object.keys(canales).length,
      canalesPorEstado: {},
      detalleCanales: []
    };

    Object.entries(canales).forEach(([nombre, canal]) => {
      const estado = canal.state;

      // Contar por estado
      if (!estadisticas.canalesPorEstado[estado]) {
        estadisticas.canalesPorEstado[estado] = 0;
      }
      estadisticas.canalesPorEstado[estado]++;

      // Detalle de cada canal
      estadisticas.detalleCanales.push({
        nombre,
        estado,
        conectado: estado === REALTIME_CHANNEL_STATES.joined,
        eventos: canal.bindings ? Object.keys(canal.bindings).length : 0
      });
    });

    return estadisticas;
  } catch (error) {
    console.error('Error al obtener estadísticas de canales:', error);
    return null;
  }
};

// Función para reconectar canales cerrados
export const reconectarCanalesCerrados = async () => {
  try {
    const canales = supabase.realtime?.channels || {};
    const canalesReconectados = [];

    Object.entries(canales).forEach(([nombre, canal]) => {
      if (canal.state === REALTIME_CHANNEL_STATES.closed ||
        canal.state === REALTIME_CHANNEL_STATES.errored) {

        console.log(`Intentando reconectar canal: ${nombre}`);
        canal.subscribe();
        canalesReconectados.push(nombre);
      }
    });

    console.log(`Intentando reconectar ${canalesReconectados.length} canales:`, canalesReconectados);

    // Esperar un momento y verificar el resultado
    await new Promise(resolve => setTimeout(resolve, 2000));

    return canalesReconectados;
  } catch (error) {
    console.error('Error al reconectar canales:', error);
    return [];
  }
};
