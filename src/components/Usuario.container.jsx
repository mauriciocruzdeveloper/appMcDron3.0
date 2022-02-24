// React
import { useEffect, useCallback, useState } from "react";
//
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import history from "../history";
// Actions
import { 
    // Cliente y Usuario es lo mismo, pero Usuario se usa para referirse
    // al usuario logueado, y Cliente para el usuario en un ABMC
    getCliente,
    guardarUsuario,
    eliminarUsuario,
    abreModal,
    confirm,
    getProvinciasSelect,
    getLocalidadesPorProvincia,
  } from "../redux/root-actions";
// Components
import UsuarioPresentational from './Usuario.presentational'


const Usuario = ({ 
    getCliente,
    guardarUsuario,
    eliminarUsuario,
    abreModal,
    confirm,
    provinciasSelect,
    localidadesSelect,
    getProvinciasSelect,
    getLocalidadesPorProvincia,
    coleccionUsuarios,
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
    }, [inicializaFormulario]);

    const [ cliente, setCliente ] = useState();

    const changeInputUsu = target => {
        setPresupuesto({ 
            ...presupuesto, 
            cliente: {
                ...presupuesto.cliente,
                data: {
                    ...presupuesto.cliente.data,
                    [target.id]: value
                } 
            }
        });
    };

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
                eliminarUsuario(cliente.id)
                .then(id => {
                    abreModal("Usuario eliminado con éxito", "Usuario: " + id, "success" );
                    history.goBack();
                })
                .catch(error => abreModal("Error al guardar ", "Código - " + error.code, "danger" ))
            }
        );
    }

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
        getCliente,
        guardarUsuario,
        eliminarUsuario, 
        abreModal,
        confirm,
        getProvinciasSelect,
        getLocalidadesPorProvincia,
    })(Usuario);