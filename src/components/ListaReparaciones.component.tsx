import { useEffect, useState } from "react";
import { connect } from "react-redux";
import history from "../history";
import { 
  getReparaciones
} from "../redux/root-actions";
import { estados } from '../datos/estados.js';
// Estas son las importaciones de react-floating-action-button
// lightColors y darkColors pueden estar buenos... hay que probarlos
import { useCallback } from "react";
import { ReparacionType } from "../types/reparacion";
import { ClienteType } from "../types/usuario";
import { RootState } from "../redux/App/App.reducer";

interface ListaReparacionesProps {
  getReparaciones: (usuario: ClienteType, filter: string[] | null) => void; // TODO: Revisar los tipos de los argumentos.
  coleccionReparaciones: ReparacionType[];
  isFetching: boolean;
  usuario: ClienteType;
}

const ListaReparaciones = (props: ListaReparacionesProps) => {
  const { 
    getReparaciones, 
    coleccionReparaciones,
    usuario
  } = props;

  const [ filter, setFilter ] = useState<boolean>(true);

  // TODO: Hacer enum de estados.
  const noPrioritarios = [ "Entregado", "Liquidación", "Trabado" ];

  const iniciarFormulario = useCallback(async () => {
    console.log("iniciarFormulario()");
    if(!coleccionReparaciones?.length) await getReparaciones(usuario, filter ? noPrioritarios : null); 
  }, [getReparaciones]);
   
  useEffect(() => {
    iniciarFormulario();
  }, [iniciarFormulario]);

  const handleOnChange = (value: boolean) => {
    setFilter(value);
    getReparaciones(usuario, !filter ? noPrioritarios : [ '' ]);
  }

  console.log("LISTA REPARACIONES");

  return (
      <div className="p-4">

        <div className="card mb-3">
          <div className="card-body d-flex justify-content-between">
            <label className="custom-control-label">Filtrar No Prioritarios</label>
            <input 
                type="checkbox" 
                className="custom-control-input" 
                id="customCheck1"
                checked={filter}
                onChange={e => handleOnChange(!filter)}
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
            style={{backgroundColor: estados[reparacion.data.EstadoRep].color}}
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

export default connect( mapStateToProps, { getReparaciones } )( ListaReparaciones );