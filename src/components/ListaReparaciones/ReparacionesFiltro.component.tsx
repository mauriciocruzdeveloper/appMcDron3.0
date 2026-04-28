import React, { useState } from "react";
import { useAppSelector } from "redux-tool-kit/hooks/useAppSelector";
import { useAppDispatch } from "redux-tool-kit/hooks/useAppDispatch";
import { selectReparacionFilter, setFilter } from "redux-tool-kit/reparacion";
import { selectModelosDroneArray } from "redux-tool-kit/modeloDrone/modeloDrone.selectors";
import { estados } from "datos/estados";

const ESTADOS_REPARACION = [
  "Consulta", "Respondido", "Transito", "Recibido", "Revisado",
  "Presupuestado", "Aceptado", "Repuestos", "Rechazado", "Reparado",
  "Diagnosticado", "Cobrado", "Enviado", "Finalizado", "Abandonado", "Cancelado",
];

interface ReparacionesFiltroProps {
  selectedModelo: string;
  onModeloChange: (modelo: string) => void;
}

/**
 * Componente de filtros para la lista de reparaciones.
 * Solo visible para administradores.
 */
const ReparacionesFiltro = ({ selectedModelo, onModeloChange }: ReparacionesFiltroProps): React.ReactElement => {
  const dispatch = useAppDispatch();
  const filter = useAppSelector(selectReparacionFilter);
  const modelosDrone = useAppSelector(selectModelosDroneArray);
  const [abierto, setAbierto] = useState(false);

  const filtrosActivos =
    filter.search.trim() !== '' ||
    selectedModelo !== '' ||
    (filter.estadosReparacion ?? []).length > 0 ||
    !filter.estadosPrioritarios;

  const handleOnChange = () => {
    dispatch(setFilter({
      ...filter,
      estadosPrioritarios: !filter.estadosPrioritarios,
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilter({
      ...filter,
      search: e.target.value,
    }));
  };

  const toggleEstado = (estado: string) => {
    const actuales = filter.estadosReparacion ?? [];
    const nuevos = actuales.includes(estado)
      ? actuales.filter(e => e !== estado)
      : [...actuales, estado];
    dispatch(setFilter({ ...filter, estadosReparacion: nuevos }));
  };

  return (
    <div className="card mb-3">
      <div
        className="card-header d-flex justify-content-between align-items-center"
        style={{ cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setAbierto(prev => !prev)}
      >
        <span className="fw-semibold">
          Filtros
          {filtrosActivos && (
            <span
              className="ms-2 badge rounded-pill"
              style={{ backgroundColor: '#007aff', fontSize: '0.7rem' }}
            >
              activos
            </span>
          )}
        </span>
        <span>{abierto ? '▲' : '▼'}</span>
      </div>
      {abierto && (
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
            onChange={(e) => onModeloChange(e.target.value)}
          >
            <option value="">Todos los modelos</option>
            {modelosDrone.map(modelo => (
              <option key={modelo.id} value={modelo.id}>{modelo.data.NombreModelo}</option>
            ))}
          </select>
        </div>
        <div className="mt-3">
          <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 g-2">
            {ESTADOS_REPARACION.map(estado => {
              const color = estados[estado]?.color ?? '#8e8e93';
              const seleccionado = (filter.estadosReparacion ?? []).includes(estado);
              return (
                <div key={estado} className="col">
                  <button
                    type="button"
                    onClick={() => toggleEstado(estado)}
                    style={{
                      backgroundColor: seleccionado ? color : 'transparent',
                      color: seleccionado ? '#fff' : color,
                      border: `2px solid ${color}`,
                      borderRadius: '16px',
                      padding: '3px 10px',
                      fontSize: '0.78rem',
                      fontWeight: seleccionado ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      lineHeight: 1.4,
                      width: '100%',
                      textAlign: 'center',
                    }}
                  >
                    {estado}
                  </button>
                </div>
              );
            })}
          </div>
          {(filter.estadosReparacion ?? []).length > 0 && (
            <button
              type="button"
              className="btn btn-link btn-sm p-0 mt-1 text-muted"
              onClick={() => dispatch(setFilter({ ...filter, estadosReparacion: [] }))}
            >
              Limpiar estados
            </button>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

export default ReparacionesFiltro;
