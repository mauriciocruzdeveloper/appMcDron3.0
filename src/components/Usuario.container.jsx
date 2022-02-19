//React
import { useEffect, useCallback, useState } from "react";
//
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import history from "../history";
//Actions
import { 
    changeInputUsu,
    // Cliente y Usuario es lo mismo, pero Usuario se usa para referirse
    // al usuario logueado, y Cliente para el usuario en un ABMC
    getCliente,
    guardarUsuario,
    eliminarUsuario,
    abreModal,
    confirm,
    getProvinciasSelect,
    getLocalidadesPorProvincia,
    setProvinciaCliente,
    setLocalidadCliente,
    clearForm,
    // setCliente
  } from "../redux/root-actions";
//Components
import Select from 'react-select';
import UsuarioPresentational from './Usuario.presentational'


const Usuario = ({ 
    // changeInputUsu, 
    getCliente,
    // Cliente es el usuario que se está mostrando, usuario es el logueado
    // cliente, // PARA REDUX
    guardarUsuario,
    eliminarUsuario,
    abreModal,
    confirm,
    provinciasSelect,
    localidadesSelect,
    getProvinciasSelect,
    getLocalidadesPorProvincia,
    // setProvinciaCliente, // PARA REDUX
    // setLocalidadCliente, // PARA REDUX
    // clearForm, // PARA REDUX
    coleccionUsuarios,
    // setCliente
}) => {

    console.log("USUARIO container");

    const { id } = useParams();

    // Esto inicializa el form al montar y limpia al desmontar ///////

    // Inicializa los datos del formulario.
    const inicializaFormulario = useCallback(async () => {
        // Busca los datos en caso que no estén en el store.
        !provinciasSelect?.length ? await getProvinciasSelect() : null;
        coleccionUsuarios.length 
        ? setCliente(coleccionUsuarios.find(usuario => usuario.id == id))
        : await getCliente(id)
                .catch(error => {
                    abreModal("Error buscando Cliente ", `Código - ${error.code}`, "danger" );
                    history.goBack();
                });
    }, [id]);

    useEffect(() => {
        inicializaFormulario();
        // return () => clearForm(); // PARA REDUX
    }, [inicializaFormulario]);

    ///////////////////////////////////////////////////////////////////

    const [ cliente, setCliente ] = useState();

    const changeInputUsu = target => setCliente({ 
        ...cliente, 
        data: {
            ...cliente.data,
            [target.id]: target.value
        } 
    });
    
    ///////////////////////////////////////////////////////////////////

    const handleGuardarUsuario = () => {
        confirm(
            "Guardar Usuario?",
            "Atención",
            "warning",
            () => {
                guardarUsuario(cliente)
                .then(reparacion => abreModal("Guardado con éxito", "Usuario: " + cliente.id, "success" ))
                //.catch(error => abreModal("Error al guardar ", "Código - " + error.code, "danger" ));
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
                eliminarUsuario(cliente.id)
                .then(id => {
                    abreModal("Usuario eliminado con éxito", "Usuario: " + id, "success" );
                    history.goBack();
                })
                .catch(error => abreModal("Error al guardar ", "Código - " + error.code, "danger" ))
            }
        );
    }

    // PARA REDUX
    // const handleOnChangeProvincias = async (e) => {
    //     await getLocalidadesPorProvincia(e.value);
    //     await setProvinciaCliente(e.value);
    // }

    // PARA USESTATE
    const handleOnChangeProvincias = async (e) => {
        await getLocalidadesPorProvincia(e.value);
        setCliente({ 
            ...cliente, 
            data: {
                ...cliente.data,
                ProvinciaUsu: e.value
            } 
        });
    }

    // PARA REDUX
    // const handleOnChangeLocalidades = async (e) => {
    //     await setLocalidadCliente(e.value);
    // }

    // PARA USESTATE
    const handleOnChangeLocalidades = (e) => {
        setCliente({ 
            ...cliente, 
            data: {
                ...cliente.data,
                CiudadUsu: e.value
            } 
        });
    }

    return(
        <UsuarioPresentational 
            cliente={cliente}
            provinciasSelect={provinciasSelect}
            localidadesSelect={localidadesSelect}
            handleGuardarUsuario={handleGuardarUsuario}
            handleEliminarUsuario={handleEliminarUsuario}
            changeInputUsu={changeInputUsu}
            handleOnChangeProvincias={handleOnChangeProvincias}
            handleOnChangeLocalidades={handleOnChangeLocalidades}
        />
    )
}

const mapStateToProps = (state) => ({
    cliente: state.app?.cliente,
    provinciasSelect: state.app?.provinciasSelect,
    localidadesSelect: state.app?.localidadesSelect,
    coleccionUsuarios: state.app?.coleccionUsuarios
  });


export default connect(
    mapStateToProps, 
    {
        changeInputUsu,
        getCliente,
        guardarUsuario,
        eliminarUsuario, 
        abreModal,
        confirm,
        getProvinciasSelect,
        getLocalidadesPorProvincia,
        setProvinciaCliente,
        setLocalidadCliente,
        clearForm,
        // setCliente // PARA REDUX
    })(Usuario);