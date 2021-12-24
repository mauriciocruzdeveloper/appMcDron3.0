import React from "react";
import { connect } from "react-redux";
import history from "../history";
import { Button } from 'react-bootstrap';
import { cierraError } from '../redux/root-actions.js';

const ButtonEstado = ({ label, color }) => {

    return(
        <Button className="bg-bluemcdron" onClick={cierraError}>
            Cerrar
        </Button>
    )
}



export default ErrorComponent;