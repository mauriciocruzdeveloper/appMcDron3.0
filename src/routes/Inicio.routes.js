// React Router Dom imports
import { Route, Switch, Redirect } from "react-router-dom";

// Components
import Inicio from "../components/Inicio.component";
import ListaReparaciones from "../components/ListaReparaciones.component";
import Reparacion from "../components/Reparacion.component";
import Presupuesto from "../components/Presupuesto.component";
import NavMcDron from "../components/NavMcDron.component";


const InicioRoutes = ({ match, isLoggedIn, admin }) => {

    console.log("inicio rutes")

    return (
        <>
        { isLoggedIn ?
        // true ? 
        <>
            <NavMcDron />

            <Switch>
                <Route exact path={`${match.path}`} component = {Inicio} />
                <Route exact path={`${match.path}/reparaciones`} component = {ListaReparaciones} />
                <Route exact path={`${match.path}/presupuesto`} component = {Presupuesto} />
                <Route exact path={`${match.path}/reparaciones/:id`} component = {Reparacion} />
            </Switch> 
        </>
        : 
             <Redirect to="/login" />
            
        }
        </>
        
    )
}

export default InicioRoutes;