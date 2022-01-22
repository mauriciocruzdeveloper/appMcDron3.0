import { connect } from "react-redux";
import { Modal, Button, Alert } from 'react-bootstrap';
import { cierraAlert } from '../redux/root-actions.js';

//TIPOS
// primary
// secondary
// success
// danger
// warning
// info
// light
// dark
// muted
// white

const AlertComponent = ({ show, titulo, mensaje, cierraAlert, tipo }) => {

    console.log('Llega a ErrorComponent ' + show);

    return(
        <Modal centered show={show} onHide={cierraAlert}>
            <Modal.Title><Alert variant={tipo}>{titulo}</Alert></Modal.Title>
            <Modal.Body>{mensaje}</Modal.Body>
        </Modal>
    )
}

export default connect(null, {cierraAlert})(AlertComponent);