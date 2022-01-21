import { Router } from "react-router-dom";
import history from "../history";
import { connect } from "react-redux";

import Routes from "../routes/Routes";
import ModalComponent from "./Modal.component";
import ConfirmComponent from "./Confirm.component";

// import '../../node_modules/bootstrap-icons/icons';

const App = ( { isLoggedIn, admin, modal, confirm }) => {

  const { showModal, mensajeModal, tituloModal, tipoModal } = modal;
  const { showConfirm, mensajeConfirm, tituloConfirm, tipoConfirm, callBackConfirm } = confirm;

  return (
    <div>
{/* Esto de poner los modales y confirmaciones acá quizás sea una chanchada. VER!! */}
        <ModalComponent 
          show = {showModal} 
          mensaje = {mensajeModal} 
          titulo = {tituloModal}
          tipo = {tipoModal}
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
  admin: state.app.usuario.admin,
  modal: state.app.modal,
  confirm: state.app.confirm
});

export default connect( mapStateToProps )( App );
