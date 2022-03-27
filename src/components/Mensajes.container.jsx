import { useState, useEffect, useCallback } from "react";
import { connect } from "react-redux";
import { 
  getMessages,
  getCliente,
  sendMessage,
  getUsuariosSelect
} from "../redux/root-actions";
import history from "../history";
import MensajesPresentational from './Mensajes.presentational';
import { actualizarLeidos } from "../utils/utils";

const Mensajes = ({
  admin,
  usuario, // El usuario logueado, cliente es el cliente seleccionado
  coleccionMensajes,
  getMessages,
  getCliente,
  sendMessage,
  getUsuariosSelect,
  usuariosSelect
}) => {

  console.log("MENSAJES container");

  // MODIFICANDO UN POCO EL CÓDIGO, SIRVe PARA ENVIAR MENSAJES ENTRE CLIENTES

  const INIT_MESSAGE_DATA = '';
  const INIT_CLIENTE = {
    id: '',
    data: {}
  }

  const [ messageData, setMessageData ] = useState(INIT_MESSAGE_DATA);
  const [ cliente, setCliente ] = useState(INIT_CLIENTE); // Es el cliente seleccionado cuando soy admin

  // El useCallback tiene como dependencia el cliente, cuando elijo otro cliente, se actualiza.
  const initForm = useCallback(async () => {
    await getMessages(usuario.data.EmailUsu, cliente.data.EmailUsu || "admin@mauriciocruzdrones.com");
    if(!usuariosSelect?.length && admin) await getUsuariosSelect();
    let mensajesLeidos = coleccionMensajes.filter(mensaje => (mensaje.data.isRead==false));
    console.log("mensajesLeidos: " + JSON.stringify(mensajesLeidos));
    actualizarLeidos(mensajesLeidos);
  }, [cliente]);

  // initForm es la dependencia del useEffect que se vuelve a ejecutar cuando cambia initForm, que cambia cuando 
  // se actualiza el useCallback, cuando a su vez cambia el cliente.
  useEffect(() => {
    initForm();
  }, [initForm]);


  const handleOnChangeUsuarios = async (e) => {
    if(e){
      const cliente = await getCliente(e.value);
      setCliente(cliente);
    }
  }


  const changeInputMessage = target => setMessageData(target.value);

  const handleSendMessage = async () => {
    const message = {
      id: '',
      data: {
        date: new Date().getTime(),
        content: messageData,
        senderName: usuario.data.NombreUsu,
        from: usuario.data.EmailUsu,
        // Si es admin, envío al invitado (PARA PROBAR). LUEGO HACER SELECT PARA ELEGIR EL CLIENTE
        to: cliente.data.EmailUsu || "admin@mauriciocruzdrones.com",
      }
    }
    setMessageData(INIT_MESSAGE_DATA);
    // Envía el mensaje si no está vacío, y si el remitente y el destinatario no es el mismo.
    if(message.data.to != message.data.from && message.data.content) await sendMessage(message);
  };

  // Actualiza mensajes leídos. Ver si acá es el mejor lugar.
  // let mensajesLeidos = coleccionMensajes.filter(mensaje => (mensaje.data.isRead==false));
  // console.log("mensajesLeidos: " + JSON.stringify(mensajesLeidos));
  // actualizarLeidos(mensajesLeidos);

  

  return (
    <MensajesPresentational 
      cliente={cliente}
      usuario={usuario}
      admin={admin}
      messageData={messageData}
      coleccionMensajes={coleccionMensajes}
      changeInputMessage={changeInputMessage}
      handleSendMessage={handleSendMessage}
      handleOnChangeUsuarios={handleOnChangeUsuarios}
      usuariosSelect={usuariosSelect}
    />
  );

};

const mapStateToProps = (state) => ({
  usuario: state.app.usuario,
  coleccionMensajes: state.app.coleccionMensajes,
  usuariosSelect: state.app.usuariosSelect
});

export default connect(mapStateToProps, { 
  sendMessage, 
  getMessages,
  getCliente,
  getUsuariosSelect
})(Mensajes);