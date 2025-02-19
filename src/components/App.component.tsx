import React from 'react';
import { Router } from 'react-router-dom';
import history from '../history';
import Routes from '../routes/Routes';
import { ModalComponent } from './Modal/modal.component';
import { ModalProvider } from './Modal/modal.provider';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';

export default function App(): JSX.Element {
  console.log('APP');
  const isFetching = useAppSelector(state => state.app.isFetching);

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
            <Routes />
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
}
