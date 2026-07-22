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
    <div className='app-page'>
      <header className='app-page-header'>
        <div>
          <h3 className='mb-1'>Mis reparaciones</h3>
          <p className='mb-0 text-muted'>Seguimiento de trabajos en curso</p>
        </div>
        <img className='app-page-logo' src='./img/logo.png' alt='McDron' />
      </header>

      <main className='app-page-content client-dashboard-grid'>
        <section className='client-repairs-panel'>
          <h5 className='dashboard-section-title'>
            <i className='bi bi-tools'></i>
            Reparaciones en curso
          </h5>
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
        </section>

        <aside className='client-quick-panel'>
          <i className='bi bi-chat-dots client-quick-icon'></i>
          <h5>Mensajes</h5>
          <p className='text-muted'>Consultas y novedades sobre tus reparaciones.</p>
          <button 
            className='btn bg-bluemcdron text-white w-100'
            onClick={() => history.push(`${match.path}/mensajes`)}
          >
            Ver mensajes
          </button>
        </aside>
      </main>
    </div>
  );
};

export default InicioCliente;
