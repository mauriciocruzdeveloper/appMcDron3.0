import { Router } from "react-router-dom";
import history from "../history";
import { connect } from "react-redux";

import Routes from "../routes/Routes";

import ModalComponent from "./Modal.component";
import ConfirmComponent from "./Confirm.component";
import AlertComponent from "./Alert.component";

// import '../../node_modules/bootstrap-icons/icons';

const App = ( { isFetching, isLoggedIn, admin, modal, confirm, alert }) => {

  const { showAlert, mensajeAlert, tituloAlert, tipoAlert } = alert;
  const { showModal, mensajeModal, tituloModal, tipoModal } = modal;
  const { showConfirm, mensajeConfirm, tituloConfirm, tipoConfirm, callBackConfirm } = confirm;

  return (
    // isFetching ? <h3>cargando ....</h3> : 
    // No funciona porque cuando entra a listareparaciones, por ejemplo
    // se ejcuta una y otra vez el useEffect, que causa un isfetchin que causa volver
    // a carga listareparaciones que causa nuevamente el useEffect...
    <div>
{/* Esto de poner los modales y confirmaciones acá quizás sea una chanchada. VER!! */}
        <ModalComponent 
          show = {showModal} 
          mensaje = {mensajeModal} 
          titulo = {tituloModal}
          tipo = {tipoModal}
        />
        <AlertComponent 
          show = {showAlert} 
          mensaje = {mensajeAlert} 
          titulo = {tituloAlert}
          tipo = {tipoAlert}
        />
        <ConfirmComponent 
          show = {showConfirm} 
          mensaje = {mensajeConfirm} 
          titulo = {tituloConfirm}
          tipo = {tipoConfirm}
          onConfirm = {callBackConfirm}
        />
{/* Esto de poner los modales y confirmaciones acá quizás sea una chanchada. VER!! */}
        <Router history = {history} >
          <Routes isLoggedIn = {isLoggedIn} admin = {admin}/>
        </Router>
    </div>
  );
};

const mapStateToProps = ( state ) => ({
  isLoggedIn: state.app.isLoggedIn,
  isFetching: state.app.isFetching,
  admin: state.app.usuario.admin,
  modal: state.app.modal,
  alert: state.app.alert,
  confirm: state.app.confirm
});

export default connect( mapStateToProps )( App );
