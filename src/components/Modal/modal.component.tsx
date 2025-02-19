import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { useModal } from './useModal';

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

export const ModalComponent: React.FC = () => {
    const {
        isOpen,
        titulo,
        mensaje,
        tipo,
        closeModal,
        onConfirm,
    } = useModal();

    console.log('MODAL COMPONENT');

    const handleOnConfirm = () => {
        onConfirm?.();
        closeModal();
    }

    return (
        <Modal centered show={isOpen} onHide={closeModal}>
            <Modal.Title><Alert variant={tipo}>{titulo}</Alert></Modal.Title>
            <Modal.Body>{mensaje}</Modal.Body>
            <Modal.Footer>
                <Button className='bg-bluemcdron' onClick={closeModal}>
                    Cerrar
                </Button>
                {
                    onConfirm &&
                    <Button className='bg-bluemcdron' onClick={handleOnConfirm}>
                        Confirmar
                    </Button>
                }
            </Modal.Footer>
        </Modal>
    )
}
