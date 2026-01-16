import React from 'react';
import { useHistory } from 'hooks/useHistory';
import { useLocation } from 'react-router-dom';
import { estados } from 'datos/estados';

const CasosDeUsoSection = (): React.ReactElement => {
  const history = useHistory();
  const location = useLocation();
  const match = { path: location.pathname };

  const renderEstadoButton = (estadoKey: string, texto: string) => {
    const estado = estados[estadoKey];
    if (!estado) return null;

    return (
      <button
        className='mb-3 btn w-100'
        style={{
          height: '100px',
          backgroundColor: estado.color,
          color: estadoKey === 'Recibido' ? 'white' : 'black'
        }}
        onClick={() => history.push(`${match.path}/presupuesto?estado=${estadoKey}`)}
      >
        <div className='text-center'>{texto}</div>
      </button>
    );
  };

  return (
    <div className='mb-4'>
      <h5 className='mb-3'>🎯 Casos de Uso</h5>
      {renderEstadoButton('Recibido', 'RECEPCIÓN')}
      {renderEstadoButton('Transito', 'DRONE EN TRÁNSITO')}
    </div>
  );
};

export default CasosDeUsoSection;
