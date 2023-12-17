import { connect } from "react-redux";
import { Modal, Button, Alert } from 'react-bootstrap';
import { cierraModal } from '../redux/root-actions.js';

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

interface ModalComponentProps {
    show: boolean;
    titulo: string;
    mensaje: string;
    cierraModal: () => void;
    tipo: string;
}

const ModalComponent = (props: ModalComponentProps) => {
    const { show, titulo, mensaje, cierraModal, tipo } = props;

    console.log('Llega a ErrorComponent ' + show);

    return(
        <Modal className="w-80" centered show={show} onHide={cierraModal}>
            <Modal.Title><Alert variant={tipo}>{titulo}</Alert></Modal.Title>
            <Modal.Body>{mensaje}</Modal.Body>
            <Modal.Footer>
                <Button className="bg-bluemcdron" onClick={cierraModal}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default connect(null, {cierraModal})(ModalComponent);