interface LoginPresentationalProps {
  loginData: LoginType;
  changeInputLogin: (target: any) => void;
  handleLogin: () => void;
  handleRegistrarse: () => void;
}

const LoginPresentational = ({ 
  loginData,
  changeInputLogin,
  handleLogin,
  handleRegistrarse
}) => {

  console.log("LOGIN presentational");

  return (
    <div className="text-center">
      <main className="form-signin">
        <div className="text-center">

          <img className="mb-4" src="./img/logo.png" alt="" width="100%" />
          <h1 className="h3 mb-3 fw-normal">Bienvenido!</h1>
      
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
            onClick={ handleLogin }
            className="w-100 mb-3 btn btn-lg btn-primary bg-bluemcdron"
          >
            Login
          </button>

          <a 
            onClick={ handleRegistrarse }
            className="w-100 bluemcdron"
          >
            <h5>Registrarse</h5>
          </a>

          <p className="mt-5 mb-3 text-muted">© 2017–2021</p>
          
        </div>
      </main>
    </div>

  );
};

export default LoginPresentational;