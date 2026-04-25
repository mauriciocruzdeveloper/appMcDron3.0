import React from "react";
import { useHistory } from "hooks/useHistory";
import { obtenerEstadoSeguro, esEstadoLegacy } from 'utils/estadosHelper';
import { useAppSelector } from "redux-tool-kit/hooks/useAppSelector";
import { selectColeccionModelosDrone } from "redux-tool-kit/modeloDrone/modeloDrone.selectors";
import { selectDronesDictionary } from "redux-tool-kit/drone/drone.selectors";
import { ReparacionType } from "types/reparacion";
import { esUrgente, getDiasAtrasoUrgencia } from "redux-tool-kit/reparacion/reparacion.selectors";

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

  if (reparaciones.length === 0) {
    return (
      <div className="alert alert-info text-center" role="alert">
        No hay reparaciones disponibles.
      </div>
    );
  }

  return (
    <>
      {reparaciones.map(reparacion => {
        const drone = reparacion.data.DroneId ? drones[reparacion.data.DroneId] : undefined;
        let modeloDroneName = reparacion.data.ModeloDroneNameRep;
        const urgente = esUrgente(reparacion);
        const diasAtraso = getDiasAtrasoUrgencia(reparacion);
        if (drone) {
          const modelo = modelosDroneDictionary[drone.data.ModeloDroneId];
          if (modelo) {
            modeloDroneName = modelo.data.NombreModelo;
          }
        }

        return (
          <div
            key={reparacion.id}
            className="card mb-3 p-1"
            aria-current="true"
            onClick={() => history.push(`/inicio/reparaciones/${reparacion.id}`)}
            style={{ cursor: 'pointer', borderLeft: urgente ? '4px solid #dc3545' : undefined }}
          >
            <div className="d-flex w-100 justify-content-between">
              <h5 className="mb-1">
                {urgente && (
                  <>
                    <span style={{ backgroundColor: '#dc3545', color: 'white', borderRadius: 4, padding: '2px 6px', fontSize: '0.75rem', marginRight: 6 }}>
                      ⚡ Urgente
                    </span>
                    <span style={{ color: '#dc3545', fontSize: '0.8rem', marginRight: 6 }}>
                      {diasAtraso} {diasAtraso === 1 ? 'día' : 'días'}
                    </span>
                  </>
                )}
                {modeloDroneName}
              </h5>
              {reparacion.data.PresuFiRep && (
                <div className="text-end">
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
          </div>
        );
      })}
    </>
  );
};

export default ReparacionesLista;
