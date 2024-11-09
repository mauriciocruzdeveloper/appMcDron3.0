import { useEffect, useState } from "react";
import { connect } from "react-redux";
import history from "../history";
import {
  getReparaciones
} from "../redux/root-actions";
import { estados } from '../datos/estados';
// Estas son las importaciones de react-floating-action-button
// lightColors y darkColors pueden estar buenos... hay que probarlos
import { useCallback } from "react";
import { ReparacionType } from "../types/reparacion";
import { ClienteType } from "../types/usuario";
import { RootState } from "../redux/App/App.reducer";
import { Filtro } from "../interfaces/Filtro";

interface ListaReparacionesProps {
  getReparaciones: (usuario: ClienteType, filter: Filtro | null) => void; // TODO: Revisar los tipos de los argumentos.
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

  const iniciarFormulario = useCallback(async () => {
    if (!coleccionReparaciones?.length) await getReparaciones(usuario, filter);
  }, [getReparaciones]);

  useEffect(() => {
    iniciarFormulario();
  }, [iniciarFormulario]);

  useEffect(() => {
    getReparaciones(usuario, filter);
  }, [filter]);

  const handleOnChange = () => {
    setFilter({
      ...filter,
      estadosPrioritarios: !filter.estadosPrioritarios,
    });
  }

  console.log("LISTA REPARACIONES");

  return (
    <div className="p-4">

      <div className="card mb-3">
        <div className="card-body d-flex justify-content-between">
          <label className="custom-control-label">Estados Prioritarios</label>
          <input
            type="checkbox"
            className="custom-control-input"
            id="customCheck1"
            checked={filter.estadosPrioritarios}
            onChange={handleOnChange}
          />
        </div>
      </div>

      {coleccionReparaciones.map(reparacion => (
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
  usuario: state.app.usuario
});

export default connect(mapStateToProps, { getReparaciones })(ListaReparaciones);