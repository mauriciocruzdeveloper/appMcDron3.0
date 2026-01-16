import React from 'react';
import { useAppSelector } from 'redux-tool-kit/hooks/useAppSelector';
import { selectModelosNombresByRepuestoId } from 'redux-tool-kit/repuesto/repuesto.selectors';

interface RepuestoItemProps {
  repuesto: any;
  onClick: () => void;
}

const RepuestoItem = ({ repuesto, onClick }: RepuestoItemProps): React.ReactElement => {
  const modelosNombres = useAppSelector(selectModelosNombresByRepuestoId(repuesto.id));
  const vecesUsado = repuesto.vecesUsado || 0;

  return (
    <div
      className='list-group-item list-group-item-action mb-2'
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className='d-flex justify-content-between align-items-center'>
        <div style={{ flex: 1 }}>
          <h6 className='mb-1'>{repuesto.data.NombreRepu}</h6>
          <p className='mb-1 text-muted'>{repuesto.data.ProveedorRepu}</p>
          <small className='text-muted d-block'>
            {modelosNombres.length > 0 ? modelosNombres.join(', ') : 'Sin modelos asignados'}
          </small>
          <small className={`badge mt-1 ${vecesUsado > 0 ? 'bg-info text-dark' : 'bg-secondary'}`}>
            {vecesUsado > 0 
              ? `📊 Usado ${vecesUsado} ${vecesUsado === 1 ? 'vez' : 'veces'} en reparaciones`
              : '⚪ No usado en reparaciones'
            }
          </small>
        </div>
        <span
          className='badge ms-2'
          style={{
            backgroundColor: '#dc3545',
            color: 'white'
          }}
        >
          Agotado
        </span>
      </div>
    </div>
  );
};

export default RepuestoItem;
