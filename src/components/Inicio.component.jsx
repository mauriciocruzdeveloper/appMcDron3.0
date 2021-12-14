import React, { Fragment } from "react";
// Módulo para conectar con redux
import { connect } from "react-redux";
// Actions
import { logout } from "../redux/root-actions";
// Componentes
// import Calendario from "./Calendario/Calendario.component";
// import PantallaAdministrador from "./PantallaAdministrador";
// Transitions
import { Collapse, text, Button } from "react-bootstrap";
// Servicios
import history from "../history";

// match es una parámetro de las props
const Inicio = ({ logout, admin, match }) => {
    return (

        <div className="text-center">
            <img className="mb-4" src="./img/logo.png" alt="" width="100%" max-width="100px" />   

            <button 
              className="m-4 btn w-75 bg-bluemcdron"
              style={{height: "100px"}}
              onClick={() => history.push(`${match.path}/reparaciones`)}
            >      
              <div className="text-white text-center">REPARACIONES</div>
            </button>

            <button 
              className="m-4 btn w-75 bg-bluemcdron"
              style={{height: "100px"}}
            >      
              <div className="text-white text-center">PRESUPUESTO</div>
            </button>

        </div>
    )
};

export default connect( null, { logout } )( Inicio );
