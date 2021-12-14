import React from "react";
import { connect } from "react-redux";
import history from "../history";
import { 
    changeInputRep
  } from "../redux/root-actions";

import { useParams } from "react-router-dom";

const Reparacion = ({ changeInputRep }) => {

    const { id } = useParams();

    console.log("llega a reparación: " + id); 

    return(
        <div>
            <div className="card card-personalizado">
                <div className="card-body">
                <h5 className="card-title">ESTADO DE LA REPARACIÓN</h5>
                    <div>
                        <label className="form-label">Estado</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            id="estadoRep" 
                            onChange={e => changeInputRep(e.target)}
                        />
                    </div>
                </div>
            </div>
            <div className="card card-personalizado">
                <div className="card-body">
                <h5 className="card-title">ENLACE A DRIVE</h5>
                    <div>
                        <label className="form-label">En lace a Drive</label>
                        <input onChange={e => changeInputRep(e.target)} type="text" className="form-control" id="driveRep" />
                    </div>
                </div>
            </div>
            <div className="card card-personalizado">
                <div className="card-body">
                <h5 className="card-title">CONSULTA - PRIMEROS DATOS</h5>
                    <div>
                        <label className="form-label">Fecha de Cosulta</label>
                        <input onChange={e => changeInputRep(e.target)} type="date" className="form-control" id="feConRep" />
                    </div>
                    <div>
                        <label className="form-label">Cliente</label>
                        <input onChange={e => changeInputRep(e.target)} type="text" className="form-control" id="usuarioRep" />
                    </div>
                    <div>
                        <label className="form-label">Modelo del Drone</label>
                        <input onChange={e => changeInputRep(e.target)} type="text" className="form-control" id="droneRep" />
                    </div>
                    <div>
                        <label className="form-label">Desperfectos o Roturas</label>
                        <textarea onChange={e => changeInputRep(e.target)} className="form-control" id="descripcionUsuRep"></textarea>
                    </div>
                </div>
            </div>
            <div className="card card-personalizado">
                <div className="card-body">
                <h5 className="card-title">CONSULTA - PRIMEROS DATOS</h5>
                    <div>
                        <label className="form-label">Fecha de Recepción</label>
                        <input onChange={e => changeInputRep(e.target)} type="date" className="form-control" id="feRecRep" />
                    </div>
                </div>
            </div>
            <div className="card card-personalizado">
                <div className="card-body">
                <h5 className="card-title">REVISIÓN - DIAGNÓSTICO Y PRESUPUESTO DATOS</h5>
                    <div>
                        <label className="form-label">Número de Serie</label>
                        <input onChange={e => changeInputRep(e.target)} type="text" className="form-control" id="numeroSerieRep" />
                    </div>
                    <div>
                        <label className="form-label">Observaciones del Técnico</label>
                        <textarea onChange={e => changeInputRep(e.target)} className="form-control" id="descripcionTecRep"></textarea>
                    </div>
                    <div>
                        <label className="form-label">Presupuesto Mano de Obra $</label>
                        <input onChange={e => changeInputRep(e.target)} type="number" className="form-control" id="presuMoRep" />
                    </div>
                    <div>
                        <label className="form-label">Presupuesto Repuestos $</label>
                        <input onChange={e => changeInputRep(e.target)} type="number" className="form-control" id="presuReRep" />
                    </div>
                    <div>
                        <label className="form-label">Presupuesto Final $</label>
                        <input onChange={e => changeInputRep(e.target)} type="number" className="form-control" id="presuFiRep" />
                    </div>
                    <div>
                        <label className="form-label">Diagnóstico $</label>
                        <input onChange={e => changeInputRep(e.target)} type="number" className="form-control" id="presuDiRep" />
                    </div>
                </div>
            </div>
            <div className="card card-personalizado">
                <div className="card-body">
                <h5 className="card-title">REPUESTOS - CUALES Y SEGUIMIENTO</h5>
                    <div>
                        <label className="form-label">Qué repuesto, seguimiento, transportista</label>
                        <textarea onChange={e => changeInputRep(e.target)} className="form-control" id="txtRepuestosRep"></textarea>
                    </div>
                </div>
            </div>
            <div className="card card-personalizado">
                <div className="card-body">
                <h5 className="card-title">REPARACIÓN - DATOS DE LA REPARACIÓN</h5>
                    <div>
                        <label className="form-label">Informe de Reparación o Diagnóstico</label>
                        <textarea onChange={e => changeInputRep(e.target)} className="form-control" id="informeRep"></textarea>
                    </div>
                    <div>
                        <label className="form-label">Fecha Finalizacion</label>
                        <input onChange={e => changeInputRep(e.target)} type="date" className="form-control" id="feFinRep" />
                    </div>
                </div>
            </div>
            <div className="card card-personalizado">
                <div className="card-body">
                <h5 className="card-title">ENTREGA - DATOS DE LA ENTREGA</h5>
                    <div>
                        <label className="form-label">Fecha Entrega</label>
                        <input onChange={e => changeInputRep(e.target)} type="date" className="form-control" id="feEntRep" />
                    </div>
                    <div>
                        <label className="form-label">Cliente, Comisionista, Correo, Seguimiento</label>
                        <textarea onChange={e => changeInputRep(e.target)} className="form-control" id="txtEntregaRep"></textarea>
                    </div>
                    <div>
                        <label className="form-label">Nro. de Seguimiento</label>
                        <input onChange={e => changeInputRep(e.target)} type="text" className="form-control" id="seguimientoEntregaRep" />
                    </div>
                </div>
            </div>

           
            <button className="btn btn-primary">Submit</button>
        </div>
    )
}



export default connect(null, { changeInputRep })(Reparacion);