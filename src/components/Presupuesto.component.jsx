import { useEffect, useCallback, useState } from "react";
import { connect } from "react-redux";
import TextareaAutosize from "react-textarea-autosize";
import Select from 'react-select';
import { 
    getCliente,
    guardarPresupuesto,
    abreModal,
    confirm,
    getProvinciasSelect,
    getUsuariosSelect,
    getLocalidadesPorProvincia,
    setUsuario
  } from "../redux/root-actions";

  import history from "../history";

// import { provincias } from '../datos/provincias.json'; 

const Presupuesto = ({
    admin,
    setUsuario,
    getCliente,
    usuario,
    guardarPresupuesto,
    abreModal,
    confirm,
    getProvinciasSelect,
    getUsuariosSelect,
    getLocalidadesPorProvincia,
    localidadesSelect,
    provinciasSelect,
    usuariosSelect,
}) => {

    console.log("PRESUPUESTO");

    const [ presupuesto, setPresupuesto ] = useState(
        { 
            cliente: { id: '', data: {} }, 
            reparacion: { id: '', data: {} } }
        );
    

    const changeInputUsu = target => {
        setPresupuesto({ 
            ...presupuesto, 
            cliente: {
                ...presupuesto.cliente,
                data: {
                    ...presupuesto.cliente.data,
                    [target.id]: target.value
                } 
            }
        });
    };

    const changeInputRep = target => {
        let value = null;
        if(target.type == "date"){
            let anio = target.value.substr(0, 4);
            let mes = target.value.substr(5, 2)-1;
            let dia = target.value.substr(8, 2);
            value = new Date(anio, mes, dia).getTime()+10800001; // Se agrega este número para que de bien la fecha.
        }else{
            value = target.value;
        };
        setPresupuesto({ 
            ...presupuesto, 
            reparacion: {
                ...presupuesto.reparacion,
                data: {
                    ...presupuesto.reparacion.data,
                    [target.id]: value
                } 
            }
        });
    };

    const initForm = useCallback(async () => {
        // Si el usuario es admin, deja todo en blanco para cargar cualquier usuario
        // sino cargo los datos del usuario logueado.
        //!usuario.data?.Admin ? await getCliente(usuario.id) : null; // Acá iría getCliente(usuario.id);
        !usuario.data?.Admin 
        ? setPresupuesto({ ...presupuesto, cliente: usuario }) 
        : null; // Acá iría getCliente(usuario.id);
        await getProvinciasSelect()
        .catch(error => abreModal("Error buscando ProvinciasSelect ", `Código - ${error.code}`, "danger" ));
        await getUsuariosSelect()
        .catch(error => abreModal("Error buscando UsuariosSelect ", `Código - ${error.code}`, "danger" ));
    },[usuario]);

    useEffect(() => {
        initForm();
    }, [initForm]);

    //////////////////////////////////////////////////////////////

    const handleGuardarPresupuesto = () => {
        confirm(
            "Guardar Presupuesto?",
            "Atención",
            "warning",
            async () => {
                const presupuesto = {
                    usuario: cliente,
                    reparacion: reparacion
                };
                presupuesto.reparacion.data.EstadoRep = "Consulta";
                presupuesto.reparacion.data.PrioridadRep = "1";
                presupuesto.reparacion.data.FeConRep = Date.now();

                await guardarPresupuesto(presupuesto)
                console.log(JSON.stringify(presupuesto));
                !admin ? setUsuario(presupuesto.usuario) : null;
                history.goBack();
            }
        );
    }


    const handleOnChangeProvincias = async (e) => {
        await getLocalidadesPorProvincia(e.value);
        
        setPresupuesto({ 
            ...presupuesto, 
            cliente: {
                ...presupuesto.cliente,
                data: {
                    ...presupuesto.cliente.data,
                    ProvinciaUsu: e.value
                } 
            }
        });
    }

    const handleOnChangeLocalidades = (e) => {
        setPresupuesto({ 
            ...presupuesto, 
            cliente: {
                ...presupuesto.cliente,
                data: {
                    ...presupuesto.cliente.data,
                    CiudadUsu: e.value
                } 
            }
        });
    }

    
    // Función que maneja el onChange del Select de usuarios cuando se selecciona
    // un usuario/cliente de la lista que previamente se cargó en el Select
    const handleOnChangeUsuarios = async (e) => {
        if(e){
            let cliente = await getCliente(e.value);
            setPresupuesto({ 
                ...presupuesto, 
                cliente: cliente 
            });
        }
    }

    // Función que maneja los onChange de toda la vida, del Select de usuarios.
    // Tengo que hacerlo mediante un handle porque el evento de onInputChange
    // sólo contiene el valor del input, no es un evento.
    // Abajo creo target con los atributos correctos para pasarlos como 
    // parámetro del método changeInputPresu.
    const handleOnInputChangeUsuarios = (inputEmailUsu, action) => {
        const target = {};
        target.id = "EmailUsu";
        target.value = inputEmailUsu;
        // solución para el borrado cuando blour. 
        // https://github.com/JedWatson/react-select/issues/588#issuecomment-815133270
        if(action.action === "input-change") changeInputUsu(target);
        // Otra opción
        //if (action?.action !== 'input-blur' && action?.action !== 'menu- close') changeInputUsu(target);
    }

    const { cliente, reparacion } = presupuesto;

    return(
        <div
            className="p-4"
            // style={{
            //     backgroundColor: "#EEEEEE",

            //   }}
        >

            <div className="card mb-3 bg-bluemcdron">
                <div className="card-body">
                    <h3 className="card-title text-light p-0 m-0">
                        PEDIDO DE PRESUPUESTO
                    </h3>
                </div>
            </div>
            <div className="card mb-3">
                <div className="card-body">
                    <h5 className="card-title bluemcdron">USUARIO</h5>
                    <div>
                        <label className="form-label">E-mail</label>
                        {/* Crear un componente propio para otros usos que no se borre
                        el contenido cuando se desenfoca. Ponerlo en una carpeta aparte 
                        de componentes propios */}
                        <Select 
                            options={usuariosSelect}
                            noOptionsMessage={() => null}
                            onChange={e => handleOnChangeUsuarios(e)}
                            onInputChange={handleOnInputChangeUsuarios}
                            id="EmailUsu"
                            value={{value: cliente.data?.EmailUsu, label: cliente.data?.EmailUsu}}
                            isDisabled={!admin}
                        />
                    </div>
                    <div>
                        <label className="form-label">Nombre</label>
                        <input 
                            onChange={e => changeInputUsu(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="NombreUsu" 
                            value={cliente.data?.NombreUsu || ""}
                        />
                    </div>
                    <div>
                        <label className="form-label">Apellido</label>
                        <input 
                            onChange={e => changeInputUsu(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="ApellidoUsu" 
                            value={cliente.data?.ApellidoUsu || ""}
                        />
                    </div>
                    <div>
                        <label className="form-label">Teléfono</label>
                        <input 
                            onChange={e => changeInputUsu(e.target)} 
                            type="tel" 
                            className="form-control" 
                            id="TelefonoUsu"
                            value={cliente.data?.TelefonoUsu || ""}
                        />
                    </div>
                    <div>
                        <label className="form-label">Provincia</label>
                        <Select 
                            // onFocus={handleOnFocusSelect}
                            options={provinciasSelect}
                            onChange={e => handleOnChangeProvincias(e)}
                            id="ProvinciaUsu"
                            value={{
                                value: cliente.data?.ProvinciaUsu, 
                                label: cliente.data?.ProvinciaUsu
                            }}
                        />
                    </div>
                    <div>
                        <label className="form-label">Ciudad</label>
                        <Select 
                            // onFocus={handleOnFocusSelect}
                            options={localidadesSelect}
                            onChange={e => handleOnChangeLocalidades(e)}
                            id="CiudadUsu"
                            value={{
                                value: cliente.data?.CiudadUsu, 
                                label: cliente.data?.CiudadUsu
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="card mb-3">
                <div className="card-body">
                    <h5 className="card-title bluemcdron">DRONE</h5>
                    <div>
                        <label className="form-label">Modelo del Drone</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="DroneRep"
                            value={reparacion.data?.DroneRep || ""}
                        />
                    </div>
                    
                    <div>
                        <label className="form-label">Desperfectos o Roturas</label>
                        <TextareaAutosize
                            onChange={e => changeInputRep(e.target)} 
                            className="form-control" 
                            id="DescripcionUsuRep"
                            value={reparacion.data?.DescripcionUsuRep || ""}
                        />
                    </div>
                </div>
            </div>



            <div className="text-center">
                <button 
                    onClick={ handleGuardarPresupuesto }
                    className="w-100 mb-3 btn bg-bluemcdron text-white"
                >
                    Guardar
                </button>
            </div>

        </div>
 
    )
}

const mapStateToProps = (state) => ({
    usuario: state.app?.usuario,
    localidadesSelect: state.app?.localidadesSelect,
    provinciasSelect: state.app?.provinciasSelect,
    usuariosSelect: state.app?.usuariosSelect
  });


export default connect(
    mapStateToProps, 
    {
        setUsuario,
        getCliente,
        guardarPresupuesto, 
        abreModal,
        confirm,
        getProvinciasSelect,
        getUsuariosSelect,
        getLocalidadesPorProvincia,
    })(Presupuesto);