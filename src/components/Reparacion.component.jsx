import React, { useEffect } from "react";
import { connect } from "react-redux";
import TextareaAutosize from "react-textarea-autosize";
import { 
    changeInputRep,
    getReparacion,
    setEstado,
    guardarReparacion
  } from "../redux/root-actions";

import { convertTimestampCORTO } from "../utils/utils";

import { useParams } from "react-router-dom";

import { estados } from '../datos/estados.json';

const Reparacion = ({ changeInputRep, getReparacion, reparacion, setEstado, guardarReparacion }) => {

    const { id } = useParams();

    useEffect(async () => {
        await getReparacion(id);
    }, [getReparacion]);

    // console.log("REPARACION: " + JSON.stringify(reparacion));

    let estadosArray = Object.values(estados);

    return(
        <div
            style={{
                backgroundColor: estados[reparacion?.data?.EstadoRep]?.color
                // ,opacity: "0.5"
            }}
        >
            <div className="card card-personalizado">
                <div className="card-body">
                <h5 className="card-title bluemcdron">ESTADO DE LA REPARACIÓN</h5>
                    <div className="text-center">
                        {
                            estadosArray.map(estado =>
                                <button 
                                    className="m-2 overflow-hidden"
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
                                    onClick={ ()=>setEstado(estado.nombre) }
                                >
                                    {estado.nombre}
                                </button>
                            )

                        }

                        {/* <label className="form-label">Estado</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            id="estadoRep"
                            value={reparacion?.data?.EstadoRep}
                            onChange={e => changeInputRep(e.target)}
                        /> */}
                    </div>
                </div>
            </div>
            <div className="card card-personalizado">
                <div className="card-body">
                <h5 className="card-title bluemcdron">ENLACE A DRIVE</h5>
                    <div>
                        <label className="form-label">En lace a Drive</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="DriveRep"
                            value={reparacion?.data?.DriveRep}
                        />
                    </div>
                </div>
            </div>
            <div className="card card-personalizado">
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
                            value={reparacion?.data?.DroneRep}
                        />
                    </div>
                    <div>
                        <label className="form-label">Desperfectos o Roturas</label>
                        <TextareaAutosize
                            onChange={e => changeInputRep(e.target)} 
                            className="form-control" 
                            id="DescripcionUsuRep"
                            value={reparacion?.data?.DescripcionUsuRep}
                        />
                    </div>
                </div>
            </div>
            <div className="card card-personalizado">
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
            <div className="card card-personalizado">
                <div className="card-body">
                <h5 className="card-title bluemcdron">REVISIÓN - DIAGNÓSTICO Y PRESUPUESTO DATOS</h5>
                    <div>
                        <label className="form-label">Número de Serie</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="NumeroSerieRep"
                            value={reparacion?.data?.NumeroSerieRep}
                        />
                    </div>
                    <div>
                        <label className="form-label">Observaciones del Técnico</label>
                        <TextareaAutosize
                            onChange={e => changeInputRep(e.target)} 
                            className="form-control" 
                            id="DescripcionTecRep"
                            value={reparacion?.data?.DescripcionTecRep}
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
                            value={reparacion?.data?.PresuMoRep}
                        />
                    </div>
                    <div>
                        <label className="form-label">Presupuesto Repuestos $</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="number" 
                            className="form-control" 
                            id="PresuReRep"
                            value={reparacion?.data?.PresuReRep}
                        />
                    </div>
                    <div>
                        <label className="form-label">Presupuesto Final $</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="number" 
                            className="form-control" 
                            id="PresuFiRep"
                            value={reparacion?.data?.PresuFiRep}
                        />
                    </div>
                    <div>
                        <label className="form-label">Diagnóstico $</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="number" 
                            className="form-control" 
                            id="PresuDiRep"
                            value={reparacion?.data?.PresuDiRep}
                        />
                    </div>
                </div>
            </div>
            <div className="card card-personalizado">
                <div className="card-body">
                <h5 className="card-title bluemcdron">REPUESTOS - CUALES Y SEGUIMIENTO</h5>
                    <div>
                        <label className="form-label">Qué repuesto, seguimiento, transportista</label>
                        <TextareaAutosize
                            onChange={e => changeInputRep(e.target)} 
                            className="form-control" 
                            id="TxtRepuestosRep"
                            value={reparacion?.data?.TxtRepuestosRep}
                            rows="5"
                        />
                    </div>
                </div>
            </div>
            <div className="card card-personalizado">
                <div className="card-body">
                <h5 className="card-title bluemcdron">REPARACIÓN - DATOS DE LA REPARACIÓN</h5>
                    <div>
                        <label className="form-label">Informe de Reparación o Diagnóstico</label>
                        <TextareaAutosize
                            onChange={e => changeInputRep(e.target)} 
                            className="form-control" 
                            id="InformeRep"
                            value={reparacion?.data?.InformeRep}
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
            <div className="card card-personalizado">
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
                            value={reparacion?.data?.TxtEntregaRep}
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
                            value={reparacion?.data?.SeguimientoEntrega}
                            rows="5"
                        />
                    </div>
                </div>
            </div>

           
            <button 
                onClick={ () => guardarReparacion(reparacion) }
                className="w-100 btn btn-lg btn-primary bluemcdron text-white"
            >
                Guardar
            </button>

        </div>
    )
}

const mapStateToProps = (state) => ({
    reparacion: state.app?.reparacion
  });


export default connect(mapStateToProps, { changeInputRep, getReparacion, setEstado, guardarReparacion })(Reparacion);