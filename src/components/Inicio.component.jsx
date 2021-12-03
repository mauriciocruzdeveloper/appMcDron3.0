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

            <button 
              className="m-4 btn w-75 bg-bluemcdron"
              style={{height: "100px"}}
            >      
              <text class="text-white text-center">REPARACIONES</text>
            </button>

            <button 
              className="m-4 btn w-75 bg-bluemcdron"
              style={{height: "100px"}}
            >      
              <text class="text-white text-center">PRESUPUESTO</text>
            </button>

        </div>
      </Collapse>
    )
};

export default connect( null, { logout } )( Inicio );
