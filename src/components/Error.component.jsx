import React from "react";
import { connect } from "react-redux";
import history from "../history";
import { Modal, Button } from 'react-bootstrap';
import {useState} from 'react'

const ErrorComponent = ({ titulo, mensaje }) => {

    const [show, setShow] = useState(true);

    const handleClose = () => setShow(false);
    // const handleShow = () => setShow(true);

    return(

    <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
            <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
                Close
            </Button>
            <Button variant="primary" onClick={handleClose}>
                Save Changes
            </Button>
        </Modal.Footer>
    </Modal>

        // <div className="modal" tabIndex="-1" role="dialog">
        //     <div className="modal-dialog" role="document">
        //         <div className="modal-content">
        //             <div className="modal-header">
        //                 <h5 className="modal-title">Atención</h5>
        //                 <button type="button" className="close" data-dismiss="modal" aria-label="Close">
        //                 <span aria-hidden="true">&times;</span>
        //                 </button>
        //             </div>
        //             <div className="modal-body">
        //                 <p>{ mensaje }</p>
        //             </div>
        //             <div className="modal-footer">
        //                 <button type="button" className="btn btn-primary" onClick={() => history.push("/")} >Cerrar</button>
        //                 {/* <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button> */}
        //             </div>
        //         </div>
        //     </div>
        // </div>
    )
}

export default connect( null, null )( ErrorComponent );