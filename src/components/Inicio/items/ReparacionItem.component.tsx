import React from 'react';
import { useAppSelector } from 'redux-tool-kit/hooks/useAppSelector';
import { selectModeloNombreByReparacionId, esUrgente, getDiasAtrasoUrgencia } from 'redux-tool-kit/reparacion/reparacion.selectors';

interface ReparacionItemProps {
  reparacion: any;
  estado: any;
  onClick: () => void;
}

const ReparacionItem = ({ reparacion, estado, onClick }: ReparacionItemProps): React.ReactElement => {
  const modeloNombre = useAppSelector(selectModeloNombreByReparacionId(reparacion.id));
  const urgente = esUrgente(reparacion);
  const diasAtraso = getDiasAtrasoUrgencia(reparacion);

  return (
    <div
      className='list-group-item list-group-item-action mb-2'
      onClick={onClick}
      style={{ cursor: 'pointer', borderLeft: urgente ? '4px solid #dc3545' : undefined }}
    >
      <div className='d-flex justify-content-between align-items-center'>
        <div>
          <h6 className='mb-1'>
            {urgente && (
              <>
                <span className='badge badge-danger mr-1' style={{ backgroundColor: '#dc3545', color: 'white', marginRight: 6 }}>⚡ Urgente</span>
                <span style={{ color: '#dc3545', fontSize: '0.8rem', marginRight: 6 }}>
                  {diasAtraso} {diasAtraso === 1 ? 'día' : 'días'}
                </span>
              </>
            )}
            {modeloNombre || reparacion.data.ModeloDroneNameRep || 'Modelo no especificado'}
          </h6>
          <p className='mb-1 text-muted'>{reparacion.data.NombreUsu}{reparacion.data.ApellidoUsu ? ` ${reparacion.data.ApellidoUsu}` : ''}</p>
        </div>
        <div className='d-flex flex-column align-items-end'>
          <span
            className='badge'
            style={{
              backgroundColor: estado?.color || '#6c757d',
              color: reparacion.data.EstadoRep === 'Recibido' ? 'white' : 'black'
            }}
          >
            {reparacion.data.EstadoRep}
          </span>
          <span
            className='badge mt-2'
            style={{
              color: 'black',
            }}
          >
            {estado.accion}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReparacionItem;
