import React from "react";
import {Router} from "react-router-dom";
import history from "../history";
import {connect} from "react-redux";

import Routes from "../routes/Routes";
import ErrorComponent from "./Error.component";

// import '../../node_modules/bootstrap-icons/icons';


const App = ( { isLoggedIn, admin, modalError }) => {


  return (
    <div>
        <ErrorComponent 
          hide = {modalError.showError} 
          mensaje = {modalError.mensajeError} 
          titulo = {modalError.tituloError}
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
  modalError: state.app.modalError,
});

export default connect( mapStateToProps )( App );
