import React, { useState } from "react";
import { useAppSelector } from "redux-tool-kit/hooks/useAppSelector";
import { useAppDispatch } from "redux-tool-kit/hooks/useAppDispatch";
import { selectReparacionFilter, setFilter } from "redux-tool-kit/reparacion";
import { selectModelosDroneArray } from "redux-tool-kit/modeloDrone/modeloDrone.selectors";

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

  return (
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
            onChange={(e) => onModeloChange(e.target.value)}
          >
            <option value="">Todos los modelos</option>
            {modelosDrone.map(modelo => (
              <option key={modelo.id} value={modelo.id}>{modelo.data.NombreModelo}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ReparacionesFiltro;
