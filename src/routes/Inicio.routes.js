// React Router Dom imports
import { Route, Switch, Redirect } from "react-router-dom";

// Components
import Inicio from "../components/Inicio.component";
import ListaUsuarios from "../components/ListaUsuarios.component";
import Reparacion from "../components/Reparacion.container";
import Usuario from "../components/Usuario.container";
import Presupuesto from "../components/Presupuesto.component";
import NavMcDron from "../components/NavMcDron.component";
import Mensajes from "../components/Mensajes.container";
import ListaReparaciones from "../components/ListaReparaciones.component";
import ListaRepuestos from "../components/ListaRepuestos.component";
import ListaModelosDrone from "../components/ListaModelosDrone.component";
import ListaDrones from "../components/ListaDrones.component";
import { DataManagerComponent } from "../components/DataManager.component";

const InicioRoutes = ({ match, isLoggedIn, admin }) => {

    console.log("INICIO ROUTES");

    // render renderiza una vez y luego queda en segundo plano
    // component instancia el componenete cada vez
    return (
        isLoggedIn ?
        <DataManagerComponent>
            {/* TODO: Verificar si Nav debe ir acá, quizás en App */}
            <NavMcDron /> 
            <Switch>
                <Route exact path={`${match.path}`} render = {props => <Inicio {...props} admin = {admin}/>} />
                <Route exact path={`${match.path}/reparaciones`} render = {props => <ListaReparaciones {...props} admin={admin}/>} />
                <Route exact path={`${match.path}/reparaciones/:id`} render = {props => <Reparacion {...props} admin={admin}/>} />
                <Route exact path={`${match.path}/usuarios`} render = {admin ? props => <ListaUsuarios {...props} /> : () => <h1>ACCESO NO AUTORIZADO</h1>} />
                <Route exact path={`${match.path}/usuarios/:id`} render = {props => <Usuario {...props}/>} />
                <Route exact path={`${match.path}/presupuesto`} render = {props => <Presupuesto {...props} admin={admin}/>} />
                <Route exact path={`${match.path}/mensajes`} render = {props => <Mensajes {...props} admin={admin}/>} />
                <Route exact path={`${match.path}/repuestos`} render = {props => <ListaRepuestos {...props} admin={admin}/>} />
                
                {/* Nuevas rutas para modelos de drone y drones */}
                <Route exact path={`${match.path}/modelos-drone`} render = {admin ? props => <ListaModelosDrone {...props} /> : () => <h1>ACCESO NO AUTORIZADO</h1>} />
                <Route exact path={`${match.path}/modelos-drone/:id`} render = {admin ? props => <ListaModelosDrone {...props} /> : () => <h1>ACCESO NO AUTORIZADO</h1>} />
                <Route exact path={`${match.path}/drones`} render = {admin ? props => <ListaDrones {...props} /> : () => <h1>ACCESO NO AUTORIZADO</h1>} />
                <Route exact path={`${match.path}/drones/:id`} render = {admin ? props => <ListaDrones {...props} /> : () => <h1>ACCESO NO AUTORIZADO</h1>} />
            </Switch>
        </DataManagerComponent>
        : <Redirect to="/login" />        
    )
}

export default InicioRoutes;