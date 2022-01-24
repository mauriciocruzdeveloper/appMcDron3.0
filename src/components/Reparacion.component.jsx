import { useEffect } from "react";
import { connect } from "react-redux";
import TextareaAutosize from "react-textarea-autosize";
import { 
    changeInputRep,
    getReparacion,
    setEstado,
    guardarReparacion,
    eliminarReparacion,
    abreModal,
    confirm
  } from "../redux/root-actions";

import { convertTimestampCORTO } from "../utils/utils";

import { useParams } from "react-router-dom";

import { estados } from '../datos/estados.json';

import history from "../history";

const Reparacion = ({ 
    changeInputRep, 
    getReparacion, 
    reparacion, 
    setEstado, 
    guardarReparacion,
    eliminarReparacion,
    abreModal,
    confirm
}) => {

    const { id } = useParams();

    useEffect(async () => {
        await getReparacion(id);
    }, [getReparacion]);

    let estadosArray = Object.values(estados);

    const handleGuardarReparacion = () => {
        confirm(
            "Guardar Reparación?",
            "Atención",
            "warning",
            () => {
                guardarReparacion(reparacion)
                .then(reparacion => abreModal("Guardado con éxito", "Reparación: " + reparacion.id, "success" ))
                .catch(error => abreModal("Error al guardar ", "Código - " + error.code, "danger" ));
            }
        );
    }

    const handleEliminarReparacion = () => {
        confirm(
            "Eliminar Reparación?",
            "Atención",
            "danger",
            () => {
                console.log("llega al callBakc de confirm") ;
                eliminarReparacion(reparacion)
                .then(reparacion => {
                        abreModal("Reparación eliminada con éxito", "Reparación: " + reparacion.id, "success" );
                        history.push(`/inicio/reparaciones`);
                })
                .catch(error => abreModal("Error al guardar ", "Código - " + error.code, "danger" ))
            }
        );
    }

    return(
        <div
            className="p-4"
            style={{
                backgroundColor: estados[reparacion?.data?.EstadoRep]?.color
            }}
        >
            <div className="card mb-3">
                <div className="card-body">
                <h5 className="card-title bluemcdron">ESTADO DE LA REPARACIÓN</h5>
                    <div className="text-center">
                        {estadosArray.map(estado =>
                            <button 
                                className="m-2 btn btn-outline-secondary overflow-hidden"
                                type="button"
                                alt={estado.nombre}
                                style={{
                                    backgroundColor: 
                                        estado.nombre == reparacion?.data?.EstadoRep?
                                        estado.color :
                                        "#CCCCCC"
                                    ,
                                    width: "90px",
                                    height: "30px"
                                }}
                                onClick={ ()=>setEstado(estado) }
                            >
                                {estado.nombre}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className="card mb-3">
                <div className="card-body">
                <h5 className="card-title bluemcdron">ENLACE A DRIVE</h5>
                    <div>
                        <label className="form-label">En lace a Drive</label>

                        <div class="input-group">
                            <input 
                                onChange={e => changeInputRep(e.target)} 
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
            </div>
            <div className="card mb-3">
                <div className="card-body">
                <h5 className="card-title bluemcdron">CONSULTA - PRIMEROS DATOS</h5>
                    <div>
                        <label className="form-label">Fecha de Cosulta</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="date" 
                            className="form-control" 
                            id="FeConRep"
                            value={convertTimestampCORTO(reparacion?.data?.FeConRep)}
                        />
                    </div>
                    <div>
                        <label className="form-label">Cliente</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="UsuarioRep" 
                            value={reparacion?.data?.UsuarioRep}
                        />
                    </div>
                    <div>
                        <label className="form-label">Modelo del Drone</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="DroneRep"
                            value={reparacion?.data?.DroneRep || ""}
                        />
                    </div>
                    <div>
                        <label className="form-label">Desperfectos o Roturas</label>
                        <TextareaAutosize
                            onChange={e => changeInputRep(e.target)} 
                            className="form-control" 
                            id="DescripcionUsuRep"
                            value={reparacion?.data?.DescripcionUsuRep || ""}
                        />
                    </div>
                </div>
            </div>
            <div className="card mb-3">
                <div className="card-body">
                <h5 className="card-title bluemcdron">RECEPCIÓN</h5>
                    <div>
                        <label className="form-label">Fecha de Recepción</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="date" 
                            className="form-control" 
                            id="FeRecRep"
                            value={convertTimestampCORTO(reparacion?.data?.FeRecRep)}
                        />
                    </div>
                </div>
            </div>
            <div className="card mb-3">
                <div className="card-body">
                <h5 className="card-title bluemcdron">REVISIÓN - DIAGNÓSTICO Y PRESUPUESTO DATOS</h5>
                    <div>
                        <label className="form-label">Número de Serie</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="NumeroSerieRep"
                            value={reparacion?.data?.NumeroSerieRep || ""}
                        />
                    </div>
                    <div>
                        <label className="form-label">Observaciones del Técnico</label>
                        <TextareaAutosize
                            onChange={e => changeInputRep(e.target)} 
                            className="form-control" 
                            id="DescripcionTecRep"
                            value={reparacion?.data?.DescripcionTecRep || ""}
                            rows="5"
                        />
                    </div>
                    <div>
                        <label className="form-label">Presupuesto Mano de Obra $</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="number" 
                            className="form-control" 
                            id="PresuMoRep" 
                            value={reparacion?.data?.PresuMoRep || ""}
                        />
                    </div>
                    <div>
                        <label className="form-label">Presupuesto Repuestos $</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="number" 
                            className="form-control" 
                            id="PresuReRep"
                            value={reparacion?.data?.PresuReRep || ""}
                        />
                    </div>
                    <div>
                        <label className="form-label">Presupuesto Final $</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="number" 
                            className="form-control" 
                            id="PresuFiRep"
                            value={reparacion?.data?.PresuFiRep || ""}
                        />
                    </div>
                    <div>
                        <label className="form-label">Diagnóstico $</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="number" 
                            className="form-control" 
                            id="PresuDiRep"
                            value={reparacion?.data?.PresuDiRep || ""}
                        />
                    </div>
                </div>
            </div>
            <div className="card mb-3">
                <div className="card-body">
                <h5 className="card-title bluemcdron">REPUESTOS - CUALES Y SEGUIMIENTO</h5>
                    <div>
                        <label className="form-label">Qué repuesto, seguimiento, transportista</label>
                        <TextareaAutosize
                            onChange={e => changeInputRep(e.target)} 
                            className="form-control" 
                            id="TxtRepuestosRep"
                            value={reparacion?.data?.TxtRepuestosRep || ""} //Esto es lo correcto
                            rows="5"
                        />
                    </div>
                </div>
            </div>
            <div className="card mb-3">
                <div className="card-body">
                <h5 className="card-title bluemcdron">REPARACIÓN - DATOS DE LA REPARACIÓN</h5>
                    <div>
                        <label className="form-label">Informe de Reparación o Diagnóstico</label>
                        <TextareaAutosize
                            onChange={e => changeInputRep(e.target)} 
                            className="form-control" 
                            id="InformeRep"
                            value={reparacion?.data?.InformeRep || ""}
                            rows="5"
                        />
                    </div>
                    <div>
                        <label className="form-label">Fecha Finalizacion</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="date" 
                            className="form-control" 
                            id="FeFinRep"
                            value={convertTimestampCORTO(reparacion?.data?.FeFinRep)}
                        />
                    </div>
                </div>
            </div>
            <div className="card mb-3">
                <div className="card-body">
                <h5 className="card-title bluemcdron">ENTREGA - DATOS DE LA ENTREGA</h5>
                    <div>
                        <label className="form-label">Fecha Entrega</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="date" 
                            className="form-control" 
                            id="FeEntRep"
                            value={convertTimestampCORTO(reparacion?.data?.FeEntRep)}
                        />
                    </div>
                    <div>
                        <label className="form-label">Cliente, Comisionista, Correo, Seguimiento</label>
                        <TextareaAutosize
                            onChange={e => changeInputRep(e.target)} 
                            className="form-control" 
                            id="TxtEntregaRep"
                            value={reparacion?.data?.TxtEntregaRep || ""}
                            rows="5"
                        />
                    </div>
                    <div>
                        <label className="form-label">Nro. de Seguimiento</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="SeguimientoEntregaRep"
                            value={reparacion?.data?.SeguimientoEntrega || ""}
                            rows="5"
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
  });


export default connect(
    mapStateToProps, 
    { 
        changeInputRep, 
        getReparacion, 
        setEstado, 
        guardarReparacion, 
        eliminarReparacion, 
        abreModal,
        confirm
    })(Reparacion);