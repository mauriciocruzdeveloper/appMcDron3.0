import { useState } from "react";
import { connect } from "react-redux";
import { login } from "../redux/root-actions";
import history from "../history";
import LoginPresentational from './Login.presentational';

// import { useEffect } from 'react';

const Login = ({ login }) => {

  console.log("LOGIN container");

  // PARA SETEAR EL USUARIO Y PASSWORD POR DEFECTO PARA HACER PRUEBAS.
  // useEffect(() => {
  //   () => emailOnChangeLogin("admin@mauriciocruzdrones.com");
  //   () => emailOnChangeLogin("123456");
  // },[])

  const INIT_LOGIN_DATA = {
    email: '',
    password: ''
  }

  const [ loginData, setLoginData ] = useState(INIT_LOGIN_DATA);

  const changeInputLogin = target => setLoginData({ 
    ...loginData, 
    [target.id]: target.value 
  });

  const handleLogin = async () => {
    await login(loginData);
    history.push("/");
  };

  const handleRegistrarse = () => {
    history.push("/registro");
  }

  return (
    loginData ?
    <LoginPresentational 
      loginData={loginData}
      changeInputLogin={changeInputLogin}
      handleLogin={handleLogin}
      handleRegistrarse={handleRegistrarse}
    /> : null 
  );
};

const mapStateToProps = (state) => ({
  isFetching: state.app.isFetching,
});

export default connect(mapStateToProps, { login })(Login);