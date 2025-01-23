import React from 'react';
import { Router } from 'react-router-dom';
import history from '../history';
import { connect } from 'react-redux';
import Routes from '../routes/Routes';
import { RootState } from '../redux-DEPRECATED/App/App.reducer';
import { ModalComponent } from './Modal/modal.component';
import { ModalProvider } from './Modal/modal.provider';

interface AppProps {
  isFetching: boolean;
  isLoggedIn: boolean;
  admin: boolean;
}

const App = (props: AppProps) => {
  console.log('APP');
  const { isFetching, isLoggedIn, admin } = props;

  return (
    <div className='mx-auto'
      style={{
        backgroundColor: '#EEEEEE',
        height: '100%',
        minHeight: '100vh',
        maxWidth: '600px'
      }}
    >
      <ModalProvider>
        <ModalComponent />
        <Router history={history} >
          <Routes isLoggedIn={isLoggedIn} admin={admin} />
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
            : null}
        </footer>
      </ModalProvider>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  isLoggedIn: state.app.isLoggedIn,
  isFetching: state.app.isFetching,
  admin: state.app.usuario?.data?.Admin || false,
  modal: state.app.modal,
  confirm: state.app.confirm
});

export default connect(mapStateToProps)(App);
