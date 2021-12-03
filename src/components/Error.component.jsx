import React from "react";
import { connect } from "react-redux";
import history from "../history";
import { Modal, Button, Alert } from 'react-bootstrap';
import { cierraError } from '../redux/root-actions.js';

const ErrorComponent = ({ hide, titulo, mensaje, cierraError }) => {

    console.log('Llega a ErrorComponent ' + hide);

    return(
        <Modal centered show={hide} onHide={cierraError}>
            <Modal.Title><Alert variant="danger">{titulo}</Alert></Modal.Title>
            <Modal.Body>{mensaje}</Modal.Body>
            <Modal.Footer>
                <Button className="bg-bluemcdron" onClick={cierraError}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    )
}



export default connect(null, {cierraError})(ErrorComponent);