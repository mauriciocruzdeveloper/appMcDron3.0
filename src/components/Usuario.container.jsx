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
    guardarUsuario,
    eliminarUsuario,
    confirm,
    getProvinciasSelect,
    getLocalidadesPorProvincia,
  } from "../redux/root-actions";
// Components
import UsuarioPresentational from './Usuario.presentational'


const Usuario = ({ 
    guardarUsuario,
    eliminarUsuario,
    confirm,
    provinciasSelect,
    localidadesSelect,
    getProvinciasSelect,
    getLocalidadesPorProvincia,
    coleccionUsuarios,
}) => {

    console.log("USUARIO container");

    const { id } = useParams();

    const [ cliente, setCliente ] = useState();

    // Esto inicializa el form al montar y limpia al desmontar ///////

    // Inicializa los datos del formulario.
    const inicializaFormulario = useCallback(async () => {
        // Busca los datos en caso que no estén en el store.
        !provinciasSelect?.length ? await getProvinciasSelect() : null;
        setCliente(coleccionUsuarios.find(usuario => usuario.id == id))
    }, [coleccionUsuarios]);

    useEffect(() => {
        inicializaFormulario();
    }, [inicializaFormulario]);

    const changeInputUsu = target => {
        setCliente({ 
            ...cliente, 
            data: {
                ...cliente.data,
                [target.id]: target.value
            } 
        });
    };

    const handleGuardarUsuario = () => {
        confirm(
            "Guardar Usuario?",
            "Atención",
            "warning",
            () => guardarUsuario(cliente)
        );
    }

    const handleEliminarUsuario = () => {
        confirm(
            "Eliminar Reparación?",
            "Atención",
            "danger",
            async () => {
                await eliminarUsuario(cliente.id);
                history.goBack();
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
                // Sólo se renderiza el commponente presentacional cuando están los datos necesarios ya cargados.
        cliente && provinciasSelect.length ?
        <UsuarioPresentational 
            cliente={cliente}
            provinciasSelect={provinciasSelect}
            localidadesSelect={localidadesSelect}
            handleGuardarUsuario={handleGuardarUsuario}
            handleEliminarUsuario={handleEliminarUsuario}
            changeInputUsu={changeInputUsu}
            handleOnChangeProvincias={handleOnChangeProvincias}
            handleOnChangeLocalidades={handleOnChangeLocalidades}
        /> : null
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
        guardarUsuario,
        eliminarUsuario, 
        confirm,
        getProvinciasSelect,
        getLocalidadesPorProvincia,
    })(Usuario);