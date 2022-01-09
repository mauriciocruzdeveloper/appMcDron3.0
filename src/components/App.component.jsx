import React from "react";
import {Router} from "react-router-dom";
import history from "../history";
import {connect} from "react-redux";

import Routes from "../routes/Routes";
import ModalComponent from "./Modal.component";

// import '../../node_modules/bootstrap-icons/icons';


const App = ( { isLoggedIn, admin, modal }) => {


  return (
    <div>
        <ModalComponent 
          show = {modal.showModal} 
          mensaje = {modal.mensajeModal} 
          titulo = {modal.tituloModal}
          tipo = {modal.tipoModal}
        />
        <Router history = {history} >
          <Routes isLoggedIn = {isLoggedIn} admin = {admin}/>
        </Router>
    </div>
  );
};

const mapStateToProps = ( state ) => ({
  isLoggedIn: state.app.isLoggedIn,
  admin: state.app.usuario.admin,
  modal: state.app.modal,
});

export default connect( mapStateToProps )( App );
