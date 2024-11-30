import React from 'react';
import { connect } from 'react-redux';
import { Modal, Button, Alert } from 'react-bootstrap';
import { cierraConfirm } from '../redux/root-actions.js';

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

// okConfirm es una función callBack que me dice qué hace cuando presiona confirm.
// En esta app, la función callBack va a estar en redux. A redux va a llegar a través de la
// acción confirmaEliminación, que va a recibir la función callBack par pasarla al reducer
// y éste la ubicará en el state.
// TODO: No se debe guardar en redux una función. Probar otra cosa, quizás un contexto. Hacer un contexto para agregar conocimientos al proyecto.

interface ConfirmComponentProps {
    show: boolean;
    titulo: string;
    mensaje: string;
    tipo: string;
    onConfirm: () => void;
    cierraConfirm: () => void;
}

const ConfirmComponent = (props: ConfirmComponentProps) => {
    const { 
        show, 
        titulo, 
        mensaje, 
        tipo, 
        onConfirm, 
        cierraConfirm 
    } = props;

    console.log('CONFIRM COMPONENT');

    const handleOnConfirm = () => {
        onConfirm();
        cierraConfirm();
    }

    return(
        <Modal centered show={show} onHide={cierraConfirm}>
            <Modal.Title><Alert variant={tipo}>{titulo}</Alert></Modal.Title>
            <Modal.Body>{mensaje}</Modal.Body>
            <Modal.Footer>
                <Button className='bg-bluemcdron' onClick={cierraConfirm}>
                    Cerrar
                </Button>
                <Button className='bg-bluemcdron' onClick={handleOnConfirm}>
                    Confirmar
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default connect(null, {cierraConfirm})(ConfirmComponent);