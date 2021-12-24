import React, { useEffect } from "react";
import { connect } from "react-redux";
import history from "../history";
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

    console.log("REPARACION: " + JSON.stringify(reparacion));

    let estadosArray = Object.values(estados);

    return(
        <div>
            <div className="card card-personalizado">
                <div className="card-body">
                <h5 className="card-title">ESTADO DE LA REPARACIÓN</h5>
                    <div>
                        {
                            estadosArray.map(estado =>
                                <button 
                                    style={{
                                        backgroundColor: 
                                            estado.nombre == reparacion?.data?.EstadoRep?
                                            estado.color :
                                            "#CCCCCC"
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
                <h5 className="card-title">ENLACE A DRIVE</h5>
                    <div>
                        <label className="form-label">En lace a Drive</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="driveRep"
                            value={reparacion?.data?.DriveRep}
                        />
                    </div>
                </div>
            </div>
            <div className="card card-personalizado">
                <div className="card-body">
                <h5 className="card-title">CONSULTA - PRIMEROS DATOS</h5>
                    <div>
                        <label className="form-label">Fecha de Cosulta</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="date" 
                            className="form-control" 
                            id="feConRep"
                            value={convertTimestampCORTO(reparacion?.data?.FeConRep)}
                        />
                    </div>
                    <div>
                        <label className="form-label">Cliente</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="usuarioRep" 
                            value={reparacion?.data?.UsuarioRep}
                        />
                    </div>
                    <div>
                        <label className="form-label">Modelo del Drone</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="droneRep"
                            value={reparacion?.data?.DroneRep}
                        />
                    </div>
                    <div>
                        <label className="form-label">Desperfectos o Roturas</label>
                        <textarea 
                            onChange={e => changeInputRep(e.target)} 
                            className="form-control" 
                            id="descripcionUsuRep"
                            value={reparacion?.data?.DescripcionUsuRep}
                        >
                        </textarea>
                    </div>
                </div>
            </div>
            <div className="card card-personalizado">
                <div className="card-body">
                <h5 className="card-title">RECEPCIÓN</h5>
                    <div>
                        <label className="form-label">Fecha de Recepción</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="date" 
                            className="form-control" 
                            id="feRecRep"
                            value={convertTimestampCORTO(reparacion?.data?.FeRecRep)}
                        />
                    </div>
                </div>
            </div>
            <div className="card card-personalizado">
                <div className="card-body">
                <h5 className="card-title">REVISIÓN - DIAGNÓSTICO Y PRESUPUESTO DATOS</h5>
                    <div>
                        <label className="form-label">Número de Serie</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="numeroSerieRep"
                            value={reparacion?.data?.NumeroSerieRep}
                        />
                    </div>
                    <div>
                        <label className="form-label">Observaciones del Técnico</label>
                        <textarea 
                            onChange={e => changeInputRep(e.target)} 
                            className="form-control" 
                            id="descripcionTecRep"
                            value={reparacion?.data?.DescripcionTecRep}
                        ></textarea>
                    </div>
                    <div>
                        <label className="form-label">Presupuesto Mano de Obra $</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="number" 
                            className="form-control" 
                            id="presuMoRep" 
                            value={reparacion?.data?.PresuMoRep}
                        />
                    </div>
                    <div>
                        <label className="form-label">Presupuesto Repuestos $</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="number" 
                            className="form-control" 
                            id="presuReRep"
                            value={reparacion?.data?.PresuReRep}
                        />
                    </div>
                    <div>
                        <label className="form-label">Presupuesto Final $</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="number" 
                            className="form-control" 
                            id="presuFiRep"
                            value={reparacion?.data?.PresuFiRep}
                        />
                    </div>
                    <div>
                        <label className="form-label">Diagnóstico $</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="number" 
                            className="form-control" 
                            id="presuDiRep"
                            value={reparacion?.data?.PresuDiRep}
                        />
                    </div>
                </div>
            </div>
            <div className="card card-personalizado">
                <div className="card-body">
                <h5 className="card-title">REPUESTOS - CUALES Y SEGUIMIENTO</h5>
                    <div>
                        <label className="form-label">Qué repuesto, seguimiento, transportista</label>
                        <textarea 
                            onChange={e => changeInputRep(e.target)} 
                            className="form-control" 
                            id="txtRepuestosRep"
                            value={reparacion?.data?.TxtRepuestosRep}
                        ></textarea>
                    </div>
                </div>
            </div>
            <div className="card card-personalizado">
                <div className="card-body">
                <h5 className="card-title">REPARACIÓN - DATOS DE LA REPARACIÓN</h5>
                    <div>
                        <label className="form-label">Informe de Reparación o Diagnóstico</label>
                        <textarea 
                            onChange={e => changeInputRep(e.target)} 
                            className="form-control" 
                            id="informeRep"
                            value={reparacion?.data?.InformeRep}
                        ></textarea>
                    </div>
                    <div>
                        <label className="form-label">Fecha Finalizacion</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="date" 
                            className="form-control" 
                            id="feFinRep"
                            value={convertTimestampCORTO(reparacion?.data?.FeFinRep)}
                        />
                    </div>
                </div>
            </div>
            <div className="card card-personalizado">
                <div className="card-body">
                <h5 className="card-title">ENTREGA - DATOS DE LA ENTREGA</h5>
                    <div>
                        <label className="form-label">Fecha Entrega</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="date" 
                            className="form-control" 
                            id="feEntRep"
                            value={convertTimestampCORTO(reparacion?.data?.FeEntRep)}
                        />
                    </div>
                    <div>
                        <label className="form-label">Cliente, Comisionista, Correo, Seguimiento</label>
                        <textarea 
                            onChange={e => changeInputRep(e.target)} 
                            className="form-control" 
                            id="txtEntregaRep"
                            value={reparacion?.data?.TxtEntregaRep}
                        ></textarea>
                    </div>
                    <div>
                        <label className="form-label">Nro. de Seguimiento</label>
                        <input 
                            onChange={e => changeInputRep(e.target)} 
                            type="text" 
                            className="form-control" 
                            id="seguimientoEntregaRep"
                            value={reparacion?.data?.SeguimientoEntrega}
                        />
                    </div>
                </div>
            </div>

           
            <button 
                onClick={ () => guardarReparacion(reparacion) }
                className="w-100 btn btn-lg btn-primary bg-bluemcdron"
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