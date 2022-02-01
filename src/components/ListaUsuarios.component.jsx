import { useEffect } from "react";
import { connect } from "react-redux";
import history from "../history";
import { 
  getUsuarios
} from "../redux/root-actions";
// JSON con los estados de las reparaciones
import { estados } from '../datos/estados.json';
// Estas son las importaciones de react-floating-action-button
// lightColors y darkColors pueden estar buenos... hay que probarlos
import { Container, Button, lightColors, darkColors } from 'react-floating-action-button';

const ListaUsuarios = ({ 
  getUsuarios, 
  coleccionUsuarios, 
  isFetching,
  match
}) => {

  //PARA FORZAR LA CARGA DE LAS REPARACIONES AL INICIALIZAR
  useEffect(async () => {
    // Falta capturar los errores con el catch. getReparciones es una promesa.
    await getUsuarios();
  }, [getUsuarios]);


  return (
    <div 
      className="p-4" 
      style={{
        backgroundColor: "#EEEEEE",
        height: "100vh",
      }}>
      {coleccionUsuarios.map(usuario => (
        <div
          key={usuario.id}
          value={usuario.id} 
          className="card mb-3 p-1" 
          aria-current="true"
          onClick={() => history.push(`/inicio/usuarios/${usuario.id}`)}
        >
          <div className="d-flex w-100 justify-content-between">
            <h5 className="mb-1">{usuario.data.NombreUsu} {usuario.data.ApellidoUsu}</h5>
          </div>
          <small>{usuario.id}</small>
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
  coleccionUsuarios: state.app.coleccionUsuarios,
  isFetching: state.app.isFetching
});

export default connect( mapStateToProps, { getUsuarios } )( ListaUsuarios );