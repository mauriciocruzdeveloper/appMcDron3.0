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

interface AlertComponentProps {
    show: boolean;
    titulo: string;
    mensaje: string;
    tipo: string;
}

const AlertComponent = (props: AlertComponentProps) => {
    const { show, titulo, mensaje, tipo } = props;

    console.log('ALERT COMPONENT');

    return(
        <Modal centered show={show}>  
            <Modal.Body><span className="spinner-grow float-right" role="status"></span></Modal.Body>
        </Modal>
    )
}

export default AlertComponent;