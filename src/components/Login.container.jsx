import { useState } from "react";
import { connect } from "react-redux";
import history from "../history";
// Actions 
import { login } from "../redux/root-actions";
// Components
import LoginPresentational from './Login.presentational'; // componente "no inteligente" de presentación

const Login = ({ login }) => {

  console.log("LOGIN container");

  // Valor inicial para el useState de loginData
  const INIT_LOGIN_DATA = {
    email: '',
    password: ''
  }

  const [ loginData, setLoginData ] = useState(INIT_LOGIN_DATA);

  // Actualiza los valores de los input cuando éstos cambian y los guarda en el state local.
  const changeInputLogin = target => setLoginData({ 
    ...loginData, 
    [target.id]: target.value 
  });

  // Manejador para el botón login. 
  const handleLogin = async () => {
    // LLama al action creator (asincrónico) "login"
    await login(loginData);
    // Luego de loguearse, va al raíz. Si está logueado, termina en inicio, sino en login.
    history.push("/");
  };

  // Manejador para registrarse
  const handleRegistrarse = () => {
    // Va a la página de registro
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