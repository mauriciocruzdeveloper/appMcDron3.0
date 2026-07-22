import React from 'react';
import { useAppSelector } from 'redux-tool-kit/hooks/useAppSelector';
import { selectModelosNombresByRepuestoId } from 'redux-tool-kit/repuesto/repuesto.selectors';

interface RepuestoPedidoItemProps {
  repuesto: any;
  onClick: () => void;
}

const RepuestoPedidoItem = ({ repuesto, onClick }: RepuestoPedidoItemProps): React.ReactElement => {
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
          <div className='d-flex flex-wrap gap-2 mt-1'>
            <small className='badge bg-warning text-dark text-wrap text-start'>
              📦 {repuesto.data.UnidadesComprometidas} {repuesto.data.UnidadesComprometidas === 1 ? 'unidad comprometida' : 'unidades comprometidas'}
            </small>
            <small className={`badge text-wrap text-start ${vecesUsado > 0 ? 'bg-info text-dark' : 'bg-secondary'}`}>
              {vecesUsado > 0 
                ? `📊 Usado ${vecesUsado} ${vecesUsado === 1 ? 'vez' : 'veces'} en reparaciones`
                : '⚪ No usado en reparaciones'
              }
            </small>
          </div>
        </div>
        <span
          className='badge ms-2'
          style={{
            backgroundColor: '#ffc107',
            color: 'black'
          }}
        >
          En Pedido
        </span>
      </div>
    </div>
  );
};

export default RepuestoPedidoItem;
