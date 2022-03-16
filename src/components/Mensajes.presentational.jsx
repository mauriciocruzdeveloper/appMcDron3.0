import Select from 'react-select';
import { MessageBox } from 'react-chat-elements';

const MensajesPresentational = (props) => {

  const { 
    admin,
    cliente,
    usuario,
    messageData,
    coleccionMensajes,
    changeInputMessage,
    handleSendMessage,
    handleOnChangeUsuarios,
    usuariosSelect,
  } = props;
  console.table("MENSAJES presentational"); 
  // console.log("Cliente: " + JSON.stringify(cliente));
  // console.log("usuariosSelect: " + JSON.stringify(usuariosSelect));
  // console.log("coleccionMensajes: " + JSON.stringify(coleccionMensajes));
  // console.log("messageData: " + JSON.stringify(messageData));

  return (
    <div className="p-4" >

      {admin && cliente && usuariosSelect ?
      <div className="card mb-3">
        <div className="card-body">
          <h5 className="card-title bluemcdron">CLIENTE</h5>
          <div>
              <label className="form-label">E-mail</label>
              <Select 
                  options={usuariosSelect}
                  noOptionsMessage={() => null}
                  onChange={e => handleOnChangeUsuarios(e)}
                  id="EmailUsu"
                  value={{
                    value: `${cliente.data?.NombreUsu || ''} - ${cliente.data?.EmailUsu || ''}`, 
                    label: `${cliente.data?.NombreUsu || ''} - ${cliente.data?.EmailUsu || ''}`
                  }}
              />
          </div>
        </div>
      </div>
      : null }


      <div className="d-flex flex-column-reverse">
        {coleccionMensajes.map(message => (
            <div
              key={message.id}
              className="card mb-3 p-1" 
              aria-current="true"
              style=
              { 
                { 
                  backgroundColor: 
                  (message.data.senderName == usuario.data.NombreUsu) 
                    ? "#88CCEE" 
                    : "#FFFFFF" 
                }
              }
            >
              <div className="w-100 justify-content-between">
                <strong className="mb-1">{message.data.senderName}</strong>
                <p className='mb-1'>{message.data.content}</p>
              </div>
              <small>{new Date(message.data.date).toLocaleString()}</small>
            </div>
        ))}



        <div className="card mb-3 p-1"  aria-current="true">
          <div className="d-flex w-100 justify-content-between">
            <input 
              className="d-flex w-100 justify-content-between"
              type="text" 
              value={messageData}
              id="newMessage"
              onChange={e => changeInputMessage(e.target)}
            />
            <button type="submit" onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      </div>
    </div>


  );
};

export default MensajesPresentational;