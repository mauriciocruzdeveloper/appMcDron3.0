import { Modal } from 'react-bootstrap';

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

const AlertComponent = ({ show, titulo, mensaje, tipo }) => {

    console.log('ALERT COMPONENT ' + show);

    return(
        <Modal centered show={show}>
            
            <Modal.Body><span class="spinner-grow float-right" role="status"></span></Modal.Body>
            
        </Modal>
    )
}

export default AlertComponent;