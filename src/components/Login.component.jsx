import React from "react";
import { connect } from "react-redux";
import { 
  login, 
  emailOnChangeLogin, 
  passwordOnChangeLogin,
  abreError
} from "../redux/root-actions";
import history from "../history";


const Login = ({ 
  isFetching, 
  login, 
  emailOnChangeLogin, 
  passwordOnChangeLogin, 
  email, 
  password,
  showError,
  abreError
}) => {

  const handleLogin = async () => {
    // Hice una promesa para que cuando no se puede loguear me mande a una página de error de login
    await login( email, password)
      .then( () => history.push("/") )
      .catch( error => {
        abreError("Error ", "Código - " + error.code );
        // history.push("/errorlogin") 
      });
    // console.log('showError ' + showError);
    // abreError("Error", "Login Incorrecto" );
    // console.log('showError ' + showError);
  };

  return (
    isFetching ? <h3>cargando ....</h3> :

    <div class="text-center">
      <main class="form-signin">
        <form class="text-center">

          <img class="mb-4" src="./img/logo.png" alt="" width="100%" />
          <h1 class="h3 mb-3 fw-normal">Please sign in</h1>
      
          <div class="form-floating">
            <input 
              type="email" 
              class="form-control" 
              id="floatingInput" 
              placeholder="name@example.com" 
              value={ email }
              onChange={ (e) => emailOnChangeLogin( e.target.value ) }
            />
            <label for="floatingInput">Email address</label>
          </div>
          <div class="form-floating">
            <input 
              type="password" 
              class="form-control" 
              id="floatingPassword" 
              placeholder="Password" 
              value={ password }
              onChange={ e => passwordOnChangeLogin( e.target.value ) }
            />
            <label for="floatingPassword">Password</label>
          </div>
      
          <div class="checkbox mb-3">
            <label>
              <input type="checkbox" value="remember-me" /> Remember me
            </label>
          </div>

          <button 
            onClick={ () => handleLogin() }
            class="w-100 btn btn-lg btn-primary bg-bluemcdron" 
            type="submit"
          >
            Sign in
          </button>

          <p class="mt-5 mb-3 text-muted">© 2017–2021</p>
          
        </form>
      </main>
    </div>

  );
};




const mapStateToProps = (state) => ({
  email: state.app.usuario.email,
  password: state.app.usuario.password,
  admin: state.app.usuario.admin,
  isFetching: state.app.isFetching,
  showError: state.app.showError
});


export default connect(mapStateToProps, { login, emailOnChangeLogin, passwordOnChangeLogin, abreError })(Login);