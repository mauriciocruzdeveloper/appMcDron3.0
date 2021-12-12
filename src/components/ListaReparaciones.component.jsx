import React, { useEffect } from "react";
import { connect } from "react-redux";
import history from "../history";
import { 
  getReparaciones
} from "../redux/root-actions";

const ListaReparaciones = ({ 
  getReparaciones, 
  coleccionReparaciones, 
  isFetching 
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
    <div class="list-group">
      {coleccionReparaciones.map(reparacion => (
        <a value={reparacion.id} href="#" class="list-group-item list-group-item-action" aria-current="true">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{reparacion.data.DroneRep}</h5>
            <small>3 days ago</small>
          </div>
          <p class="mb-1">{reparacion.data.EstadoRep}</p>
          <small>{reparacion.data.UsuarioRep}</small>
        </a>
          
                      /* class="bg-${estados[reparacion.EstadoRep].color}" */
          
                      /* <span>    -    ${estados[reparacion.EstadoRep].accion}</span> */
      ))}
    </div>
  );
};


const mapStateToProps = (state) => ({
  coleccionReparaciones: state.app.coleccionReparaciones,
  isFetching: state.app.isFetching,
});

export default connect( mapStateToProps, { getReparaciones } )( ListaReparaciones );