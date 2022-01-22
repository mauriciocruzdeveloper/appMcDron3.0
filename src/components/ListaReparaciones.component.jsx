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

const ListaReparaciones = ({ 
  getReparaciones, 
  coleccionReparaciones, 
  isFetching,
  match
}) => {

  //PARA FORZAR LA CARGA DE LAS REPARACIONES AL INICIALIZAR
  useEffect(async () => {
    // Falta capturar los errores con el catch. getReparciones es una promesa.
    await getReparaciones();
  }, [getReparaciones]);


  return (
    <div 
      className="p-4" 
      style={{
        backgroundColor: "#EEEEEE",
        height: "100vh",
      }}>
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
          <small>{reparacion.data.UsuarioRep}</small>
          <p 
            className="mb-1" 
            style={{backgroundColor: estados[reparacion.data.EstadoRep].color}}
          >
            {reparacion.data.EstadoRep} - {estados[reparacion.data.EstadoRep].accion}
          </p>
        </div>
      ))}
    <Container>
      <Button
        className="bg-bluemcdron"
        styles={{
          color: lightColors.white
        }}
        // onClick={() => history.push(`/inicio/cargapresupuesto`)} VER BIEN!!!
      >Add</Button>
    </Container>
    </div>

  );
};

const mapStateToProps = (state) => ({
  coleccionReparaciones: state.app.coleccionReparaciones,
  isFetching: state.app.isFetching
});

export default connect( mapStateToProps, { getReparaciones } )( ListaReparaciones );