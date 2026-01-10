import React, { useState } from "react";
import { useHistory } from "../hooks/useHistory";
import { obtenerEstadoSeguro, esEstadoLegacy } from '../utils/estadosHelper';
import { useAppSelector } from "../redux-tool-kit/hooks/useAppSelector";
import { useAppDispatch } from "../redux-tool-kit/hooks/useAppDispatch";
import { 
  selectReparacionesFitradasYOrdenadas,
  selectReparacionFilter,
  setFilter 
} from "../redux-tool-kit/reparacion";
import { selectModelosDroneArray, selectColeccionModelosDrone } from "../redux-tool-kit/modeloDrone/modeloDrone.selectors";
import { selectDronesDictionary } from "../redux-tool-kit/drone/drone.selectors";

export default function ListaReparaciones(): JSX.Element {
  const dispatch = useAppDispatch();
  const history = useHistory();
  
  const reparacionesList = useAppSelector(selectReparacionesFitradasYOrdenadas);
  const filter = useAppSelector(selectReparacionFilter);
  const modelosDrone = useAppSelector(selectModelosDroneArray);
  const modelosDroneDictionary = useAppSelector(selectColeccionModelosDrone);
  const drones = useAppSelector(selectDronesDictionary);
  const [selectedModelo, setSelectedModelo] = useState<string>('');

  const handleOnChange = () => {
    dispatch(setFilter({
      ...filter,
      estadosPrioritarios: !filter.estadosPrioritarios,
    }));
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilter({
      ...filter,
      search: e.target.value,
    }));
  }

  const reparacionesFiltradas = reparacionesList.filter(reparacion => {
    if (!selectedModelo) return true;
    const drone = reparacion.data.DroneId ? drones[reparacion.data.DroneId] : undefined;
    if (!drone) return false;
    return drone.data.ModeloDroneId === selectedModelo;
  });

  return (
    <div className="p-4">
      <div className="card mb-3">
        <div className="card-body">
          <div className="d-flex">
            <label className="me-4">Estados Prioritarios</label>
            <input
              type="checkbox"
              className="custom-control-input"
              id="customCheck1"
              checked={filter.estadosPrioritarios}
              onChange={handleOnChange}
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              id="searchInput"
              placeholder="Buscar reparaciones..."
              value={filter.search}
              onChange={handleSearchChange}
            />
          </div>
          <div className='form-group mt-2'>
            <select
              className='form-control'
              value={selectedModelo}
              onChange={(e) => setSelectedModelo(e.target.value)}
            >
              <option value="">Todos los modelos</option>
              {modelosDrone.map(modelo => (
                <option key={modelo.id} value={modelo.id}>{modelo.data.NombreModelo}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="mb-2 text-muted">
          {reparacionesFiltradas.length} {reparacionesFiltradas.length === 1 ? 'reparación' : 'reparaciones'}
        </div>
      </div>

      {reparacionesFiltradas.length === 0 ? (
        <div className="alert alert-info text-center" role="alert">
          No hay reparaciones disponibles.
        </div>
      ) : (
        reparacionesFiltradas.map(reparacion => {
          const drone = reparacion.data.DroneId ? drones[reparacion.data.DroneId] : undefined;
          let modeloDroneName = reparacion.data.ModeloDroneNameRep;
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
            >
              <div className="d-flex w-100 justify-content-between">
                <h5 className="mb-1">{modeloDroneName}</h5>
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
          )
        })
      )}
    </div>
  );
}
