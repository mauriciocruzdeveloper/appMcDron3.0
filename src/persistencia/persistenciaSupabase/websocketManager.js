/**
 * WebSocket Manager - Gestiona la conexión WebSocket en segundo plano
 * 
 * Este módulo maneja:
 * - Detección de desconexión cuando la app va a segundo plano
 * - Reconexión automática cuando vuelve a primer plano
 * - Heartbeat para mantener la conexión activa
 * - Reintento de suscripciones fallidas
 */

import { supabase } from './supabaseClient.js';
import { REALTIME_CHANNEL_STATES } from '@supabase/supabase-js';

// Estado del manager
let isAppVisible = true;
let reconnectTimeout = null;
let heartbeatInterval = null;
const HEARTBEAT_INTERVAL = 30000; // 30 segundos
const RECONNECT_DELAY = 2000; // 2 segundos

/**
 * Inicializa el WebSocket Manager
 * Debe llamarse una sola vez al iniciar la aplicación
 */
export const initWebSocketManager = () => {
  console.log('📡 Inicializando WebSocket Manager...');

  // Escuchar cambios de visibilidad
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  // Iniciar heartbeat
  startHeartbeat();

  // Detectar errores de conexión
  setupConnectionErrorHandling();

  console.log('✅ WebSocket Manager inicializado');
};

/**
 * Detiene el WebSocket Manager
 */
export const stopWebSocketManager = () => {
  console.log('🛑 Deteniendo WebSocket Manager...');
  
  if (typeof document !== 'undefined') {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  }
  
  stopHeartbeat();
  clearReconnectTimeout();
};

/**
 * Maneja el cambio de visibilidad de la app
 */
const handleVisibilityChange = () => {
  const wasVisible = isAppVisible;
  isAppVisible = !document.hidden;

  if (!wasVisible && isAppVisible) {
    console.log('📱 App visible - Verificando conexión WebSocket...');
    scheduleReconnect();
  } else if (wasVisible && !isAppVisible) {
    console.log('📱 App en segundo plano - WebSocket puede pausarse');
  }
};

/**
 * Programa una reconexión después de un delay
 */
const scheduleReconnect = () => {
  clearReconnectTimeout();
  
  reconnectTimeout = setTimeout(() => {
    verifyAndReconnectChannels();
  }, RECONNECT_DELAY);
};

/**
 * Limpia el timeout de reconexión
 */
const clearReconnectTimeout = () => {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
};

/**
 * Verifica el estado de los canales y reconecta los que estén inactivos
 */
export const verifyAndReconnectChannels = async () => {
  try {
    console.log('🔍 Verificando estado de canales WebSocket...');
    
    const canales = supabase.realtime?.channels || {};
    const canalesArray = Object.values(canales);

    if (canalesArray.length === 0) {
      console.log('⚠️ No hay canales registrados');
      return { reconnected: 0, total: 0 };
    }

    let reconnected = 0;

    for (const canal of canalesArray) {
      const estado = canal.state;
      const nombreCanal = canal?.topic || 'unknown';

      if (estado === REALTIME_CHANNEL_STATES.closed || 
          estado === REALTIME_CHANNEL_STATES.errored) {
        console.log(`🔄 Reconectando canal: ${nombreCanal}`);
        
        try {
          await canal.subscribe();
          reconnected++;
          console.log(`✅ Canal reconectado: ${nombreCanal}`);
        } catch (error) {
          console.error(`❌ Error al reconectar canal ${nombreCanal}:`, error);
        }
      } else if (estado === REALTIME_CHANNEL_STATES.joined) {
        console.log(`✅ Canal activo: ${nombreCanal}`);
      } else {
        console.log(`⏳ Canal en estado: ${estado} - ${nombreCanal}`);
      }
    }

    console.log(`🔄 Reconexión completada: ${reconnected}/${canalesArray.length} canales reconectados`);
    
    return {
      reconnected,
      total: canalesArray.length,
      success: true
    };

  } catch (error) {
    console.error('❌ Error al verificar canales:', error);
    return {
      reconnected: 0,
      total: 0,
      success: false,
      error: error.message
    };
  }
};

/**
 * Inicia el heartbeat para mantener la conexión activa
 */
const startHeartbeat = () => {
  stopHeartbeat(); // Asegurar que no hay otro activo

  heartbeatInterval = setInterval(() => {
    if (!isAppVisible) {
      // No hacer heartbeat si la app está en segundo plano
      return;
    }

    // Verificar estado de la conexión
    const connectionState = supabase.realtime?.connectionState?.();
    
    if (connectionState !== 'open') {
      console.log(`💓 Heartbeat: Conexión no activa (${connectionState})`);
      scheduleReconnect();
    } else {
      console.log('💓 Heartbeat: Conexión activa');
    }
  }, HEARTBEAT_INTERVAL);
};

/**
 * Detiene el heartbeat
 */
const stopHeartbeat = () => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
};

/**
 * Configura el manejo de errores de conexión
 */
const setupConnectionErrorHandling = () => {
  // Escuchar eventos de error en la conexión
  if (supabase.realtime) {
    const originalOnError = supabase.realtime.onError;
    
    supabase.realtime.onError = (callback) => {
      // Envolver el callback original
      const wrappedCallback = (error) => {
        console.error('❌ Error de WebSocket:', error);
        scheduleReconnect();
        
        if (callback) {
          callback(error);
        }
      };
      
      if (originalOnError) {
        return originalOnError.call(supabase.realtime, wrappedCallback);
      }
    };
  }
};

/**
 * Obtiene estadísticas de los canales
 */
export const getChannelStats = () => {
  const canales = supabase.realtime?.channels || {};
  const canalesArray = Object.values(canales);

  const stats = {
    total: canalesArray.length,
    joined: 0,
    closed: 0,
    errored: 0,
    other: 0,
    channels: []
  };

  canalesArray.forEach(canal => {
    const estado = canal.state;
    const nombreCanal = canal?.topic || 'unknown';

    stats.channels.push({
      name: nombreCanal,
      state: estado
    });

    switch (estado) {
      case REALTIME_CHANNEL_STATES.joined:
        stats.joined++;
        break;
      case REALTIME_CHANNEL_STATES.closed:
        stats.closed++;
        break;
      case REALTIME_CHANNEL_STATES.errored:
        stats.errored++;
        break;
      default:
        stats.other++;
    }
  });

  return stats;
};

/**
 * Función de utilidad para logging
 */
export const logChannelStats = () => {
  const stats = getChannelStats();
  console.log('📊 Estadísticas de canales:', {
    total: stats.total,
    activos: stats.joined,
    cerrados: stats.closed,
    errores: stats.errored,
    otros: stats.other
  });
  return stats;
};

// Hacer disponible para debugging
if (typeof window !== 'undefined') {
  window.websocketManager = {
    verify: verifyAndReconnectChannels,
    stats: getChannelStats,
    logStats: logChannelStats
  };
}
