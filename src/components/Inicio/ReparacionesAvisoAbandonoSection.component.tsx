import React from 'react';
import { useHistory } from 'hooks/useHistory';
import { useAppSelector } from 'redux-tool-kit/hooks/useAppSelector';
import { selectReparacionesListasParaAvisoAbandono } from 'redux-tool-kit/reparacion/reparacion.selectors';
import { convertTimestampCORTO } from 'utils/utils';

const ReparacionesAvisoAbandonoSection = (): React.ReactElement => {
  const history = useHistory();
  const [ahora] = React.useState(() => Date.now());
  const reparaciones = useAppSelector(state =>
    selectReparacionesListasParaAvisoAbandono(state, ahora)
  );

  return (
    <div className='mb-4'>
      <div className='d-flex justify-content-between align-items-center mb-3'>
        <h5 className='mb-0'>
          <i className='bi bi-exclamation-triangle me-2' aria-hidden='true'></i>
          Avisos de abandono pendientes
        </h5>
        {reparaciones.length > 0 && (
          <span className='badge bg-warning text-dark'>{reparaciones.length}</span>
        )}
      </div>

      {reparaciones.length > 0 ? (
        <div className='list-group'>
          {reparaciones.map(reparacion => (
            <button
              key={reparacion.id}
              type='button'
              className='list-group-item list-group-item-action mb-2 text-start'
              onClick={() => history.push(`/inicio/reparaciones/${reparacion.id}`)}
            >
              <div className='d-flex justify-content-between align-items-start gap-3'>
                <div>
                  <h6 className='mb-1'>
                    {reparacion.data.ModeloDroneNameRep || 'Modelo no especificado'}
                  </h6>
                  <p className='mb-1 text-muted'>
                    {reparacion.data.NombreUsu}
                    {reparacion.data.ApellidoUsu ? ` ${reparacion.data.ApellidoUsu}` : ''}
                  </p>
                  <small className='text-muted'>
                    Ingresado: {convertTimestampCORTO(reparacion.data.FeRecRep)}
                  </small>
                </div>
                <div className='d-flex flex-column align-items-end gap-2'>
                  <span className='badge bg-secondary'>{reparacion.data.EstadoRep}</span>
                  <span className='badge bg-warning text-dark'>Enviar aviso</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <p className='mb-0 text-muted'>No hay avisos de abandono pendientes</p>
      )}
    </div>
  );
};

export default ReparacionesAvisoAbandonoSection;