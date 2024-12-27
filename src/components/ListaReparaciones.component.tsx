import React from "react";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import history from "../history";
import {
  getReparaciones
} from "../redux/root-actions";
import { estados } from '../datos/estados';
// Estas son las importaciones de react-floating-action-button
// lightColors y darkColors pueden estar buenos... hay que probarlos
import { ReparacionType } from "../types/reparacion";
import { ClienteType } from "../types/usuario";
import { RootState } from "../redux/App/App.reducer";
import { Filtro } from "../types/Filtro";

interface ListaReparacionesProps {
  getReparaciones: (usuario: ClienteType) => void; // TODO: Revisar los tipos de los argumentos.
  coleccionReparaciones: ReparacionType[];
  isFetching: boolean;
  usuario: ClienteType;
}

const ListaReparaciones = (props: ListaReparacionesProps) => {
  const {
    getReparaciones,
    coleccionReparaciones,
    usuario,
  } = props;

  const [filter, setFilter] = useState<Filtro>({
    estadosPrioritarios: true,
    search: ''
  });
  const [reparacionesList, setReparacionesList] = useState<ReparacionType[]>([]);

  useEffect(() => {
    getReparaciones(usuario);
  }, []);

  useEffect(() => {
    if (coleccionReparaciones.length) {
      const reparaciones = coleccionReparaciones.filter(reparacion => {
        const noPrioritarios = ["Entregado", "Liquidación", "Trabado"];
        const estadosNoIncluidos = filter.estadosPrioritarios ? noPrioritarios : [''];
        const incluirPorEstado = !estadosNoIncluidos.includes(reparacion.data.EstadoRep) && !filter.search;
        let incluirPorSearch = false;
        if (filter.search) {
          incluirPorSearch = reparacion.data.DroneRep.toLowerCase().includes(filter.search.toLowerCase())
            || reparacion.data.NombreUsu?.toLowerCase().includes(filter.search.toLowerCase())
            || reparacion.data.UsuarioRep?.toLowerCase().includes(filter.search.toLowerCase())
            || reparacion.data.EmailUsu?.toLowerCase().includes(filter.search.toLowerCase());
        }
        return incluirPorSearch || incluirPorEstado;
      });
      setReparacionesList(reparaciones);
    }
  }, [coleccionReparaciones, filter.estadosPrioritarios, filter.search]);

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
      {/* <Container>
      <Button
        className="bg-bluemcdron"
        styles={{
          color: lightColors.white
        }}
        // onClick={() => history.push(`/inicio/cargapresupuesto`)} VER BIEN!!!
      >Add</Button>
    </Container> */}
    </div>

  );
};

const mapStateToProps = (state: RootState) => ({
  coleccionReparaciones: state.app.coleccionReparaciones,
  isFetching: state.app.isFetching,
  usuario: state.app.usuario,
});

export default connect(mapStateToProps, { getReparaciones })(ListaReparaciones);