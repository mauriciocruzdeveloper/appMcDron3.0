import React from "react";
import { connect } from "react-redux";
import { login, emailOnChangeLogin, passwordOnChangeLogin } from "../redux/root-actions";
import history from "../history";

const Login = ({ isFetching, login, emailOnChangeLogin, passwordOnChangeLogin, email, password }) => {

  const handleLogin = async () => {
    // Hice una promesa para que cuando no se puede loguear me mande a una página de error de login
    await login( email, password)
      .then( () => history.push("/") )
      .catch( () => history.push("/errorlogin") );    
  };

  return (


    isFetching ? <h3>cargando ....</h3> :
    <div class="page-content">

    <div class="text-align-center margin-top">
        <img src="img/logo.png" width="90%" max-width="300px"/> 
    </div>
        <div class="block-title">Logueate</div>
        <div class="list no-hairlines-md">
        <ul>
          <li class="item-content item-input">
            <div class="item-media">
              <i class="icon demo-list-icon"></i>
            </div>
            <div class="item-inner">
              <div class="item-title item-floating-label">E-mail</div>
              <div class="item-input-wrap">
                <input 
                  value={ email }
                  onChange={ (e) => emailOnChangeLogin( e.target.value ) }
                  id="logEmail" 
                  type="email" 
                  placeholder="Tu e-mail" 
                  value="admin@mauriciocruzdrones.com" 
                />
                <span class="input-clear-button"></span>
              </div>
            </div>
          </li>
          <li class="item-content item-input">
            <div class="item-media">
              <i class="icon demo-list-icon"></i>
            </div>
            <div class="item-inner">
              <div class="item-title item-floating-label">Contraseña</div>
              <div class="item-input-wrap">
                <input 
                  value={ password }
                  onChange={ (e) => passwordOnChangeLogin( e.target.value ) }
                  id="logContra" 
                  type="password" 
                  placeholder="Contraseña" 
                  value="123456" 
                />
                <span class="input-clear-button"></span>
              </div>
            </div>
          </li>



        </ul>
        </div>
          <div class="row">                        
            <div class="col-20"></div>                
            <div 
              onClick={ () => handleLogin() }
              class="col-60 button button-raised button-fill bg-bluemcdron" 
              widht="100px">Logueate
            </div>
            <div class="col-20"></div>
          </div>

        {/* <div class="text-align-center margin-top">
          <a class="irRecuperar">Olvid&oacute; su contraseña?</a>
        </div> */}

        <div class="text-align-center margin-top">
          <img src="img/logo1.png" width="90%"/> 
        </div>

    </div>

  );
};


const mapStateToProps = (state) => ({
  email: state.app.usuario.email,
  password: state.app.usuario.password,
  admin: state.app.usuario.admin,
  isFetching: state.app.isFetching
});

export default connect(mapStateToProps, { login, emailOnChangeLogin, passwordOnChangeLogin })(Login);