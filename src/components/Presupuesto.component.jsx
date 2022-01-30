import { useEffect } from "react";
import { connect } from "react-redux";
import TextareaAutosize from "react-textarea-autosize";
import Select from 'react-select';
import { 
    changeInputPresu,
    setEstado,
    guardarPresupuesto,
    abreModal,
    confirm,
    loadUsuToPresu,
    getProvinciasSelect,
    getLocalidadesPorProvincia
  } from "../redux/root-actions";

// import { provincias } from '../datos/provincias.json'; 

const Presupuesto = ({ 
    changeInputPresu, 
    presupuesto,
    usuario,
    guardarPresupuesto,
    abreModal,
    confirm,
    loadUsuToPresu,
    getProvinciasSelect,
    getLocalidadesPorProvincia,
    localidades,
    provincias
}) => {

    console.log("PRESUPUESTO");

    console.log("provincias: " + JSON.stringify(provincias));
    console.log("localidades: " + JSON.stringify(localidades));

    // ACÁ TENGO QUE CARGAR LOS DATOS DEL USUARIO QUE HACE EL PRESUPUESTO
    useEffect(async () => {
        // Si el usuario es admin, deja todo en blanco para cargar cualquier usuario
        // sino cargo los datos del usuario logueado.
        usuario.data?.Admin ? null : await loadUsuToPresu(usuario);
        await getProvinciasSelect();
    }, [loadUsuToPresu]);

    const handleGuardarPresupuesto = () => {
        confirm(
            "Guardar Reparación?",
            "Atención",
            "warning",
            () => {
                guardarPresupuesto(presupuesto)
                .then(reparacion => abreModal("Presupuesto enviado!", "", "success" ))
                .catch(error => abreModal("Error al guardar ", "Código - " + error.code, "danger" ));
            }
        );
    }

    // const handleOnFocusSelect = async () =>{
    //     console.log("handleOnFocusSelect");
    //     !!!provincias ? await getProvinciasSelect() : null;
    // }

    // console.log("provincias ANTES: " + JSON.stringify(provincias));

    // const provinciasSelect = provincias.map(provincia => {
    //     return {
    //         value: provincia.provincia,
    //         label: provincia.provincia
    //     }
    // });

    // console.log("provincias DESPUÉS: " + JSON.stringify(provinciasSelect));

    // console.log("localidades ANTES: " + JSON.stringify(localidades));    

    // let localidadesSelect = [];

    const handleOnChangeProvincias = (e) => {
        console.log("e.target.value: " + JSON.stringify(e));
        getLocalidadesPorProvincia(e.value);
        // localidadesSelect = localidades.filter(localidad => (
        //     localidad.provincia.nombre == e.value
        // ))
        // .map(localidad => {
        //     return {
        //         value: localidad.nombre,
        //         label: localidad.nombre
        //     }
        // });
    }

    // console.log("localidades DESPUÉS: " + JSON.stringify(localidadesSelect));

  


    return(
        <div
            className="p-4"
            style={{
                backgroundColor: "#EEEEEE",
                height: "100vh",
              }}
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
                        <input 
                            onChange={e => changeInputPresu(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="UsuarioPresu" 
                            value={presupuesto?.UsuarioPresu || ""}
                        />
                    </div>
                    <div>
                        <label className="form-label">Nombre</label>
                        <input 
                            onChange={e => changeInputPresu(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="NombrePresu" 
                            value={presupuesto?.NombrePresu || ""}
                        />
                    </div>
                    <div>
                        <label className="form-label">Apellido</label>
                        <input 
                            onChange={e => changeInputPresu(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="ApellidoPresu" 
                            value={presupuesto?.ApellidoPresu || ""}
                        />
                    </div>
                    <div>
                        <label className="form-label">Teléfono</label>
                        <input 
                            onChange={e => changeInputPresu(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="TelefonoPresu"
                            value={presupuesto?.TelefonoPresu || ""}
                        />
                    </div>
                    <div>
                        <label className="form-label">Provincia</label>
                        <Select 
                            // onFocus={handleOnFocusSelect}
                            options={provincias}
                            onChange={e => handleOnChangeProvincias(e)}
                            id="ProvinciaPresu"
                            // value={presupuesto?.ProvinciaPresu || ""}
                        />
                        
                        {/* <input 
                            onChange={e => changeInputPresu(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="ProvinciaPresu"
                            value={presupuesto?.ProvinciaPresu || ""}
                        /> */}
                    </div>
                    <div>
                        <label className="form-label">Ciudad</label>

                        <Select 
                            // onFocus={handleOnFocusSelect}
                            options={localidades}
                            // onChange={e => handleOnSelect(e)}
                            id="CiudadPresu"
                            // value={presupuesto?.CiudadPresu || ""}
                        />
                        {/* <input 
                            onChange={e => changeInputPresu(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="CiudadPresu"
                            value={presupuesto?.CiudadPresu || ""}
                        /> */}
                    </div>
                </div>
            </div>

            <div className="card mb-3">
                <div className="card-body">
                    <h5 className="card-title bluemcdron">DRONE</h5>
                    <div>
                        <label className="form-label">Modelo del Drone</label>
                        <input 
                            onChange={e => changeInputPresu(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="DronePresu"
                            value={presupuesto?.DronePresu || ""}
                        />
                    </div>
                    
                    <div>
                        <label className="form-label">Desperfectos o Roturas</label>
                        <TextareaAutosize
                            onChange={e => changeInputPresu(e.target)} 
                            className="form-control" 
                            id="DescripcionPresu"
                            value={presupuesto?.DescripcionPresu || ""}
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
    presupuesto: state.app?.presupuesto,
    usuario: state.app?.usuario,
    localidades: state.app?.localidades,
    provincias: state.app?.provincias
  });


export default connect(
    mapStateToProps, 
    { 
        changeInputPresu, 
        setEstado, 
        guardarPresupuesto, 
        abreModal,
        loadUsuToPresu,
        confirm,
        getProvinciasSelect,
        getLocalidadesPorProvincia
    })(Presupuesto);