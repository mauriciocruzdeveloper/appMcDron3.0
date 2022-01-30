// Modules
import { Route, Switch, Redirect } from "react-router-dom";
import { connect } from "react-redux";

// Componenst
import Login from '../components/Login.component';
// import Modal from "../components/Modal.component";

// import Turno from "../components/Turno.components";
// import Resumen from "../components/Resumen.component";

//Routes
import InicioRoutes from "./Inicio.routes";
// import TiposJornadaRoutes from "./TiposJornada/TiposJornada.routes";

// Actions
import { login, logout } from "../redux/root-actions";

const Routes = ({ isLoggedIn, admin, isFetching }) => {

    console.log("ROUTES");

    return (<>
        <Switch>
            <Route exact path="/" render={() => <Redirect to="/inicio" />}/>

            {/* <Route path="/noautorizado" render = { () => <Modal mensaje={"Acceso no autorizado"} /> } />
            <Route path="/errorlogin" render = { () => <Modal mensaje={"Login incorrecto"} /> } />
            <Route path="/ocurrioproblema" render = { () => <Modal mensaje={"Ocurrió un problema"} /> } /> */}

            <Route path="/login" render = {props => <Login {...props} /> }/>

            <Route path="/inicio" render = {props => <InicioRoutes {...props} isLoggedIn = { isLoggedIn } admin = { admin } /> }/>

        </Switch>
    </>)
};

export default connect( null, { login, logout } )( Routes );