import React from 'react';
import { useHistory } from 'hooks/useHistory';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from 'redux-tool-kit/hooks/useAppSelector';
import { selectReparacionesAccionInmediata } from 'redux-tool-kit/reparacion/reparacion.selectors';
import { estados } from 'datos/estados';
import ReparacionItem from './items/ReparacionItem.component';

const ReparacionesPrioritariasSection = (): React.ReactElement => {
  const history = useHistory();
  const location = useLocation();
  const match = { path: location.pathname };
  const reparacionesPrioritarias = useAppSelector(selectReparacionesAccionInmediata);

  return (
    <div className='mb-4'>
      <h5 className='mb-3'>⚡ Reparaciones Prioritarias</h5>
      {reparacionesPrioritarias.length > 0 ? (
        <div className='list-group'>
          {reparacionesPrioritarias.map(reparacion => {
            const estado = estados[reparacion.data.EstadoRep];
            return (
              <ReparacionItem
                key={reparacion.id}
                reparacion={reparacion}
                estado={estado}
                onClick={() => history.push(`${match.path}/reparaciones/${reparacion.id}`)}
              />
            );
          })}
        </div>
      ) : (
        <p className='text-muted'>No hay reparaciones que requieran acción inmediata</p>
      )}
    </div>
  );
};

export default ReparacionesPrioritariasSection;
