import React from "react";
import { connect } from "react-redux";
import { login, emailOnChangeLogin, passwordOnChangeLogin } from "../redux/root-actions";
import history from "../history";

const Login = ({ 
  isFetching, 
  login, 
  emailOnChangeLogin, 
  passwordOnChangeLogin, 
  email, 
  password 
}) => {

  const handleLogin = async () => {
    // Hice una promesa para que cuando no se puede loguear me mande a una página de error de login
    await login( email, password)
      .then( () => history.push("/") )
      .catch( () => history.push("/errorlogin") );    
  };

  return (




    isFetching ? <h3>cargando ....</h3> :
    <div class="text-center">
      <main class="form-signin">
        <form class="text-center">

          <img class="mb-4" src="/docs/5.1/assets/brand/bootstrap-logo.svg" alt="" width="72" height="57" />
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
            class="w-100 btn btn-lg btn-primary" 
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



    // <div className="page-content">

    // <div className="text-align-center margin-top">
    //     <img src="../src/img/logo.png" width="90%" max-width="300px"/> 
    // </div>
    //     <div className="block-title">Logueate</div>
    //     <div className="list no-hairlines-md">
    //     <ul>
    //       <li className="item-content item-input">
    //         <div className="item-media">
    //           <i className="icon demo-list-icon"></i>
    //         </div>
    //         <div className="item-inner">
    //           <div className="item-title item-floating-label">E-mail</div>
    //           <div className="item-input-wrap">
    //             <input 
    //               value={ email }
    //               onChange={ (e) => emailOnChangeLogin( e.target.value ) }
    //               id="logEmail" 
    //               type="email" 
    //               placeholder="Tu e-mail" 
    //               value="admin@mauriciocruzdrones.com" 
    //             />
    //             <span className="input-clear-button"></span>
    //           </div>
    //         </div>
    //       </li>
    //       <li className="item-content item-input">
    //         <div className="item-media">
    //           <i className="icon demo-list-icon"></i>
    //         </div>
    //         <div className="item-inner">
    //           <div className="item-title item-floating-label">Contraseña</div>
    //           <div className="item-input-wrap">
    //             <input 
    //               value={ password }
    //               onChange={ (e) => passwordOnChangeLogin( e.target.value ) }
    //               id="logContra" 
    //               type="password" 
    //               placeholder="Contraseña" 
    //               value="123456" 
    //             />
    //             <span className="input-clear-button"></span>
    //           </div>
    //         </div>
    //       </li>



    //     </ul>
    //     </div>
    //       <div className="row">                        
    //         <div className="col-20"></div>                
    //         <div 
    //           onClick={ () => handleLogin() }
    //           className="col-60 button button-raised button-fill bg-bluemcdron" 
    //           widht="100px">Logueate
    //         </div>
    //         <div className="col-20"></div>
    //       </div>

    //     {/* <div className="text-align-center margin-top">
    //       <a className="irRecuperar">Olvid&oacute; su contraseña?</a>
    //     </div> */}

    //     <div className="text-align-center margin-top">
    //       <img src="../src/img/logo1.png" width="90%"/> 
    //     </div>

    // </div>




const mapStateToProps = (state) => ({
  email: state.app.usuario.email,
  password: state.app.usuario.password,
  admin: state.app.usuario.admin,
  isFetching: state.app.isFetching
});

export default connect(mapStateToProps, { login, emailOnChangeLogin, passwordOnChangeLogin })(Login);