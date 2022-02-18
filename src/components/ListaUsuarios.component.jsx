import { useEffect, useCallback } from "react";
import { connect } from "react-redux";
import history from "../history";
import { 
  getUsuarios,
  escuchaUsuarios
} from "../redux/root-actions";
// JSON con los estados de las reparaciones
import { estados } from '../datos/estados.json';
// Estas son las importaciones de react-floating-action-button
// lightColors y darkColors pueden estar buenos... hay que probarlos
import { Container, Button, lightColors, darkColors } from 'react-floating-action-button';

const ListaUsuarios = ({ 
  getUsuarios, 
  coleccionUsuarios,
  escuchaUsuarios
}) => {

  // iniciarFormulario contiene la lógica que va dentro del useEffect.
  // Tiene que ser así porque no se recomienda usar funciones asincrónicas
  // dentro del useEffect. Además hay que usar useCallback para que no se 
  // ejecute una y otra vez, entrando en bucle, cuando se renderiza el componente.
  const iniciarFormulario = useCallback(async () => {
    console.log("coleccion: " + coleccionUsuarios?.length);
    // Cuando la colección está vacía, se llena mediante el backend, y queda en escucha
    // para cuando cambie la base de datos ésta actualice la colección en redux automáticamente.
    if(!coleccionUsuarios?.length) await escuchaUsuarios(); 
  }, [escuchaUsuarios]);

  //PARA FORZAR LA CARGA DE LOS USUARIOS AL INICIALIZAR
  useEffect(() => {
    console.log("useEffect()");
    // Falta capturar los errores con el catch. getReparciones es una promesa.
    iniciarFormulario();
  }, [iniciarFormulario]);


  return (
    <div 
      className="p-4" 
      style={{
        backgroundColor: "#EEEEEE",
        // height: "100%",
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
          <small>{usuario?.data?.EmailUsu}</small>
        </div>
      ))}
    </div>

  );
};

const mapStateToProps = (state) => ({
  coleccionUsuarios: state.app.coleccionUsuarios,
  isFetching: state.app.isFetching
});

export default connect( mapStateToProps, { getUsuarios, escuchaUsuarios } )( ListaUsuarios );