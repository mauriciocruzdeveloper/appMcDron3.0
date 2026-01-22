import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import MensajesPresentational from './Mensajes.presentational';
import { actualizarLeidos } from '../utils/utils';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { Usuario } from '../types/usuario';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { sendMessageAsync } from '../redux-tool-kit/mensaje/mensaje.actions';
import { getClienteAsync } from '../redux-tool-kit/usuario/usuario.actions';
import { useModal } from './Modal/useModal';
import { setOtherUserIdMessage, setUsuarioIdMessage } from '../redux-tool-kit/mensaje/mensaje.slice';

export default function Mensajes(): JSX.Element {
  console.log('MENSAJES container');
  const dispatch = useAppDispatch();
  const isAdmin = useAppSelector(state => state.app.usuario?.data.Role === 'admin');
  const coleccionMensajes = useAppSelector(state => state.mensaje.coleccionMensajes);
  const usuario = useAppSelector(state => state.app.usuario);
  const usuariosSelect = useAppSelector(state => state.usuario.usuariosSelect);
  const [messageData, setMessageData] = useState<string>();
  const [cliente, setCliente] = useState<Usuario>(); // Es el cliente seleccionado cuando soy admin

  const { openModal } = useModal();

  // MODIFICANDO UN POCO EL CÓDIGO, SIRVe PARA ENVIAR MENSAJES ENTRE CLIENTES


  // El useCallback tiene como dependencia el cliente, cuando elijo otro cliente, se actualiza.
  const initForm = useCallback(async () => {
    const mensajesLeidos = coleccionMensajes.filter(mensaje => (mensaje.data.isRead == false));
    actualizarLeidos(mensajesLeidos);
  }, [coleccionMensajes]);

  // initForm es la dependencia del useEffect que se vuelve a ejecutar cuando cambia initForm, que cambia cuando 
  // se actualiza el useCallback, cuando a su vez cambia el cliente.
  useEffect(() => {
    initForm();
  }, [initForm]);

  useEffect(() => {
    dispatch(setOtherUserIdMessage(cliente?.id ?? usuario?.id ?? ''));
  }, [cliente]);

  useEffect(() => {
    dispatch(setUsuarioIdMessage(usuario?.id ?? ''));
  }, [usuario]);


  const handleOnChangeUsuarios = async (e: any) => {
    if (e) {
      // TODO: Hacer algo general para manejar las respuestas y luego abrir modal
      const response = await dispatch(getClienteAsync(e.value));

      if (response.meta.requestStatus === 'rejected') {
        openModal({
          mensaje: "Error al obtener el cliente.",
          tipo: "danger",
          titulo: "Error al obtener el cliente",
        });
        return;
      }
      setCliente(response.payload);
    }
  }


  const changeInputMessage = (target: any) => setMessageData(target.value);

  const handleSendMessage = async () => {
    if (!usuario?.id || !cliente?.id) return;
    const message = {
      id: '',
      data: {
        date: new Date().getTime(),
        content: messageData,
        senderName: usuario.data.NombreUsu,
        from: usuario.id, // Usar ID del usuario en lugar de email
        to: cliente.id, // Usar ID del cliente en lugar de email
      }
    }
    setMessageData('');
    // Envía el mensaje si no está vacío, y si el remitente y el destinatario no es el mismo.
    if (message.data.to !== message.data.from && message.data.content) await dispatch(sendMessageAsync(message));
  };

  // Actualiza mensajes leídos. Ver si acá es el mejor lugar.
  // let mensajesLeidos = coleccionMensajes.filter(mensaje => (mensaje.data.isRead==false));
  // actualizarLeidos(mensajesLeidos);

  return (
    <MensajesPresentational
      cliente={cliente}
      usuario={usuario}
      admin={isAdmin}
      messageData={messageData}
      coleccionMensajes={coleccionMensajes}
      changeInputMessage={changeInputMessage}
      handleSendMessage={handleSendMessage}
      handleOnChangeUsuarios={handleOnChangeUsuarios}
      usuariosSelect={usuariosSelect}
    />
  );
}
