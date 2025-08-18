import React from 'react';
import { useLocation } from 'react-router-dom';
import { useHistory } from '../hooks/useHistory';
import { estados } from '../datos/estados';

interface InicioProps {
  admin: boolean;
}

const Inicio = (props: InicioProps): React.ReactElement => {
  const { admin } = props;
  const history = useHistory();
  const location = useLocation();
  const match = { path: location.pathname }; // Simular match.path para compatibilidad

  console.log('INICIO');

  // Función para generar un botón de estado con su configuración específica
  const renderEstadoButton = (estadoKey: string, texto: string) => {
    const estado = estados[estadoKey];
    if (!estado) return null;
    
    return (
      <button
        className='mb-3 btn w-100'
        style={{ 
          height: '100px', 
          backgroundColor: estado.color,
          color: estadoKey === 'Recibido' ? 'white' : 'black' // Texto blanco para Recibido, negro para otros
        }}
        onClick={() => history.push(`${match.path}/presupuesto?estado=${estadoKey}`)}
      >
        <div className={`text-center`}>{texto}</div>
      </button>
    );
  };

  return (
    <div className='p-4'>
      <img className='mb-4' src='./img/logo.png' alt='' width='100%' max-width='100px' />

      {/* Ahora usamos la función renderEstadoButton para generar los botones de estado */}
      {renderEstadoButton('Recibido', 'RECEPCIÓN')}
      {renderEstadoButton('Transito', 'DRONE EN TRÁNSITO')}
      
      {admin && (
        <button
          className='mb-3 btn w-100 btn-info'
          style={{ height: '100px' }}
          onClick={() => history.push(`${match.path}/estadisticas`)}
        >
          <div className='text-white text-center'>ESTADÍSTICAS</div>
        </button>
      )}
    </div>
  )
};

export default Inicio;
