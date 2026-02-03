import React from 'react';
import { useHistory } from 'hooks/useHistory';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from 'redux-tool-kit/hooks/useAppSelector';
import { selectReparacionesEnRepuestos, selectCantidadEnRepuestos } from 'redux-tool-kit/reparacion/reparacion.selectors';
import { estados } from 'datos/estados';

const ReparacionesEsperandoRepuestosSection = (): React.ReactElement => {
  const history = useHistory();
  const location = useLocation();
  const match = { path: location.pathname };
  const reparacionesEnRepuestos = useAppSelector(selectReparacionesEnRepuestos);
  const cantidadEnRepuestos = useAppSelector(selectCantidadEnRepuestos);
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className='mb-4'>
      <div
        className='d-flex justify-content-between align-items-center mb-3'
        onClick={() => setExpanded(!expanded)}
        style={{ cursor: 'pointer' }}
      >
        <h5 className='mb-0'>⏸️ Esperando Repuestos</h5>
        <div className='d-flex align-items-center'>
          {cantidadEnRepuestos > 0 && (
            <span className='badge bg-warning text-dark me-2'>{cantidadEnRepuestos}</span>
          )}
          <i className={`bi bi-chevron-${expanded ? 'up' : 'down'}`}></i>
        </div>
      </div>
      {expanded && (
        reparacionesEnRepuestos.length > 0 ? (
          <div className='list-group'>
            {reparacionesEnRepuestos.map(reparacion => {
              const estado = estados.Repuestos;
              return (
                <div
                  key={reparacion.id}
                  className='list-group-item list-group-item-action mb-2'
                  onClick={() => history.push(`${match.path}/reparaciones/${reparacion.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className='d-flex justify-content-between align-items-center'>
                    <div style={{ flex: 1 }}>
                      <h6 className='mb-1'>
                        {reparacion.data.ModeloDroneNameRep || 'Modelo no especificado'}
                      </h6>
                      <p className='mb-1 text-muted'>
                        {reparacion.data.NombreUsu}{reparacion.data.ApellidoUsu ? ` ${reparacion.data.ApellidoUsu}` : ''}
                      </p>
                      {reparacion.data.ObsRepuestos && (
                        <small className='text-muted'>
                          📝 {reparacion.data.ObsRepuestos.substring(0, 80)}
                          {reparacion.data.ObsRepuestos.length > 80 ? '...' : ''}
                        </small>
                      )}
                    </div>
                    <div className='d-flex flex-column align-items-end ms-3'>
                      <span
                        className='badge'
                        style={{
                          backgroundColor: estado?.color || '#ffc107',
                          color: 'black'
                        }}
                      >
                        {reparacion.data.EstadoRep}
                      </span>
                      <span className='badge mt-2' style={{ color: 'black' }}>
                        {estado?.accion || 'Esperar repuestos'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className='text-muted'>No hay reparaciones esperando repuestos</p>
        )
      )}
    </div>
  );
};

export default ReparacionesEsperandoRepuestosSection;
