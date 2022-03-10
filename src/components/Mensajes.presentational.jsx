const MensajesPresentational = ({ 
  admin,
  messageData,
  coleccionMensajes,
  changeInputMessage,
  handleSendMessage
}) => {

  console.log("MENSAJES presentational");


  return (
    <div>

      <div 
        className="p-4" 
        >
        {coleccionMensajes.map(message => (
          <div
            key={message.id}
            className="card mb-3 p-1" 
            aria-current="true"
            // onClick={() => history.push(`/inicio/usuarios/${usuario.id}`)}
          >
            <div className="d-flex w-100 justify-content-between">
              <h5 className="mb-1">Mensaje: {message.data.content}</h5>
            </div>
            <small>{message.data.date.now}</small>
          </div>
        ))}
      </div>

      <input 
        type="text" 
        value={messageData}
        id="newMessage"
        onChange={e => changeInputMessage(e.target)}
      />
      <button type="submit" onClick={handleSendMessage}>Send</button>

    </div>
  );
};

export default MensajesPresentational;