// React Router Dom imports
import { Route, Switch, Redirect } from "react-router-dom";

// Components
import Inicio from "../components/Inicio.component";
import ListaReparaciones from "../components/ListaReparaciones.component";
import ListaUsuarios from "../components/ListaUsuarios.component";
import Reparacion from "../components/Reparacion.container";
import Usuario from "../components/Usuario.container";
import Presupuesto from "../components/Presupuesto.component";
import NavMcDron from "../components/NavMcDron.component";


const InicioRoutes = ({ match, isLoggedIn, admin }) => {

    console.log("INICIO ROUTES");

    // render renderiza una vez y luego queda en segundo plano
    // component instancia el componenete cada vez
    return (
        isLoggedIn ?
        <>
            <NavMcDron />
            <Switch>
                <Route exact path={`${match.path}`} render = {props => <Inicio {...props} admin = {admin}/>} />
                <Route exact path={`${match.path}/reparaciones`} render = {props => <ListaReparaciones {...props} admin={admin}/>} />
                <Route exact path={`${match.path}/reparaciones/:id`} render = {props => <Reparacion {...props} admin={admin}/>} />
                <Route exact path={`${match.path}/usuarios`} render = {admin ? props => <ListaUsuarios {...props} /> : () => <h1>ACCESO NO AUTORIZADO</h1>} />
                <Route exact path={`${match.path}/usuarios/:id`} render = {props => <Usuario {...props}/>} />
                <Route exact path={`${match.path}/presupuesto`} render = {props => <Presupuesto {...props}/>} />
            </Switch>
        </>
        : <Redirect to="/login" />        
    )
}

export default InicioRoutes;