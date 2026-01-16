import React from 'react';
import { useHistory } from 'hooks/useHistory';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from 'redux-tool-kit/hooks/useAppSelector';
import { selectRepuestosFaltantes } from 'redux-tool-kit/repuesto/repuesto.selectors';
import RepuestoItem from './items/RepuestoItem.component';

const RepuestosAgotadosSection = (): React.ReactElement => {
  const history = useHistory();
  const location = useLocation();
  const match = { path: location.pathname };
  const repuestosFaltantes = useAppSelector(selectRepuestosFaltantes);
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className='mb-4'>
      <div
        className='d-flex justify-content-between align-items-center mb-3'
        onClick={() => setExpanded(!expanded)}
        style={{ cursor: 'pointer' }}
      >
        <h5 className='mb-0'>🚫 Repuestos Agotados</h5>
        <div className='d-flex align-items-center'>
          {repuestosFaltantes.length > 0 && (
            <span className='badge bg-danger me-2'>{repuestosFaltantes.length}</span>
          )}
          <i className={`bi bi-chevron-${expanded ? 'up' : 'down'}`}></i>
        </div>
      </div>
      {expanded && (
        repuestosFaltantes.length > 0 ? (
          <div className='list-group'>
            {repuestosFaltantes.map(repuesto => (
              <RepuestoItem
                key={repuesto.id}
                repuesto={repuesto}
                onClick={() => history.push(`${match.path}/repuestos/${repuesto.id}`)}
              />
            ))}
          </div>
        ) : (
          <p className='text-muted'>No hay repuestos agotados</p>
        )
      )}
    </div>
  );
};

export default RepuestosAgotadosSection;
