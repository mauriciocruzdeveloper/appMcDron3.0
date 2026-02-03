import React from 'react';
import { useAppSelector } from 'redux-tool-kit/hooks/useAppSelector';
import { selectModeloNombreByReparacionId } from 'redux-tool-kit/reparacion/reparacion.selectors';

interface ReparacionItemProps {
  reparacion: any;
  estado: any;
  onClick: () => void;
}

const ReparacionItem = ({ reparacion, estado, onClick }: ReparacionItemProps): React.ReactElement => {
  const modeloNombre = useAppSelector(selectModeloNombreByReparacionId(reparacion.id));

  return (
    <div
      className='list-group-item list-group-item-action mb-2'
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className='d-flex justify-content-between align-items-center'>
        <div>
          <h6 className='mb-1'>{modeloNombre || reparacion.data.ModeloDroneNameRep || 'Modelo no especificado'}</h6>
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
