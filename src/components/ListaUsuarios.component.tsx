import { useEffect, useCallback } from "react";
import { connect } from "react-redux";
import history from "../history";
import { 
  getUsuarios
} from "../redux/root-actions";
// Estas son las importaciones de react-floating-action-button
// lightColors y darkColors pueden estar buenos... hay que probarlos
// import { Container, Button, lightColors, darkColors } from 'react-floating-action-button';
import { RootState } from "../redux/App/App.reducer";
import { ClienteType } from "../types/usuario";

interface ListaUsuariosProps {
  getUsuarios: () => void;
  coleccionUsuarios: ClienteType[];
  isFetching: boolean;
}

const ListaUsuarios = (props: ListaUsuariosProps) => {
  const { 
    coleccionUsuarios,
    getUsuarios
  } = props;

  const iniciarFormulario = useCallback(async () => {
    if(!coleccionUsuarios?.length) await getUsuarios(); 
  }, [getUsuarios]);

  useEffect(() => {
    iniciarFormulario();
  }, [iniciarFormulario]);


  return (
    <div 
      className="p-4" 
      >
      {coleccionUsuarios.map(usuario => (
        <div
          key={usuario.id}
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

const mapStateToProps = (state: RootState) => ({
  coleccionUsuarios: state.app.coleccionUsuarios,
  isFetching: state.app.isFetching
});

export default connect(mapStateToProps, { getUsuarios })(ListaUsuarios);