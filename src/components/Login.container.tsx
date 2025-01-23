import React, { useEffect } from 'react';
import { useState } from 'react';
import history from '../history';
import LoginPresentational from './Login.presentational'; // componente 'no inteligente' de presentación
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { loginAsync } from '../redux-tool-kit/app/app.actions';
import { useModal } from './Modal/useModal';

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
  loginAsync: (loginData: LoginData) => Promise<void>;
}

export default function Login(): JSX.Element | null {
  const dispatch = useAppDispatch();
  const {
    openModal,
  } = useModal();

  const [loginData, setLoginData] = useState(() => {
    const savedLoginData = localStorage.getItem('loginData');
    return savedLoginData ? JSON.parse(savedLoginData) : INIT_LOGIN_DATA;
  });

  console.log('LOGIN container');

  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('loginData') ? true : false;
  });

  useEffect(() => {
    if (loginData.email && loginData.password) {
      handleLogin();
    }
  }, []);

  const changeInputLogin = (field: string, value: string) => setLoginData({
    ...loginData,
    [field]: value
  });

  const handleLogin = async () => {
    const result = await dispatch(loginAsync(loginData));
    if (result.meta.requestStatus === 'fulfilled') {
      if (rememberMe) {
        localStorage.setItem('loginData', JSON.stringify(loginData));
      }
      history.push('/');
    } else {
      openModal({
        mensaje: `Error de login: ${result}`,
        titulo: 'Error',
        tipo: 'danger',
      });
    }
  };

  const handleRegistrarse = () => {
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
}
