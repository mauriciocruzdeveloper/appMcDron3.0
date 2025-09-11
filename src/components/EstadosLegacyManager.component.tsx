import React from 'react';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { 
  selectReparacionesConEstadosLegacy, 
  selectEstadisticasMigracion 
} from '../redux-tool-kit/reparacion/reparacion.selectors';
import { migrarEstadoLegacyAsync } from '../redux-tool-kit/reparacion/reparacion.actions';
import { useHistory } from '../hooks/useHistory';
import MigradorEntregadoFinalizado from './MigradorEntregadoFinalizado.component';

/**
 * Componente para gestionar reparaciones con estados legacy
 * Muestra estadísticas y permite navegar a las reparaciones que requieren actualización
 */
export default function EstadosLegacyManager(): JSX.Element {
  const dispatch = useAppDispatch();
  const history = useHistory();
  
  const reparacionesLegacy = useAppSelector(selectReparacionesConEstadosLegacy);
  const estadisticas = useAppSelector(selectEstadisticasMigracion);

  const handleMigrarEstado = async (reparacionId: string, nuevoEstado: string) => {
    try {
      await dispatch(migrarEstadoLegacyAsync({ 
        reparacionId, 
        nuevoEstado 
      })).unwrap();
    } catch (error) {
      console.error('Error al migrar estado:', error);
    }
  };

  const handleVerReparacion = (reparacionId: string) => {
    history.push(`/inicio/reparaciones/${reparacionId}`);
  };

  if (reparacionesLegacy.length === 0) {
    return (
      <div className="alert alert-success" role="alert">
        <h5 className="alert-heading">✅ Sin Estados Legacy</h5>
        <p className="mb-0">
          Todas las reparaciones tienen estados actualizados del nuevo sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header bg-warning text-dark">
        <h5 className="card-title mb-0">
          ⚠️ Gestión de Estados Legacy
        </h5>
      </div>
      
      <div className="card-body">
        {/* Estadísticas */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="text-center">
              <h3 className="text-warning">{estadisticas.conEstadosLegacy}</h3>
              <small className="text-muted">Reparaciones Legacy</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-center">
              <h3 className="text-info">{estadisticas.total}</h3>
              <small className="text-muted">Total Reparaciones</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-center">
              <h3 className="text-primary">{estadisticas.porcentajeLegacy}%</h3>
              <small className="text-muted">% Legacy</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-center">
              <h3 className="text-secondary">{Object.keys(estadisticas.estadisticasLegacy).length}</h3>
              <small className="text-muted">Estados Diferentes</small>
            </div>
          </div>
        </div>

        {/* Distribución por estado */}
        <div className="mb-4">
          <h6>Distribución por Estado Legacy:</h6>
          <div className="row">
            {Object.entries(estadisticas.estadisticasLegacy).map(([estado, cantidad]) => (
              <div key={estado} className="col-md-4 mb-2">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="badge badge-warning">{estado}</span>
                  <span className="badge badge-secondary">{cantidad}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lista de reparaciones */}
        <h6>Reparaciones que Requieren Actualización:</h6>
        <div className="list-group">
          {reparacionesLegacy.map((reparacion) => (
            <div key={reparacion.id} className="list-group-item">
              <div className="d-flex w-100 justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">
                    ID: {reparacion.id}
                    <span className="badge badge-warning ml-2">
                      {reparacion.data.EstadoRep}
                    </span>
                  </h6>
                  <p className="mb-1">
                    <strong>Cliente:</strong> {reparacion.data?.NombreUsu || reparacion.data?.UsuarioRep || 'No especificado'}
                  </p>
                  <small className="text-muted">
                    <strong>Drone:</strong> {reparacion.data?.ModeloDroneNameRep || 'No especificado'}
                  </small>
                </div>
                <div className="btn-group-vertical">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleVerReparacion(reparacion.id)}
                    title="Ver detalles de la reparación"
                  >
                    👁️ Ver
                  </button>
                  <button
                    className="btn btn-sm btn-outline-success"
                    onClick={() => handleMigrarEstado(reparacion.id, 'Indefinido')}
                    title="Marcar como indefinido para revisión manual"
                  >
                    🔄 A Indefinido
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Migrador automático para Entregado → Finalizado */}
        <MigradorEntregadoFinalizado />

        {/* Instrucciones */}
        <div className="alert alert-info mt-4" role="alert">
          <h6 className="alert-heading">💡 Instrucciones:</h6>
          <ul className="mb-0">
            <li><strong>Ver:</strong> Navega a la reparación para revisar detalles y asignar el estado correcto manualmente.</li>
            <li><strong>A Indefinido:</strong> Marca temporalmente como &quot;Indefinido&quot; para revisión posterior.</li>
            <li><strong>Estados Legacy:</strong> {Object.keys(estadisticas.estadisticasLegacy).join(', ')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
