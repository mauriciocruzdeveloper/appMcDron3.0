import Select from 'react-select';

const UsuarioPresentational = ({ 
    cliente,
    provinciasSelect,
    localidadesSelect,
    handleGuardarUsuario,
    handleEliminarUsuario,
    changeInputUsu,
    handleOnChangeProvincias,
    handleOnChangeLocalidades
}) => {

    

    console.log("USUARIO presentational");

    return(
        <div
            className="p-4"
            style={{
                backgroundColor: "#EEEEEE"
            }}
        >
            <div 
                className="card mb-3"
                style={{
                    backgroundColor: "#CCCCCC",

                }}
            >
                <div className="card-body">
                    <h3 className="card-title">
                        USUARIO
                    </h3>
                    <div>Nombre: {cliente?.data?.NombreUsu} {cliente?.data?.ApellidoUsu}</div>
                    <div>Email: {cliente?.data?.EmailUsu}</div>
                </div>
            </div>

            <div className="card mb-3">
                <div className="card-body">
                <h5 className="card-title bluemcdron">DATOS DEL USUARIO</h5>
                <div>
                        <label className="form-label">E-mail</label>
                        <input 
                            onChange={e => changeInputUsu(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="EmailUsu" 
                            value={cliente?.data?.EmailUsu || ""}
                        />
                    </div>
                    <div>
                        <label className="form-label">Nombre</label>
                        <input 
                            onChange={e => changeInputUsu(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="NombreUsu" 
                            value={cliente?.data?.NombreUsu || ""}
                        />
                    </div>
                    <div>
                        <label className="form-label">Apellido</label>
                        <input 
                            onChange={e => changeInputUsu(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="ApellidoUsu" 
                            value={cliente?.data?.ApellidoUsu || ""}
                        />
                    </div>
                    <div>
                        <label className="form-label">Teléfono</label>
                        <input 
                            onChange={e => changeInputUsu(e.target)} 
                            type="tel" 
                            className="form-control" 
                            id="TelefonoUsu"
                            value={cliente?.data?.TelefonoUsu || ""}
                        />
                    </div>
                    <div>
                        <label className="form-label">Provincia</label>
                        <Select 
                            options={provinciasSelect}
                            onChange={e => handleOnChangeProvincias(e)}
                            id="ProvinciaUsu"
                            // Hay que usar "value" y no "defaultValue". Por alguna razón que desconozco
                            // defaultValue me trae el valor del estado anterior...
                            value={({value: cliente?.data?.ProvinciaUsu, label: cliente?.data?.ProvinciaUsu})}
                        />
                    </div>
                    <div>
                        <label className="form-label">Ciudad</label>
                        <Select 
                            options={localidadesSelect}
                            onChange={e => handleOnChangeLocalidades(e)}
                            id="CiudadUsu"
                            // Ver si puedo usar useRef para habilitar y desabilitar
                            // el campo luego de elegir la provincia
                            // ref="CiudadUsu"
                            value={{value: cliente?.data?.CiudadUsu, label: cliente?.data?.CiudadUsu}}
                        />
                    </div>
                </div>
            </div>


           <div className="text-center">
                <button 
                    onClick={ handleGuardarUsuario }
                    className="w-100 mb-3 btn bg-bluemcdron text-white"
                >
                    Guardar
                </button>
                <button 
                    onClick={ handleEliminarUsuario }
                    className="w-100 btn bg-danger text-white"
                >
                    Eliminar
                </button>
            </div>
        </div>
    )
}

export default UsuarioPresentational;