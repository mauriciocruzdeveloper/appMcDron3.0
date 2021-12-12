import React from "react";
import { connect } from "react-redux";
import history from "../history";
import { 
    changeInputRep
  } from "../redux/root-actions";

const Reparacion = (changeInputRep) => {

    return(
        <form>
            <div class="card" style="width: 18rem;">
                <div class="card-body">
                <h5 class="card-title">ESTADO DE LA REPARACIÓN</h5>
                    <div class="form-floating mb-3">
                        <label for="estadoRep" class="form-label">Estado</label>
                        <input 
                            type="text" 
                            class="form-control" 
                            id="estadoRep" 
                            onChange={e => changeInputRep(e.target)}
                        />
                    </div>
                </div>
            </div>
            <div class="card" style="width: 18rem;">
                <div class="card-body">
                <h5 class="card-title">ENLACE A DRIVE</h5>
                    <div class="form-floating mb-3">
                        <label for="driveRep" class="form-label">En lace a Drive</label>
                        <input onChange={e => changeInputRep(e.target)} type="text" class="form-control" id="driveRep" />
                    </div>
                </div>
            </div>
            <div class="card" style="width: 18rem;">
                <div class="card-body">
                <h5 class="card-title">CONSULTA - PRIMEROS DATOS</h5>
                    <div class="form-floating mb-3">
                        <label for="feConRep" class="form-label">Fecha de Cosulta</label>
                        <input onChange={e => changeInputRep(e.target)} type="date" class="form-control" id="feConRep" />
                    </div>
                    <div class="form-floating mb-3">
                        <label for="usuarioRep" class="form-label">Cliente</label>
                        <input onChange={e => changeInputRep(e.target)} type="text" class="form-control" id="usuarioRep" />
                    </div>
                    <div class="form-floating mb-3">
                        <label for="droneRep" class="form-label">Modelo del Drone</label>
                        <input onChange={e => changeInputRep(e.target)} type="text" class="form-control" id="droneRep" />
                    </div>
                    <div class="form-floating mb-3">
                        <label for="descripcionUsuRep" class="form-label">Desperfectos o Roturas</label>
                        <textarea onChange={e => changeInputRep(e.target)} class="form-control" id="descripcionUsuRep"></textarea>
                    </div>
                </div>
            </div>
            <div class="card" style="width: 18rem;">
                <div class="card-body">
                <h5 class="card-title">CONSULTA - PRIMEROS DATOS</h5>
                    <div class="form-floating mb-3">
                        <label for="feRecRep" class="form-label">Fecha de Recepción</label>
                        <input onChange={e => changeInputRep(e.target)} type="date" class="form-control" id="feRecRep" />
                    </div>
                </div>
            </div>
            <div class="card" style="width: 18rem;">
                <div class="card-body">
                <h5 class="card-title">REVISIÓN - DIAGNÓSTICO Y PRESUPUESTO DATOS</h5>
                    <div class="form-floating mb-3">
                        <label for="numeroSerieRep" class="form-label">Número de Serie</label>
                        <input onChange={e => changeInputRep(e.target)} type="text" class="form-control" id="numeroSerieRep" />
                    </div>
                    <div class="form-floating mb-3">
                        <label for="descripcionTecRep" class="form-label">Observaciones del Técnico</label>
                        <textarea onChange={e => changeInputRep(e.target)} class="form-control" id="descripcionTecRep"></textarea>
                    </div>
                    <div class="form-floating mb-3">
                        <label for="presuMoRep" class="form-label">Presupuesto Mano de Obra $</label>
                        <input onChange={e => changeInputRep(e.target)} type="number" class="form-control" id="presuMoRep" />
                    </div>
                    <div class="form-floating mb-3">
                        <label for="presuReRep" class="form-label">Presupuesto Repuestos $</label>
                        <input onChange={e => changeInputRep(e.target)} type="number" class="form-control" id="presuReRep" />
                    </div>
                    <div class="form-floating mb-3">
                        <label for="presuFiRep" class="form-label">Presupuesto Final $</label>
                        <input onChange={e => changeInputRep(e.target)} type="number" class="form-control" id="presuFiRep" />
                    </div>
                    <div class="form-floating mb-3">
                        <label for="presuDiRep" class="form-label">Diagnóstico $</label>
                        <input onChange={e => changeInputRep(e.target)} type="number" class="form-control" id="presuDiRep" />
                    </div>
                </div>
            </div>
            <div class="card" style="width: 18rem;">
                <div class="card-body">
                <h5 class="card-title">REPUESTOS - CUALES Y SEGUIMIENTO</h5>
                    <div class="form-floating mb-3">
                        <label for="txtRepuestosRep" class="form-label">Qué repuesto, seguimiento, transportista</label>
                        <textarea onChange={e => changeInputRep(e.target)} class="form-control" id="txtRepuestosRep"></textarea>
                    </div>
                </div>
            </div>
            <div class="card" style="width: 18rem;">
                <div class="card-body">
                <h5 class="card-title">REPARACIÓN - DATOS DE LA REPARACIÓN</h5>
                    <div class="form-floating mb-3">
                        <label for="informeRep" class="form-label">Informe de Reparación o Diagnóstico</label>
                        <textarea onChange={e => changeInputRep(e.target)} class="form-control" id="informeRep"></textarea>
                    </div>
                    <div class="form-floating mb-3">
                        <label for="feFinRep" class="form-label">Fecha Finalizacion</label>
                        <input onChange={e => changeInputRep(e.target)} type="date" class="form-control" id="feFinRep" />
                    </div>
                </div>
            </div>
            <div class="card" style="width: 18rem;">
                <div class="card-body">
                <h5 class="card-title">ENTREGA - DATOS DE LA ENTREGA</h5>
                    <div class="form-floating mb-3">
                        <label for="feEntRep" class="form-label">Fecha Entrega</label>
                        <input onChange={e => changeInputRep(e.target)} type="date" class="form-control" id="feEntRep" />
                    </div>
                    <div class="form-floating mb-3">
                        <label for="txtEntregaRep" class="form-label">Cliente, Comisionista, Correo, Seguimiento</label>
                        <textarea onChange={e => changeInputRep(e.target)} class="form-control" id="txtEntregaRep"></textarea>
                    </div>
                    <div class="form-floating mb-3">
                        <label for="seguimientoEntregaRep" class="form-label">Nro. de Seguimiento</label>
                        <input onChange={e => changeInputRep(e.target)} type="text" class="form-control" id="seguimientoEntregaRep" />
                    </div>
                </div>
            </div>

           
            <button type="submit" class="btn btn-primary">Submit</button>
        </form>
    )
}



export default connect(null, {changeInputRep})(Reparacion);