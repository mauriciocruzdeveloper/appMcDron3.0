import React from 'react';
import { LoginData } from './Login.container';

interface LoginPresentationalProps {
  loginData: LoginData;
  changeInputLogin: (field: string, value: string) => void;
  handleLogin: () => void;
  handleRegistrarse: () => void;
  setRememberMe: (value: boolean) => void;
}

const LoginPresentational = ({ 
  loginData,
  changeInputLogin,
  handleLogin,
  handleRegistrarse,
  setRememberMe
}: LoginPresentationalProps) => {

  console.log('LOGIN presentational');

  const currentYear = new Date().getUTCFullYear();

  return (
    <div className='text-center'>
      <main className='form-signin'>
        <div className='text-center'>

          <img className='mb-4' src='./img/logo.png' alt='' width='100%' />
          <h1 className='h3 mb-3 fw-normal'>Bienvenido!</h1>
      
          <div className='form-floating mb-2'>
            <input 
              type='email' 
              className='form-control' 
              id='email' 
              placeholder='name@example.com' 
              value={ loginData.email }
              onChange={ e => changeInputLogin(e.target.id, e.target.value) }
            />
            <label>Email address</label>
          </div>
          <div className='form-floating'>
            <input 
              type='password' 
              className='form-control' 
              id='password' 
              placeholder='Password' 
              value={ loginData.password }
              onChange={ e => changeInputLogin(e.target.id, e.target.value) }
            />
            <label>Password</label>
          </div>
     
          <div className='checkbox mb-3'>
            <label>
              <input 
                type='checkbox' 
                value='remember-me' 
                onChange={ e => setRememberMe(e.target.checked) }
              /> 
              Remember me
            </label>
          </div>

          <button 
            onClick={ handleLogin }
            className='w-100 mb-3 btn btn-lg btn-primary bg-bluemcdron'
          >
            Login
          </button>

          <a 
            onClick={ handleRegistrarse }
            className='w-100 bluemcdron'
          >
            <h5>Registrarse</h5>
          </a>

          <p className='mt-5 mb-3 text-muted'>© 2017–{currentYear}</p>
          
        </div>
      </main>
    </div>

  );
};

export default LoginPresentational;