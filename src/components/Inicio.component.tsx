import history from "../history";
import { MatchType } from "../types/types";

interface InicioProps {
  admin: boolean;
  match: MatchType;
}

const Inicio = (props: InicioProps) => {
  const { admin, match } = props;

  console.log("INICIO");

    return (

        <div 
          className="p-4" 
        > 
            <img className="mb-4" src="./img/logo.png" alt="" width="100%" max-width="100px" />   

            <button 
              className="mb-3 btn w-100 bg-bluemcdron"
              style={{height: "100px"}}
              onClick={() => history.push(`${match.path}/reparaciones`)}
            >      
              <div className="text-white text-center">REPARACIONES</div>
            </button>

            {admin ?
            <button 
              className="mb-3 btn w-100 bg-bluemcdron"
              style={{height: "100px"}}
              onClick={() => history.push(`${match.path}/usuarios`)}
            >      
              <div className="text-white text-center">USUARIOS</div>
            </button>
            : null}

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
              onClick={() => history.push(`${match.path}/mensajes`)}
            >      
              <div className="text-white text-center">MENSAJES</div>
            </button>

        </div>
    )
};

export default Inicio;
