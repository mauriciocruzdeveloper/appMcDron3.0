// Módulo para conectar con redux
import { connect } from "react-redux";
// Actions
import { logout } from "../redux/root-actions";
// Componentes
// Transitions
// Servicios
import history from "../history";

// match es una parámetro de las props
const Inicio = ({ logout, admin, match }) => {
    return (

        <div 
          className="p-4" 
          style={{
            backgroundColor: "#EEEEEE", 
            height: "100vh",
          }}
        > 
            <img className="mb-4" src="./img/logo.png" alt="" width="100%" max-width="100px" />   

            <button 
              className="mb-3 btn w-100 bg-bluemcdron"
              style={{height: "100px"}}
              onClick={() => history.push(`${match.path}/reparaciones`)}
            >      
              <div className="text-white text-center">REPARACIONES</div>
            </button>

            <button 
              className="mb-3 btn w-100 bg-bluemcdron"
              style={{height: "100px"}}
              onClick={() => history.push(`${match.path}/presupuesto`)}
            >      
              <div className="text-white text-center">PRESUPUESTO</div>
            </button>

            <button 
              className="mb-3 btn w-100 bg-bluemcdron"
              style={{height: "100px"}}
              onClick={() => history.push(`${match.path}/usuarios`)}
            >      
              <div className="text-white text-center">USUARIOS</div>
            </button>

        </div>
    )
};

export default connect( null, { logout } )( Inicio );
