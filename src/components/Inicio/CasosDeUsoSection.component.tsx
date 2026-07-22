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
        className='dashboard-action-button btn w-100'
        style={{
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
    <div>
      <h5 className='dashboard-section-title'>
        <i className='bi bi-lightning-charge'></i>
        Acciones rápidas
      </h5>
      <div className='dashboard-action-grid'>
        {renderEstadoButton('Recibido', 'RECEPCIÓN')}
        {renderEstadoButton('Transito', 'DRONE EN TRÁNSITO')}
      </div>
    </div>
  );
};

export default CasosDeUsoSection;
