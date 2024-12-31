import React from 'react';
import { Router } from 'react-router-dom';
import history from '../history';
import { connect } from 'react-redux';
import Routes from '../routes/Routes';
import ModalComponent from './Modal.component';
import ConfirmComponent from './Confirm.component';
import { ConfirmType, RootState } from '../redux-DEPRECATED/App/App.reducer';

interface AppProps {
  isFetching: boolean;
  isLoggedIn: boolean;
  admin: boolean;
  modal: any;
  confirm: ConfirmType;
}

const App = (props: AppProps) => {
  const { isFetching, isLoggedIn, admin, modal, confirm } = props;

  console.log('APP');

  const { showModal, mensajeModal, tituloModal, tipoModal } = modal;
  const { showConfirm, mensajeConfirm, tituloConfirm, tipoConfirm, callBackConfirm } = confirm;

  return (
    <div className='mx-auto'
      style={{
        backgroundColor: '#EEEEEE',
        height: '100%',
        minHeight: '100vh',
        maxWidth: '600px'
      }}
    >
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
        <Router history = {history} >
          <Routes isLoggedIn = {isLoggedIn} admin = {admin}/>
        </Router>
        <footer className='page-footer fixed-bottom text-center'>
        {isFetching ? 
          <div className='float-right'>
            <span 
              className='spinner-grow' 
              role='status'
              style={{
                height: '15vh',
                width: '15vh'
              }}
            >
            </span>
          </div>
        : null }
        </footer>
    </div>
  );
};

const mapStateToProps = ( state: RootState ) => ({
  isLoggedIn: state.app.isLoggedIn,
  isFetching: state.app.isFetching,
  admin: state.app.usuario?.data?.Admin || false,
  modal: state.app.modal,
  confirm: state.app.confirm
});

export default connect( mapStateToProps )( App );
