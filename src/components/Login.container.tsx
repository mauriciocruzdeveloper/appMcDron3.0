import React, { useEffect } from 'react';
import { useState } from 'react';
import { connect } from 'react-redux';
import history from '../history';
// Actions 
import { login } from '../redux/root-actions';
// Components
import LoginPresentational from './Login.presentational'; // componente 'no inteligente' de presentación
import { RootState } from '../redux/App/App.reducer';

export interface LoginData {
  email: string;
  password: string;
}

// Valor inicial para el useState de loginData
const INIT_LOGIN_DATA: LoginData = {
  email: '',
  password: ''
};

export interface LoginProps {
  login: (loginData: LoginData) => Promise<void>;
}

const Login = ({ login }: LoginProps) => {
  console.log('LOGIN container');

  const [ loginData, setLoginData ] = useState(() => {
    const savedLoginData = localStorage.getItem('loginData');
    return savedLoginData ? JSON.parse(savedLoginData) : INIT_LOGIN_DATA;
  });

  const [ rememberMe, setRememberMe ] = useState(() => {
    return localStorage.getItem('loginData') ? true : false;
  });

  useEffect(() => {
    if (loginData.email && loginData.password) {
      handleLogin();
    }
  }, []);

  // Actualiza los valores de los input cuando éstos cambian y los guarda en el state local.
  const changeInputLogin = (field: string, value: string) => setLoginData({ 
    ...loginData, 
    [field]: value 
  });

  // Manejador para el botón login. 
  const handleLogin = async () => {
    // LLama al action creator (asincrónico) 'login'
    await login(loginData);
    // Guarda los datos de login en localStorage solo si "Remember me" está marcado
    if (rememberMe) {
      localStorage.setItem('loginData', JSON.stringify(loginData));
    }
    // Luego de loguearse, va al raíz. Si está logueado, termina en inicio, sino en login.
    history.push('/');
  };

  // Manejador para registrarse
  const handleRegistrarse = () => {
    // Va a la página de registro
    history.push('/registro');
  }

  return (
    loginData ?
    <LoginPresentational 
      loginData={loginData}
      handleLogin={handleLogin}
      changeInputLogin={changeInputLogin}
      handleRegistrarse={handleRegistrarse}
      setRememberMe={setRememberMe}
      rememberMe={rememberMe}
    /> : null 
  );
};

const mapStateToProps = (state: RootState) => ({
  isFetching: state.app.isFetching,
});

export default connect(mapStateToProps, { login })(Login);