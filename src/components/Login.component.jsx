import { useState } from "react";

import { connect } from "react-redux";

import { 
  login, 
  emailOnChangeLogin, 
  passwordOnChangeLogin,
  abreModal
} from "../redux/root-actions";

import history from "../history";

import { useEffect } from 'react';

const Login = ({ 
  isFetching, 
  login, 
  emailOnChangeLogin, 
  passwordOnChangeLogin, 
  // email, 
  // password,
  showModal,
  abreModal
}) => {



  // PARA SETEAR EL USUARIO Y PASSWORD POR DEFECTO PARA HACER PRUEBAS.
  // useEffect(() => {
  //   () => emailOnChangeLogin("admin@mauriciocruzdrones.com");
  //   () => emailOnChangeLogin("123456");
  // },[])

  const [ loginData, setLoginData ] = useState({});

  console.log("LOGIN");

  const changeInputLogin = target => setLoginData({ 
    ...loginData, 
    [target.id]: target.value 
  });

  const handleLogin = async () => {
    console.log("loginData: " + JSON.stringify(loginData));
    await login(loginData)
      .then(() => history.push("/"))
      .catch( error => abreModal("Error ", "Código - " + error.code, "danger" ));
  };



  return (
    <div 
      className="text-center"
      style={{
        backgroundColor: "#EEEEEE", 
        height: "100vh",
      }}
    >
      <main className="form-signin">
        <div className="text-center">

          <img className="mb-4" src="./img/logo.png" alt="" width="100%" />
          <h1 className="h3 mb-3 fw-normal">Please sign in</h1>
      
          <div className="form-floating mb-2">
            <input 
              type="email" 
              className="form-control" 
              id="email" 
              placeholder="name@example.com" 
              value={ loginData.email }
              onChange={ e => changeInputLogin(e.target) }
            />
            <label>Email address</label>
          </div>
          <div className="form-floating">
            <input 
              type="password" 
              className="form-control" 
              id="password" 
              placeholder="Password" 
              value={ loginData.password }
              onChange={ e => changeInputLogin(e.target) }
            />
            <label>Password</label>
          </div>
      
          <div className="checkbox mb-3">
            <label>
              <input 
                type="checkbox" 
                value="remember-me" 
              /> 
              Remember me
            </label>
          </div>

          <button 
            onClick={ () => handleLogin() }
            className="w-100 btn btn-lg btn-primary bg-bluemcdron"
          >
            Sign in
          </button>

          <p className="mt-5 mb-3 text-muted">© 2017–2021</p>
          
        </div>
      </main>
    </div>

  );
};

const mapStateToProps = (state) => ({
  // email: state.app.login.email,
  // password: state.app.login.password,
  isFetching: state.app.isFetching,
  showModal: state.app.showModal
});

export default connect(mapStateToProps, { login, abreModal })(Login);