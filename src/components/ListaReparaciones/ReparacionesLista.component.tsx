import React from "react";
import { useHistory } from "hooks/useHistory";
import { obtenerEstadoSeguro, esEstadoLegacy } from 'utils/estadosHelper';
import { useAppSelector } from "redux-tool-kit/hooks/useAppSelector";
import { selectColeccionModelosDrone } from "redux-tool-kit/modeloDrone/modeloDrone.selectors";
import { selectDronesDictionary } from "redux-tool-kit/drone/drone.selectors";
import { ReparacionType } from "types/reparacion";
import { esUrgente, getDiasAtrasoUrgencia, selectReparacionesConRepuestoFaltante } from "redux-tool-kit/reparacion/reparacion.selectors";

interface ReparacionesListaProps {
  reparaciones: ReparacionType[];
}

/**
 * Componente que renderiza la lista de reparaciones.
 * Muestra las reparaciones filtradas o según el rol del usuario.
 */
const ReparacionesLista = ({ reparaciones }: ReparacionesListaProps): React.ReactElement => {
  const history = useHistory();
  const modelosDroneDictionary = useAppSelector(selectColeccionModelosDrone);
  const drones = useAppSelector(selectDronesDictionary);
  const reparacionesConRepuestoFaltante = useAppSelector(selectReparacionesConRepuestoFaltante);

  if (reparaciones.length === 0) {
    return (
      <div className="alert alert-info text-center" role="alert">
        No hay reparaciones disponibles.
      </div>
    );
  }

  // Agrupar por estado, ordenando los grupos por prioridad (1 = más urgente) y luego por etapa.
  const grupos = new Map<string, ReparacionType[]>();
  reparaciones.forEach(reparacion => {
    const nombreEstado = reparacion.data.EstadoRep;
    const grupo = grupos.get(nombreEstado);
    if (grupo) {
      grupo.push(reparacion);
    } else {
      grupos.set(nombreEstado, [reparacion]);
    }
  });
  const gruposOrdenados = Array.from(grupos.entries()).sort(([estadoA], [estadoB]) => {
    const infoA = obtenerEstadoSeguro(estadoA);
    const infoB = obtenerEstadoSeguro(estadoB);
    if (infoA.prioridad !== infoB.prioridad) return infoA.prioridad - infoB.prioridad;
    return infoA.etapa - infoB.etapa;
  });

  const renderReparacion = (reparacion: ReparacionType): React.ReactElement => {
    const drone = reparacion.data.DroneId ? drones[reparacion.data.DroneId] : undefined;
    let modeloDroneName = reparacion.data.ModeloDroneNameRep;
    const urgente = esUrgente(reparacion);
    const diasAtraso = getDiasAtrasoUrgencia(reparacion);
    const faltanRepuestos = reparacionesConRepuestoFaltante.has(reparacion.id);
    if (drone) {
      const modelo = modelosDroneDictionary[drone.data.ModeloDroneId];
      if (modelo) {
        modeloDroneName = modelo.data.NombreModelo;
      }
    }

    return (
      <div
        key={reparacion.id}
        className="card p-1 reparaciones-card"
        aria-current="true"
        onClick={() => history.push(`/inicio/reparaciones/${reparacion.id}`)}
        style={{ cursor: 'pointer', borderLeft: urgente ? '4px solid #dc3545' : undefined }}
      >
        <div className="d-flex w-100 justify-content-between align-items-start reparaciones-card-header">
          <h5 className="mb-1 reparaciones-card-title">{modeloDroneName}</h5>
          {reparacion.data.PresuFiRep && (
            <div className="text-end flex-shrink-0 ms-2">
              <strong className="text-success">${reparacion.data.PresuFiRep.toLocaleString()}</strong>
            </div>
          )}
        </div>
        <small>{reparacion.data?.NombreUsu || reparacion.data?.UsuarioRep}</small>
        {(() => {
          const estadoInfo = obtenerEstadoSeguro(reparacion.data.EstadoRep);
          const isLegacy = esEstadoLegacy(reparacion.data.EstadoRep);

          return (
            <div>
              <p
                className="mb-1"
                style={{ 
                  backgroundColor: estadoInfo.color,
                  border: isLegacy ? '2px solid #ffc107' : 'none',
                  borderRadius: '4px',
                  padding: '4px 8px'
                }}
              >
                {reparacion.data.EstadoRep} - {estadoInfo.accion}
                {isLegacy && (
                  <span 
                    className="badge badge-warning ml-2" 
                    title="Estado legacy - requiere actualización"
                  >
                    ⚠️ Legacy
                  </span>
                )}
              </p>
            </div>
          );
        })()}
        <div className={`reparaciones-card-alerts d-flex flex-wrap gap-1 ${urgente || faltanRepuestos ? '' : 'reparaciones-card-alerts-empty'}`}>
          {urgente && (
            <>
              <span style={{ backgroundColor: '#dc3545', color: 'white', borderRadius: 4, padding: '2px 6px', fontSize: '0.75rem' }}>
                ⚡ Urgente
              </span>
              <span style={{ color: '#dc3545', fontSize: '0.8rem' }}>
                {diasAtraso} {diasAtraso === 1 ? 'día' : 'días'}
              </span>
            </>
          )}
          {faltanRepuestos && (
            <span style={{ backgroundColor: '#dc3545', color: 'white', borderRadius: 4, padding: '2px 6px', fontSize: '0.75rem' }}>
              ⚠️ Repuesto sin cobertura
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="reparaciones-grupos">
      {gruposOrdenados.map(([nombreEstado, reparacionesDelEstado]) => {
        const estadoInfo = obtenerEstadoSeguro(nombreEstado);
        return (
          <section key={nombreEstado} className="reparaciones-grupo" aria-label={`Reparaciones en estado ${nombreEstado}`}>
            <h6 className="reparaciones-grupo-titulo">
              <span
                className="reparaciones-grupo-color"
                style={{ backgroundColor: estadoInfo.color }}
              ></span>
              {nombreEstado}
              <span className="badge bg-secondary ms-2">{reparacionesDelEstado.length}</span>
            </h6>
            <div className="reparaciones-grupo-grid">
              {reparacionesDelEstado.map(renderReparacion)}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default ReparacionesLista;
