import React from "react";
import { useHistory } from "../hooks/useHistory";
import { estados } from '../datos/estados';
// Estas son las importaciones de react-floating-action-button
// lightColors y darkColors pueden estar buenos... hay que probarlos
import { useAppSelector } from "../redux-tool-kit/hooks/useAppSelector";
import { useAppDispatch } from "../redux-tool-kit/hooks/useAppDispatch";
import { 
  selectReparacionesFitradasYOrdenadas,
  selectReparacionFilter,
  setFilter 
} from "../redux-tool-kit/reparacion";

export default function ListaReparaciones(): JSX.Element {
  const dispatch = useAppDispatch();
  const history = useHistory();
  
  // Usar selector optimizado que ya incluye filtrado y ordenamiento
  const reparacionesList = useAppSelector(selectReparacionesFitradasYOrdenadas);
  const filter = useAppSelector(selectReparacionFilter);

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

  console.log("LISTA REPARACIONES");

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
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="mb-2 text-muted">
          {reparacionesList.length} {reparacionesList.length === 1 ? 'reparación' : 'reparaciones'}
        </div>
        {/* <button
          className="btn w-auto bg-bluemcdron text-white"
          onClick={() => history.push('/inicio/reparaciones/new')}
        >
          <i className="bi bi-plus-circle me-1"></i> Nueva Reparación
        </button> */}
      </div>

      {reparacionesList.length === 0 ? (
        <div className="alert alert-info text-center" role="alert">
          No hay reparaciones disponibles.
        </div>
      ) : (
        reparacionesList.map(reparacion => (
          <div
            key={reparacion.id}
            className="card mb-3 p-1"
            aria-current="true"
            onClick={() => history.push(`/inicio/reparaciones/${reparacion.id}`)}
          >
            <div className="d-flex w-100 justify-content-between">
              <h5 className="mb-1">{reparacion.data.DroneRep}</h5>
            </div>
            <small>{reparacion.data?.NombreUsu || reparacion.data?.UsuarioRep}</small>
            <p
              className="mb-1"
              style={{ backgroundColor: estados[reparacion.data.EstadoRep].color }}
            >
              {reparacion.data.EstadoRep} - {estados[reparacion.data.EstadoRep].accion}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
