// Módulo para conectar con redux
import { connect } from "react-redux";
// Actions
import { logout } from "../redux/root-actions";
// Componentes
// import Calendario from "./Calendario/Calendario.component";
// import PantallaAdministrador from "./PantallaAdministrador";

import { Navbar } from 'react-bootstrap';
import { ArrowLeftShort } from 'react-bootstrap-icons';

import history from "../history";

const NavMcDron = ({ usuario }) => {

    // console.log("USUARIO: " + JSON.stringify(usuario));

    return (
    // La prop sticky es para que el navbar quede arriba, pero "ocupando" un espacio
    // si utilizo fixed, el navbar me tapa la parte superior de la vista.
    <Navbar sticky="top" className="bg-bluemcdron d-flex justify-content-between px-2">
        <ArrowLeftShort 
            width="50" 
            height="50"
            onClick={() => history.goBack()}
            color="white"
        />
        <h4 className="text-white m-0 float-left">
            Hola {usuario?.data?.Nick || "amigo"}!
        </h4>
        {/* <div 
            className="imageContainer rounded-circle float-right"
            width="50" 
            height="50"
        > */}
            <img 
                src={usuario?.data?.UrlFotoUsu || "./img/logo1.png"}
                width="50" 
                // height="50"
                className="rounded-circle float-right" 
                alt="Foto del usuario"
            />
        {/* </div> */}
    </Navbar>
    )
};

const mapStateToProps = (state) => ({
    usuario: state.app?.usuario
});

export default connect(mapStateToProps, { logout })(NavMcDron);