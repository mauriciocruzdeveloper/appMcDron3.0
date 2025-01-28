import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { 
  getMessages,
  getCliente,
  sendMessage,
} from '../redux-DEPRECATED/root-actions';
import MensajesPresentational from './Mensajes.presentational';
import { actualizarLeidos } from '../utils/utils';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { Usuario } from '../types/usuario';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';

export default function Mensajes(): JSX.Element {
  console.log('MENSAJES container');
  const dispatch = useAppDispatch();
  const isAdmin = useAppSelector(state => state.app.usuario?.data.Admin);
  const coleccionMensajes = useAppSelector(state => state.mensaje.coleccionMensajes);
  const usuario = useAppSelector(state => state.app.usuario);
  const usuariosSelect = useAppSelector(state => state.usuario.usuariosSelect);

  // MODIFICANDO UN POCO EL CÓDIGO, SIRVe PARA ENVIAR MENSAJES ENTRE CLIENTES

  const [ messageData, setMessageData ] = useState<string>();
  const [ cliente, setCliente ] = useState<Usuario>(); // Es el cliente seleccionado cuando soy admin

  // El useCallback tiene como dependencia el cliente, cuando elijo otro cliente, se actualiza.
  const initForm = useCallback(async () => {
    await getMessages(usuario?.data.EmailUsu, cliente?.data.EmailUsu || 'admin@mauriciocruzdrones.com');
    const mensajesLeidos = coleccionMensajes.filter(mensaje => (mensaje.data.isRead==false));
    actualizarLeidos(mensajesLeidos);
  }, [cliente]);

  // initForm es la dependencia del useEffect que se vuelve a ejecutar cuando cambia initForm, que cambia cuando 
  // se actualiza el useCallback, cuando a su vez cambia el cliente.
  useEffect(() => {
    initForm();
  }, [initForm]);


  const handleOnChangeUsuarios = async (e: any) => {
    if(e){
      const cliente = await dispatch(getCliente(e.value));
      setCliente(cliente);
    }
  }


  const changeInputMessage = (target: any) => setMessageData(target.value);

  const handleSendMessage = async () => {
    if (!usuario || !cliente) return;
    const message = {
      id: '',
      data: {
        date: new Date().getTime(),
        content: messageData,
        senderName: usuario?.data.NombreUsu,
        from: usuario.data.EmailUsu,
        // Si es admin, envío al invitado (PARA PROBAR). LUEGO HACER SELECT PARA ELEGIR EL CLIENTE
        to: cliente.data.EmailUsu || 'admin@mauriciocruzdrones.com',
      }
    }
    setMessageData('');
    // Envía el mensaje si no está vacío, y si el remitente y el destinatario no es el mismo.
    if(message.data.to != message.data.from && message.data.content) await sendMessage(message);
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
