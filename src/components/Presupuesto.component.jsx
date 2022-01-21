import { useEffect } from "react";
import { connect } from "react-redux";
import TextareaAutosize from "react-textarea-autosize";
import { 
    changeInputPresu,
    getReparacion,
    setEstado,
    guardarReparacion,
    eliminarReparacion,
    abreModal
  } from "../redux/root-actions";

import { convertTimestampCORTO } from "../utils/utils";

import { useParams } from "react-router-dom";

import { estados } from '../datos/estados.json';

import history from "../history";

const Reparacion = ({ 
    changeInputPresu, 
    getReparacion, 
    reparacion, 
    setEstado, 
    guardarReparacion,
    eliminarReparacion,
    abreModal,
    isFetching,
    match
}) => {

    // ACÁ TENGO QUE CARGAR LOS DATOS DEL USUARIO QUE HACE EL PRESUPUESTO
    useEffect(async () => {
        await cargaUsuario();
    }, [cargaUsuario]);


    // const handleGuardarReparacion = async () => {
    //     await guardarReparacion(reparacion)
    //     .then(reparacion => abreModal("Guardado con éxito", "Reparación: " + reparacion.id, "success" ))
    //     .catch(error => abreModal("Error al guardar ", "Código - " + error.code, "danger" ));
    // }


    return(
        isFetching ? <h1>Cargando: { isFetching }</h1> :
        <div
            className="p-4"
            style={{
                backgroundColor: "#EEEEEE",
                height: "100vh",
              }}
        >
            
            {/* <div className="card mb-3">
                <div className="card-body">
                <h5 className="card-title bluemcdron">ENLACE A DRIVE</h5>
                    <div>
                        <label className="form-label">En lace a Drive</label>

                        <div class="input-group">
                            <input 
                                onChange={e => changeInputPresu(e.target)} 
                                type="text"
                                className="form-control" 
                                id="DriveRep"
                                value={reparacion?.data?.DriveRep} 
                            />
                            <div class="input-group-append">
                                <a href={reparacion?.data?.DriveRep}><button class="btn btn-outline-secondary bg-bluemcdron text-white" type="button">Ir</button></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div> */}
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
                            value={presupuesto?.data?.UsuarioPresu || ""}
                        />
                    </div>
                    <div>
                        <label className="form-label">Nombre</label>
                        <input 
                            onChange={e => changeInputPresu(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="NombrePresu" 
                            value={presupuesto?.data?.NombrePresu || ""}
                        />
                    </div>
                    <div>
                        <label className="form-label">Apellido</label>
                        <input 
                            onChange={e => changeInputPresu(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="ApellidoPresu" 
                            value={presupuesto?.data?.ApellidoPresu || ""}
                        />
                    </div>
                    <div>
                        <label className="form-label">Teléfono</label>
                        <input 
                            onChange={e => changeInputPresu(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="TelefonoPresu"
                            value={reparacion?.data?.TelefonoPresu || ""}
                        />
                    </div>
                    <div>
                        <label className="form-label">Provincia</label>
                        <input 
                            onChange={e => changeInputPresu(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="ProvinciaPresu"
                            value={reparacion?.data?.ProvinciaPresu || ""}
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
                            value={reparacion?.data?.DronePresu || ""}
                        />
                    </div>
                    
                    <div>
                        <label className="form-label">Desperfectos o Roturas</label>
                        <TextareaAutosize
                            onChange={e => changeInputPresu(e.target)} 
                            className="form-control" 
                            id="DescripcionPresu"
                            value={reparacion?.data?.DescripcionUsuRep || ""}
                        />
                    </div>
                </div>
            </div>



            <div className="text-center">
                <button 
                    onClick={ handleGuardarReparacion }
                    className="w-100 mb-3 btn bg-bluemcdron text-white"
                >
                    Guardar
                </button>
                <button 
                    onClick={ handleEliminarReparacion }
                    className="w-100 btn bg-danger text-white"
                >
                    Eliminar
                </button>
            </div>

        </div>
 
    )
}

const mapStateToProps = (state) => ({
    reparacion: state.app?.reparacion,
    isFetching: state.app.isFetching
  });


export default connect(mapStateToProps, { changeInputPresu, getReparacion, setEstado, guardarReparacion, eliminarReparacion, abreModal })(Reparacion);