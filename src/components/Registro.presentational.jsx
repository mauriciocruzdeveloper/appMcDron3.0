const RegistroPresentational = ({ 
  registroData,
  changeInputRegistro,
  handleLoguearse,
  handleRegistro
}) => {
  console.log("REGISTRO presentational");

  return (
    <div className="text-center">
      <main className="form-signin">
        <div className="text-center">

          <img className="mb-4" src="./img/logo.png" alt="" width="100%" />
          <h1 className="h3 mb-3 fw-normal">Regístrese</h1>
          <div className="form-floating mb-2">
            <input 
              type="text" 
              className="form-control" 
              id="NombreUsu" 
              placeholder="Nombre" 
              value={ registroData.NombreUsu }
              onChange={ e => changeInputRegistro(e.target) }
            />
            <label>Nombre *</label>
          </div>
          <div className="form-floating mb-2">
            <input 
              type="text" 
              className="form-control" 
              id="ApellidoUsu" 
              placeholder="Apellido" 
              value={ registroData.ApellidoUsu }
              onChange={ e => changeInputRegistro(e.target) }
            />
            <label>Apellido</label>
          </div>
          <div className="form-floating mb-2">
            <input 
              type="email" 
              className="form-control" 
              id="email" 
              placeholder="name@example.com" 
              value={ registroData.email }
              onChange={ e => changeInputRegistro(e.target) }
            />
            <label>Email *</label>
          </div>
          <div className="form-floating">
            <input 
              type="password" 
              className="form-control" 
              id="password" 
              placeholder="Password" 
              value={ registroData.password }
              onChange={ e => changeInputRegistro(e.target) }
            />
            <label>Password *</label>
          </div>

          <div className="form-floating">
            <input 
              type="password" 
              className="form-control" 
              id="password2" 
              placeholder="Password" 
              value={ registroData.password2 }
              onChange={ e => changeInputRegistro(e.target) }
            />
            <label>Repetir Password *</label>
          </div>
      
          

          <button 
            onClick={handleRegistro}
            className="w-100 mb-3 btn btn-lg btn-primary bg-bluemcdron"
          >
            Registrarse
          </button>

          <a 
            onClick={ handleLoguearse }
            className="w-100 bluemcdron"
          >
            <h5>Login</h5>
          </a>

          <p className="mt-5 mb-3 text-muted">© 2017–2021</p>
          
        </div>
      </main>
    </div>

  );
};

export default RegistroPresentational;