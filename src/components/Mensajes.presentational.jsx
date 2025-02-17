import Select from 'react-select';
import TextareaAutosize from "react-textarea-autosize";

const MensajesPresentational = (props) => {

    // Para hacer pruebas, luego desectructurar dentro de los parámetros de la función anónima.
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

    return (
        <div className="p-4" >

            {admin && usuariosSelect ?
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
                                value: `${cliente?.data?.NombreUsu || 'Admin'} - ${cliente?.data?.EmailUsu || 'admin@mauriciocruzdrones.com'}`, 
                                label: `${cliente?.data?.NombreUsu || 'Admin'} - ${cliente?.data?.EmailUsu || 'admin@mauriciocruzdrones.com'}`
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
                        <TextareaAutosize
                            onChange={e => changeInputMessage(e.target)} 
                            className="form-control" 
                            id="newMessage"
                            value={messageData}
                            rows="5"
                        />
                        <button 
                            type="submit" 
                            className="btn btn-outline-secondary bg-bluemcdron text-white" 
                            onClick={handleSendMessage}
                        >
                            <i className="bi bi-send"></i>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MensajesPresentational;