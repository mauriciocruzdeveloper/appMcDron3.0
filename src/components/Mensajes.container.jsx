import { useState, useEffect, useCallback } from "react";
import { connect } from "react-redux";
import { 
  getMessages,
  sendMessage
} from "../redux/root-actions";
import history from "../history";
import MensajesPresentational from './Mensajes.presentational';


const Mensajes = ({
  admin,
  usuario, 
  coleccionMensajes,
  getMessages,
  sendMessage
}) => {

  console.log("MENSAJES container");

  const INIT_MESSAGE_DATA = '';

  const [ messageData, setMessageData ] = useState(INIT_MESSAGE_DATA);

  const initForm = useCallback(async () => {
    if(!coleccionMensajes?.length) await getMessages(usuario.data.EmailUsu); 
  }, [getMessages]);

  useEffect(() => {
    initForm();
  }, [initForm]);

  const changeInputMessage = target => setMessageData(target.value);

  const handleSendMessage = async () => {
    const message = {
      id: '',
      data: {
        date: new Date(),
        content: messageData,
        from: admin ? "admin@mauriciocruzdrones.com" : usuario.data.EmailUsu,
        // Si es admin, envío al invitado (PARA PROBAR). LUEGO HACER SELECT PARA ELEGIR EL CLIENTE
        to: admin ? "invitado@mauriciocruzdrones.com" : "admin@mauriciocruzdrones.com"
      }
    }
    setMessageData(INIT_MESSAGE_DATA);
    await sendMessage(message);
    
  };

  console.log("Mensaje: " + JSON.stringify(messageData));

  return (
    <MensajesPresentational 
      admin={admin}
      messageData={messageData}
      coleccionMensajes={coleccionMensajes}
      changeInputMessage={changeInputMessage}
      handleSendMessage={handleSendMessage}
    />
  );
};

const mapStateToProps = (state) => ({
  usuario: state.app.usuario,
  coleccionMensajes: state.app.coleccionMensajes
});

export default connect(mapStateToProps, { sendMessage, getMessages })(Mensajes);