import React from 'react';
import { useHistory } from 'hooks/useHistory';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from 'redux-tool-kit/hooks/useAppSelector';
import { selectReparacionesByRole } from 'redux-tool-kit/reparacion/reparacion.selectors';
import { estados } from 'datos/estados';
import ReparacionItem from './items/ReparacionItem.component';

/**
 * Vista de inicio para clientes (y partners por ahora)
 * Muestra solo las reparaciones propias que están en curso
 */
const InicioCliente = (): React.ReactElement => {
  const history = useHistory();
  const location = useLocation();
  const match = { path: location.pathname };
  
  // Obtener reparaciones del usuario (filtradas por rol y owner)
  const misReparaciones = useAppSelector(selectReparacionesByRole);
  
  // Filtrar solo las que están en curso (no finalizadas, canceladas o abandonadas)
  const reparacionesEnCurso = misReparaciones.filter(rep => {
    const estado = rep.data.EstadoRep;
    return estado !== 'Finalizado' && 
           estado !== 'Cancelado' && 
           estado !== 'Abandonado';
  });

  return (
    <div className='p-4'>
      <img className='mb-4' src='./img/logo.png' alt='McDron Logo' width='100%' style={{ maxWidth: '100px' }} />
      
      {/* Bienvenida */}
      <div className='mb-4'>
        <h4 className='text-center'>Mis Reparaciones</h4>
        <p className='text-muted text-center'>
          Aquí puedes ver el estado de tus reparaciones en curso
        </p>
      </div>

      {/* Lista de reparaciones en curso */}
      <div className='mb-4'>
        <h5 className='mb-3'>🔧 Reparaciones en Curso</h5>
        {reparacionesEnCurso.length > 0 ? (
          <div className='list-group'>
            {reparacionesEnCurso.map(reparacion => {
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
          <div className='text-center p-4 bg-light rounded'>
            <p className='text-muted mb-0'>No tienes reparaciones en curso</p>
            <small className='text-muted'>
              Puedes ver todas tus reparaciones en el menú &quot;Reparaciones&quot;
            </small>
          </div>
        )}
      </div>

      {/* Acceso rápido a mensajes */}
      <div className='mb-4'>
        <button 
          className='btn btn-primary w-100'
          onClick={() => history.push(`${match.path}/mensajes`)}
        >
          💬 Ver Mensajes
        </button>
      </div>
    </div>
  );
};

export default InicioCliente;
