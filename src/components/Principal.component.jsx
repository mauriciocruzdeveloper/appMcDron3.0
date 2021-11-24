import React from "react";
// Módulo para conectar con redux
import { connect } from "react-redux";
// Actions
import { logout } from "../redux/root-actions";
// Componentes
// import Calendario from "./Calendario/Calendario.component";
// import PantallaAdministrador from "./PantallaAdministrador";

const Principal = ({ logout, admin }) => {
    return (
        <div className="m-0 row justify-content-center">
            {/* <h1 className="col-auto bg-light p-5 text-center">App Turnos Rotativos</h1> 
            {
                // Muestra botones para acceder a los empleados y tipos de jornada sólo si sos administrador 
                admin ? <PantallaAdministrador /> : <Calendario />
            }
            <div className="row justify-content-end">
                <button type="button" className="border col-2 btn btn-dark float-right"  onClick = {() => logout() }>Logout</button>
            </div>  */}
            PRINCIPAL

        </div>
    )
};

export default connect( null, { logout } )( Principal );
