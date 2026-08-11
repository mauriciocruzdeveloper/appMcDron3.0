import { supabase } from './supabaseClient.js';

// SEND de un mensaje
// IMPORTANTE: message.data.from y message.data.to son IDs de usuario (no emails)
export const sendMessagePersistencia = (message) => {
  console.log('📤 sendMessagePersistencia - Iniciando envío de mensaje');
  console.log('📝 Datos del mensaje:', {
    from: message.data.from,
    to: message.data.to,
    senderName: message.data.senderName,
    contentLength: message.data.content?.length || 0,
    date: message.data.date
  });
  
  return new Promise(async (resolve, reject) => {
    try {
      // Preparar datos para el mensaje del remitente
      const dataFrom = {
        date: message.data.date,
        content: message.data.content,
        other_user_id: message.data.to, // Para el remitente, el otro usuario es el destinatario
        sender_id: message.data.from,
        senderName: message.data.senderName,
        isRead: false
      };

      // Preparar datos para el mensaje del destinatario
      const dataTo = {
        date: message.data.date,
        content: message.data.content,
        other_user_id: message.data.from, // Para el destinatario, el otro usuario es el remitente
        sender_id: message.data.from,
        senderName: message.data.senderName,
        isRead: false
      };

      // Insertar mensaje en la tabla de mensajes del remitente
      const { error: errorFrom } = await supabase
        .from('messages')
        .insert({
          ...dataFrom,
          user_id: message.data.from,
          created_at: new Date().toISOString()
        });

      if (errorFrom) {
        console.error('❌ Error al insertar mensaje para remitente:', errorFrom);
        throw errorFrom;
      }
      console.log('✅ Mensaje insertado para remitente (user_id:', message.data.from + ')');

      // Insertar mensaje en la tabla de mensajes del destinatario
      const { error: errorTo } = await supabase
        .from('messages')
        .insert({
          ...dataTo,
          user_id: message.data.to,
          created_at: new Date().toISOString()
        });

      if (errorTo) {
        console.error('❌ Error al insertar mensaje para destinatario:', errorTo);
        throw errorTo;
      }
      console.log('✅ Mensaje insertado para destinatario (user_id:', message.data.to + ')');
      console.log('✅ Mensaje enviado exitosamente');

      resolve();
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      reject(error);
    }
  });
};

// GET todos los mensajes entre dos usuarios
// IMPORTANTE: usuarioId y otherUserId son IDs de usuario (no emails)
export const getMessagesPersistencia = (setMessagesToRedux, usuarioId, otherUserId) => {
  console.log('📥 getMessagesPersistencia - Obteniendo mensajes');
  console.log('👤 Usuario actual:', usuarioId, '- Otro usuario:', otherUserId);
  
  return new Promise((resolve, reject) => {
    try {
      // Consultar mensajes para el usuario actual donde el otro usuario sea el especificado
      const consulta = supabase
        .from('messages')
        .select('*')
        .eq('user_id', usuarioId)
        .eq('other_user_id', otherUserId)
        .order('date', { ascending: true });

      // Configurar suscripción en tiempo real
      const channel = supabase
        .channel('messages-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `user_id=eq.${usuarioId} AND other_user_id=eq.${otherUserId}`
        }, async () => {
          // Cuando llega un mensaje nuevo, ejecutamos la consulta nuevamente
          console.log('🔄 Cambio detectado en mensajes - Recargando...');
          const { data, error } = await consulta;

          if (error) {
            console.error('❌ Error al recargar mensajes:', error);
            throw error;
          }

          console.log('✅ Mensajes recargados:', data.length, 'mensajes');

          // Transformar los datos al formato esperado por el frontend
          const messages = data.map(doc => ({
            id: String(doc.id),
            data: {
              date: doc.date,
              content: doc.content,
              senderName: doc.senderName,
              from: doc.sender_id,
              to: doc.sender_id === usuarioId ? otherUserId : usuarioId,
              isRead: doc.isRead
            }
          }));

          setMessagesToRedux(messages);
        })
        .subscribe();

      // Ejecutar la consulta inicial para cargar los datos
      consulta.then(({ data, error }) => {
        if (error) {
          console.error('❌ Error al obtener mensajes iniciales:', error);
          throw error;
        }

        console.log('✅ Mensajes iniciales cargados:', data.length, 'mensajes');

        // Transformar los datos al formato esperado por el frontend
        const messages = data.map(doc => ({
          id: String(doc.id),
          data: {
            date: doc.date,
            content: doc.content,
            senderName: doc.senderName,
            from: doc.sender_id,
            to: doc.sender_id === usuarioId ? otherUserId : usuarioId,
            isRead: doc.isRead
          }
        }));

        setMessagesToRedux(messages);
      }).then(() => {
        resolve(() => {
          supabase.removeChannel(channel);
        });
      }).catch(error => {
        supabase.removeChannel(channel);
        reject(error);
      });
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
      reject(error);
    }
  });
};

// Actualizar mensajes como leídos
export const actualizarLeidosPersistencia = (mensajesLeidos) => {
  if (!mensajesLeidos || mensajesLeidos.length === 0) {
    console.log('📭 No hay mensajes para marcar como leídos');
    return;
  }
  
  console.log('📧 Marcando', mensajesLeidos.length, 'mensajes como leídos');
  
  try {
    mensajesLeidos.forEach(async mensaje => {
      console.log('📝 Actualizando mensaje ID:', mensaje.id);

      const { error } = await supabase
        .from('messages')
        .update({ isRead: true })
        .eq('id', mensaje.id);

      if (error) {
        console.error('❌ Error al actualizar mensaje como leído:', error);
      } else {
        console.log('✅ Mensaje', mensaje.id, 'marcado como leído');
      }
    });
  } catch (error) {
    console.error('Error en actualizarLeidosPersistencia:', error);
  }
};

// Configurar notificaciones para mensajes nuevos
// IMPORTANTE: usuarioId es el ID del usuario (no email)
export const notificacionesPorMensajesPersistencia = (usuarioId) => {
  console.log('🔔 Configurando notificaciones para usuario:', usuarioId);

  try {
    // Configuramos una suscripción para detectar mensajes no leídos enviados por otros usuarios
    const channel = supabase
      .channel('messages-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `user_id=eq.${usuarioId} AND sender_id=neq.${usuarioId} AND isRead=eq.false`
      }, (payload) => {
        // Cuando llega un mensaje nuevo, generamos la notificación
        const mensajeNuevo = payload.new;
        
        console.log('🔔 Nuevo mensaje recibido de:', mensajeNuevo.senderName);

        if (mensajeNuevo && mensajeNuevo.sender_id !== usuarioId) {
          const notification = {
            title: 'Nuevo Mensaje de ' + mensajeNuevo.senderName,
            text: mensajeNuevo.content,
            foreground: true,
            vibrate: true
          };

          console.log('📲 Disparando notificación:', notification.title);

          // Importar la función desde utils
          import('../../utils/utils').then(utils => {
            utils.triggerNotification(notification);
          });
        }
      })
      .subscribe();
    
    console.log('✅ Notificaciones configuradas correctamente');

    // Esta función no devuelve nada, pero podríamos devolver la función para cancelar la suscripción
    return () => {
      console.log('🔕 Cancelando suscripción de notificaciones');
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.error('❌ Error en notificacionesPorMensajesPersistencia:', error);
  }
};
