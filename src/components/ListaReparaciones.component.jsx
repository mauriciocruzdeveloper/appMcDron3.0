import { useEffect } from "react";
import { connect } from "react-redux";
import history from "../history";
import { 
  getReparaciones
} from "../redux/root-actions";
// JSON con los estados de las reparaciones
import { estados } from '../datos/estados.json';
// Estas son las importaciones de react-floating-action-button
// lightColors y darkColors pueden estar buenos... hay que probarlos
import { Container, Button, lightColors, darkColors } from 'react-floating-action-button';
import { useCallback } from "react";

const ListaReparaciones = ({ 
  getReparaciones, 
  coleccionReparaciones,
  usuario
}) => {

  // Busco las reparaciones al backup sólo cuando la colección está vacía.
  const iniciarFormulario = useCallback(async () => {
    if(!coleccionReparaciones?.length) await getReparaciones(usuario); 
  }, [getReparaciones]);
   

  //PARA FORZAR LA CARGA DE LAS REPARACIONES AL INICIALIZAR
  useEffect(() => {
    iniciarFormulario();
  }, [iniciarFormulario]);

  console.log("LISTA REPARACIONES");

  return (
    <div className="p-4">
      {coleccionReparaciones.map(reparacion => (
        <div
          key={reparacion.id}
          value={reparacion.id} 
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

const mapStateToProps = (state) => ({
  coleccionReparaciones: state.app.coleccionReparaciones,
  isFetching: state.app.isFetching,
  usuario: state.app.usuario
});

export default connect( mapStateToProps, { getReparaciones } )( ListaReparaciones );