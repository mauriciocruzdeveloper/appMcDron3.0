import React, { useEffect } from "react";
import { connect } from "react-redux";
import history from "../history";
import { 
  getReparaciones
} from "../redux/root-actions";
// JSON con los estados de las reparaciones
import { estados } from '../datos/estados.json';

const ListaReparaciones = ({ 
  getReparaciones, 
  coleccionReparaciones, 
  isFetching,
  match
}) => {

  //PARA FORZAR LA CARGA DE LOS EMPLEADOS AL INICIALIZAR
  useEffect(async () => {
    // const response = await getReparaciones();
    // Acá no hice una promesa como hice con login porque la redireccón es sólo en caso de error.
    // Además así es más simple. Si el status es 401 es NO AUTORIZADO.
    // if (response?.status == 401){ return history.push('/noautorizado')};
    // if (response?.status == 400){ return history.push('/ocurrioproblema')};
    await getReparaciones();
  }, [getReparaciones]);

  // const handleEliminar = async (id) => {
  //   const response = await borrarEmpleado( id );
  //   if (response?.status == 401){ return history.push('/noautorizado')};
  //   if (response?.status == 400){ return history.push('/ocurrioproblema')};
  //   getEmpleados();
  // }

  // const handleModificar = async (email) => {
  //   const empleado = coleccionEmpleados.find(empleado => empleado.email == email);
  //   const response = await cargaFormModifica( empleado );
  //   if (response?.status == 401){ return history.push('/noautorizado')};
  //   if (response?.status == 400){ return history.push('/ocurrioproblema')};
  //   history.push("/empleados/carga");
  // }

  // const handleAlta = () => {
  //   cargaFormAlta();
  //   history.push("/empleados/carga")
  // }

 

  return (
    isFetching ? <h3>cargando ....</h3> :
    <div className="list-group">
      {coleccionReparaciones.map(reparacion => (
        <a
          key={reparacion.id}
          value={reparacion.id} 
          className="list-group-item list-group-item-action" 
          aria-current="true"
          onClick={() => history.push(`/inicio/${reparacion.id}`)}
        >
          <div className="d-flex w-100 justify-content-between">
            <h5 className="mb-1">{reparacion.data.DroneRep}</h5>
          </div>
          <p 
            className="mb-1" 
            style={{backgroundColor: estados[reparacion.data.EstadoRep].color}}
          >
            {reparacion.data.EstadoRep} - {estados[reparacion.data.EstadoRep].accion}
          </p>
          <small>{reparacion.data.UsuarioRep}</small>
        </a>
      ))}
    </div>

  );
};


const mapStateToProps = (state) => ({
  coleccionReparaciones: state.app.coleccionReparaciones,
  isFetching: state.app.isFetching
});

export default connect( mapStateToProps, { getReparaciones } )( ListaReparaciones );