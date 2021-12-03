import React from "react";
// Módulo para conectar con redux
import {connect} from "react-redux";
// Actions
import {logout} from "../redux/root-actions";
// Componentes
// import Calendario from "./Calendario/Calendario.component";
// import PantallaAdministrador from "./PantallaAdministrador";
// Transitions
import { Collapse } from "react-bootstrap";

const Inicio = ({ logout, admin }) => {
    return (
      <Collapse in={open}>
        {/* Ver cómo se hace una transición */}
        <div className="text-center">
            <img class="mb-4" src="./img/logo.png" alt="" width="100%" max-width="100px" />   

            <div 
              className="card bg-bluemcdron"
              width="80%"
              style={{height: "100px"}}
            >      
              Reparaciones
            </div>

            <div 
              className="card bg-bluemcdron"
              width="80%"
              style={{height: "100px"}}
            >      
              Presupuesto
            </div>

        </div>
      </Collapse>
    )
};

export default connect( null, { logout } )( Inicio );
