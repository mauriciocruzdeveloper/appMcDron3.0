import React from 'react';
import { useHistory } from 'hooks/useHistory';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from 'redux-tool-kit/hooks/useAppSelector';
import { selectRepuestosPedidos } from 'redux-tool-kit/repuesto/repuesto.selectors';
import RepuestoPedidoItem from './items/RepuestoPedidoItem.component';

const RepuestosPedidosSection = (): React.ReactElement => {
  const history = useHistory();
  const location = useLocation();
  const match = { path: location.pathname };
  const repuestosPedidos = useAppSelector(selectRepuestosPedidos);
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div>
      <div
        className='d-flex justify-content-between align-items-center mb-3'
        onClick={() => setExpanded(!expanded)}
        style={{ cursor: 'pointer' }}
      >
        <h5 className='mb-0'>🚚 Repuestos en Pedido</h5>
        <div className='d-flex align-items-center'>
          {repuestosPedidos.length > 0 && (
            <span className='badge bg-warning text-dark me-2'>{repuestosPedidos.length}</span>
          )}
          <i className={`bi bi-chevron-${expanded ? 'up' : 'down'}`}></i>
        </div>
      </div>
      {expanded && (
        repuestosPedidos.length > 0 ? (
          <div className='list-group'>
            {repuestosPedidos.map(repuesto => (
              <RepuestoPedidoItem
                key={repuesto.id}
                repuesto={repuesto}
                onClick={() => history.push(`${match.path}/repuestos/${repuesto.id}`)}
              />
            ))}
          </div>
        ) : (
          <p className='text-muted'>No hay repuestos en pedido</p>
        )
      )}
    </div>
  );
};

export default RepuestosPedidosSection;
