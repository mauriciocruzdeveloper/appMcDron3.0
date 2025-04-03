import React from 'react';
import history from '../history';
import { MatchType } from '../types/types';

interface InicioProps {
  admin: boolean;
  match: MatchType;
}

const Inicio = (props: InicioProps) => {
  const { admin, match } = props;

  console.log('INICIO');

  return (

    <div
      className='p-4'
    >
      <img className='mb-4' src='./img/logo.png' alt='' width='100%' max-width='100px' />

      {/* Grupo 1: Recepción - primer proceso del negocio */}

      {/* Separador visual sin cambiar estilos */}
      <div className="mb-4 text-center text-muted">
        <small>Procesos de Negocio</small>
        <hr className="mt-1" />
      </div>

      <button
        className='mb-3 btn w-100 bg-bluemcdron'
        style={{ height: '100px' }}
        onClick={() => history.push(`${match.path}/presupuesto`)}
      >
        <div className='text-white text-center'>RECEPCIÓN</div>
      </button>

      {/* Grupo 2: Gestión y administración */}

      {/* Separador visual sin cambiar estilos */}
      <div className="mb-4 text-center text-muted">
        <small>Gestión y Administración</small>
        <hr className="mt-1" />
      </div>
      <button
        className='mb-3 btn w-100 bg-bluemcdron'
        style={{ height: '100px' }}
        onClick={() => history.push(`${match.path}/reparaciones`)}
      >
        <div className='text-white text-center'>REPARACIONES</div>
      </button>

      {admin ?
        <button
          className='mb-3 btn w-100 bg-bluemcdron'
          style={{ height: '100px' }}
          onClick={() => history.push(`${match.path}/usuarios`)}
        >
          <div className='text-white text-center'>USUARIOS</div>
        </button>
        : null}

      {admin ?
        <button
          className='mb-3 btn w-100 bg-bluemcdron'
          style={{ height: '100px' }}
          onClick={() => history.push(`${match.path}/repuestos`)}
        >
          <div className='text-white text-center'>REPUESTOS</div>
        </button>
        : null}

      {admin ?
        <button
          className='mb-3 btn w-100 bg-bluemcdron'
          style={{ height: '100px' }}
          onClick={() => history.push(`${match.path}/modelos-drone`)}
        >
          <div className='text-white text-center'>MODELOS DE DRONES</div>
        </button>
        : null}

      {admin ?
        <button
          className='mb-3 btn w-100 bg-bluemcdron'
          style={{ height: '100px' }}
          onClick={() => history.push(`${match.path}/drones`)}
        >
          <div className='text-white text-center'>DRONES</div>
        </button>
        : null}

      {/* Grupo 3: Comunicación */}

      {/* Separador visual sin cambiar estilos */}
      <div className="mb-4 text-center text-muted">
        <small>Comunicación</small>
        <hr className="mt-1" />
      </div>

      <button
        className='mb-3 btn w-100 bg-bluemcdron'
        style={{ height: '100px' }}
        onClick={() => history.push(`${match.path}/mensajes`)}
      >
        <div className='text-white text-center'>MENSAJES</div>
      </button>

    </div>
  )
};

export default Inicio;
