import React from "react";
import { useEffect, useState } from "react";
import history from "../history";
import { estados } from '../datos/estados';
// Estas son las importaciones de react-floating-action-button
// lightColors y darkColors pueden estar buenos... hay que probarlos
import { ReparacionType } from "../types/reparacion";
import { Filtro } from "../interfaces/Filtro";
import { getReparacionesAsync } from "../redux-tool-kit/slices/appSlice";
import { useAppDispatch } from "../redux-tool-kit/hooks/useAppDispatch";
import { useAppSelector } from "../redux-tool-kit/hooks/useAppSelector";

export const ListaReparaciones = () => {
  const dispatch = useAppDispatch();
  const reparaciones = useAppSelector(state => state.app.coleccionReparaciones);

  const [filter, setFilter] = useState<Filtro>({
    estadosPrioritarios: true,
    search: ''
  });
  const [reparacionesList, setReparacionesList] = useState<ReparacionType[]>([]);

  useEffect(() => {
    const unsubscribe = dispatch(getReparacionesAsync());
    
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    };
  }, []);

  useEffect(() => {
    if (reparaciones.length) {
      const reparacionesFiltered = reparaciones.filter(reparacion => {
        const noPrioritarios = ["Entregado", "Liquidación", "Trabado"];
        const estadosNoIncluidos = filter.estadosPrioritarios ? noPrioritarios : [''];
        const incluirPorEstado = !estadosNoIncluidos.includes(reparacion.data.EstadoRep);
        let incluirPorSearch = true;
        if (filter.search) {
          incluirPorSearch = reparacion.data.DroneRep.toLowerCase().includes(filter.search.toLowerCase())
            || reparacion.data.NombreUsu?.toLowerCase().includes(filter.search.toLowerCase())
            || reparacion.data.UsuarioRep?.toLowerCase().includes(filter.search.toLowerCase())
            || reparacion.data.EmailUsu?.toLowerCase().includes(filter.search.toLowerCase());
        }
        return incluirPorEstado && incluirPorSearch;
      });
      setReparacionesList(reparacionesFiltered);
    }
  }, [reparaciones, filter.estadosPrioritarios, filter.search]);

  const handleOnChange = () => {
    setFilter({
      ...filter,
      estadosPrioritarios: !filter.estadosPrioritarios,
    });
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter({
      ...filter,
      search: e.target.value,
    });
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

      {reparacionesList.map(reparacion => (
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
      ))}
    </div>
  );
};
