import React from "react";
// Módulo para conectar con redux
import { connect } from "react-redux";
// Actions
import { logout } from "../redux/root-actions";
// Componentes
// import Calendario from "./Calendario/Calendario.component";
// import PantallaAdministrador from "./PantallaAdministrador";

import {Navbar} from 'react-bootstrap';
import {ArrowLeftShort} from 'react-bootstrap-icons';

import history from "../history";

const NavMcDron = ({  }) => {
    return (
    <Navbar className="bg-bluemcdron">
        <ArrowLeftShort 
            width="50" 
            height="50"
            onClick={ () => history.goBack() }
            color="white"
        />
    </Navbar>
    )
};

export default connect( null, { logout } )( NavMcDron );