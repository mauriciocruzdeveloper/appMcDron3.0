import { useEffect } from "react";
import { connect } from "react-redux";
import TextareaAutosize from "react-textarea-autosize";
import { 
    changeInputPresu,
    setEstado,
    guardarPresupuesto,
    abreModal,
    loadUsuToPresu
  } from "../redux/root-actions";

import { convertTimestampCORTO } from "../utils/utils";

import { useParams } from "react-router-dom"

import history from "../history";

const Presupuesto = ({ 
    changeInputPresu, 
    presupuesto,
    usuario,
    guardarPresupuesto,
    abreModal,
    loadUsuToPresu
}) => {


    console.log("admin: " + usuario.data?.Admin);

    // ACÁ TENGO QUE CARGAR LOS DATOS DEL USUARIO QUE HACE EL PRESUPUESTO
    useEffect(async () => {
        // Si el usuario es admin, deja todo en blanco para cargar cualquier usuario
        // sino cargo los datos del usuario logueado.
        usuario.data?.Admin ? null : await loadUsuToPresu(usuario);
    }, [loadUsuToPresu]);




    const handleGuardarPresupuesto = async () => {
        await guardarPresupuesto(presupuesto)
        .then(() => abreModal("Guardado con éxito", "", "success" ))
        //.catch(error => abreModal("Error al guardar ", "Código - " + error.code, "danger" ));
    }


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
                    {/* <div>
                        <label className="form-label">E-mail</label>
                        <input 
                            onChange={e => changeInputPresu(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="UsuarioPresu" 
                            value={presupuesto?.UsuarioPresu || ""}
                        />
                    </div> */}
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
                        <input 
                            onChange={e => changeInputPresu(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="ProvinciaPresu"
                            value={presupuesto?.ProvinciaPresu || ""}
                        />
                    </div>
                    <div>
                        <label className="form-label">Ciudad</label>
                        <input 
                            onChange={e => changeInputPresu(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="CiudadPresu"
                            value={presupuesto?.CiudadPresu || ""}
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
  });


export default connect(
    mapStateToProps, 
    { 
        changeInputPresu, 
        setEstado, 
        guardarPresupuesto, 
        abreModal,
        loadUsuToPresu
    })(Presupuesto);