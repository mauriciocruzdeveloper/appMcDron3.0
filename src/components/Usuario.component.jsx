import { useEffect, useCallback } from "react";
import { connect } from "react-redux";
import { 
    changeInputUsu,
    // Cliente y Usuario es lo mismo, pero Usuario se usa para referirse
    // al usuario logueado, y Cliente para el usuario en un ABMC
    getCliente,
    setEstado,
    guardarUsuario,
    eliminarUsuario,
    abreModal,
    confirm,
    getProvinciasSelect,
    getLocalidadesPorProvincia,
    setProvinciaCliente,
    setLocalidadCliente,
    clearCliente
  } from "../redux/root-actions";

import { useParams } from "react-router-dom";

import history from "../history";

import Select from 'react-select';

const Reparacion = ({ 
    changeInputUsu, 
    getCliente,
    // Cliente es el usuario que se está mostrando, usuario es el logueado
    cliente,
    guardarUsuario,
    eliminarUsuario,
    abreModal,
    confirm,
    provincias,
    localidades,
    getProvinciasSelect,
    getLocalidadesPorProvincia,
    setProvinciaCliente,
    setLocalidadCliente,
    clearCliente
}) => {

    console.log("USUARIO");

    const { id } = useParams();

    // 

    const inicializaFormulario = useCallback(async () => {
        await getProvinciasSelect();
        await getCliente(id);
    }, [id]);

    useEffect(() => {
        inicializaFormulario();
        return () => clearCliente();
    }, [inicializaFormulario]);

    const handleGuardarUsuario = () => {
        confirm(
            "Guardar Usuario?",
            "Atención",
            "warning",
            () => {
                guardarUsuario(cliente)
                .then(reparacion => abreModal("Guardado con éxito", "Usuario: " + cliente.id, "success" ))
                .catch(error => abreModal("Error al guardar ", "Código - " + error.code, "danger" ));
            }
        );
    }

    const handleEliminarUsuario = () => {
        confirm(
            "Eliminar Reparación?",
            "Atención",
            "danger",
            () => {
                console.log("llega al callBakc de confirm") ;
                eliminarUsuario(cliente)
                .then(reparacion => {
                        abreModal("Usuario eliminado con éxito", "Reparación: " + cliente.id, "success" );
                        history.goBack();
                })
                .catch(error => abreModal("Error al guardar ", "Código - " + error.code, "danger" ))
            }
        );
    }

    const handleOnChangeProvincias = async (e) => {
        await getLocalidadesPorProvincia(e.value);
        await setProvinciaCliente(e.value);
    }

    const handleOnChangeLocalidades = async (e) => {
        await setLocalidadCliente(e.value);
    }

    console.log("cliente: " + JSON.stringify(cliente));

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
                    <div>Email: {cliente?.id}</div>
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
                            id="UsuarioUsu" 
                            value={cliente.id || ""}
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
                            type="number" 
                            className="form-control" 
                            id="TelefonoUsu"
                            value={cliente?.data?.TelefonoUsu || ""}
                        />
                    </div>
                    <div>
                        <label className="form-label">Provincia</label>
                        <Select 
                            options={provincias}
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
                            options={localidades}
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

const mapStateToProps = (state) => ({
    cliente: state.app?.cliente,
    provincias: state.app?.provincias,
    localidades: state.app?.localidades,
  });


export default connect(
    mapStateToProps, 
    {
        changeInputUsu,
        getCliente,
        setEstado, 
        guardarUsuario,
        eliminarUsuario, 
        abreModal,
        confirm,
        getProvinciasSelect,
        getLocalidadesPorProvincia,
        setProvinciaCliente,
        setLocalidadCliente,
        clearCliente
    })(Reparacion);