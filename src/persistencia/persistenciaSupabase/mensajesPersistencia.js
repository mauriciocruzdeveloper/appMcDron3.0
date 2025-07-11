import { supabase } from './supabaseClient.js';

// SEND de un mensaje
export const sendMessagePersistencia = (message) => {
  console.log('sendMessagePersistencia()');
  return new Promise(async (resolve, reject) => {
    try {
      // Preparar datos para el mensaje del remitente
      const dataFrom = {
        date: message.data.date,
        content: message.data.content,
        emailCli: message.data.to, // Para el remitente, el destinatario es el cliente
        sender: message.data.from,
        senderName: message.data.senderName,
        isRead: false
      };

      // Preparar datos para el mensaje del
      const dataTo = {
        date: message.data.date,
        content: message.data.content,
        emailCli: message.data.from, // Para el destinatario, el remitente es el cliente
        sender: message.data.from,
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

      if (errorFrom) throw errorFrom;

      // Insertar mensaje en la tabla de mensajes del destinatario
      const { error: errorTo } = await supabase
        .from('messages')
        .insert({
          ...dataTo,
          user_id: message.data.to,
          created_at: new Date().toISOString()
        });

      if (errorTo) throw errorTo;

      resolve();
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      reject(error);
    }
  });
};

// GET todos los mensajes entre dos usuarios
export const getMessagesPersistencia = (setMessagesToRedux, emailUsu, emailCli) => {
  console.log('getMessagesPersistencia: ' + emailUsu + ' ' + emailCli);
  return new Promise((resolve, reject) => {
    try {
      // Consultar mensajes para el usuario actual donde el cliente sea el especificado
      const consulta = supabase
        .from('messages')
        .select('*')
        .eq('user_id', emailUsu)
        .eq('emailCli', emailCli)
        .order('date', { ascending: true });

      // Configurar suscripción en tiempo real
      const channel = supabase
        .channel('messages-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `user_id=eq.${emailUsu} AND emailCli=eq.${emailCli}`
        }, async () => {
          // Cuando llega un mensaje nuevo, ejecutamos la consulta nuevamente
          const { data, error } = await consulta;

          if (error) throw error;

          // Transformar los datos al formato esperado por el frontend
          const messages = data.map(doc => ({
            id: String(doc.id),
            data: {
              date: doc.date,
              content: doc.content,
              senderName: doc.senderName,
              from: doc.sender,
              to: doc.sender === emailUsu ? emailCli : emailUsu,
              isRead: doc.isRead,
              emailUsu: emailUsu // Para saber a qué usuario pertenece este mensaje
            }
          }));

          setMessagesToRedux(messages);
        })
        .subscribe();

      // Ejecutar la consulta inicial para cargar los datos
      consulta.then(({ data, error }) => {
        if (error) throw error;

        // Transformar los datos al formato esperado por el frontend
        const messages = data.map(doc => ({
          id: String(doc.id),
          data: {
            date: doc.date,
            content: doc.content,
            senderName: doc.senderName,
            from: doc.sender,
            to: doc.sender === emailUsu ? emailCli : emailUsu,
            isRead: doc.isRead,
            emailUsu: emailUsu // Para saber a qué usuario pertenece este mensaje
          }
        }));

        setMessagesToRedux(messages);
      });

      // Devolver función para cancelar la suscripción
      resolve(() => {
        supabase.removeChannel(channel);
      });
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
      reject(error);
    }
  });
};

// Actualizar mensajes como leídos
export const actualizarLeidosPersistencia = (mensajesLeidos) => {
  try {
    mensajesLeidos.forEach(async mensaje => {
      console.log('actualiza leidos, mensaje: ' + JSON.stringify(mensaje));

      const { error } = await supabase
        .from('messages')
        .update({ isRead: true })
        .eq('id', mensaje.id)
        .eq('user_id', mensaje.data.emailUsu);

      if (error) {
        console.error('Error al actualizar mensaje como leído:', error);
      } else {
        console.log('Mensaje actualizado como leído');
      }
    });
  } catch (error) {
    console.error('Error en actualizarLeidosPersistencia:', error);
  }
};

// Configurar notificaciones para mensajes nuevos
export const notificacionesPorMensajesPersistencia = (emailUsu) => {
  console.log('notificacionesPorMensajesPersistencia:', emailUsu);

  try {
    // Configuramos una suscripción para detectar mensajes no leídos enviados por otros usuarios
    const channel = supabase
      .channel('messages-notifications')

      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `user_id=eq.${emailUsu} AND sender=neq.${emailUsu} AND isRead=eq.false`
      }, (payload) => {
        // Cuando llega un mensaje nuevo, generamos la notificación
        const mensajeNuevo = payload.new;

        if (mensajeNuevo && mensajeNuevo.sender !== emailUsu) {
          const notification = {
            title: 'Nuevo Mensaje de ' + mensajeNuevo.senderName,
            text: mensajeNuevo.content,
            foreground: true,
            vibrate: true
          };

          // Importar la función desde utils
          import('../../utils/utils').then(utils => {
            utils.triggerNotification(notification);
          });
        }
      })
      .subscribe();

    // Esta función no devuelve nada, pero podríamos devolver la función para cancelar la suscripción
    return () => {
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.error('Error en notificacionesPorMensajesPersistencia:', error);
  }
};
