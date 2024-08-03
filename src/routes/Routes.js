// Modules
import { Route, Switch, Redirect } from "react-router-dom";
import { connect } from "react-redux";

// Componenst
import Login from '../components/Login.container';
import Registro from '../components/Registro.container';

//Routes
import InicioRoutes from "./Inicio.routes";

// Actions
import { login, logout } from "../redux/root-actions";

const Routes = ({ isLoggedIn, admin }) => {

    console.log("ROUTES");

    return (<>
        <Switch>
            <Route exact path="/" render={() => <Redirect to="/inicio" />}/>

            {/* <Route path="/noautorizado" render = { () => <Modal mensaje={"Acceso no autorizado"} /> } />
            <Route path="/errorlogin" render = { () => <Modal mensaje={"Login incorrecto"} /> } />
            <Route path="/ocurrioproblema" render = { () => <Modal mensaje={"Ocurrió un problema"} /> } /> */}

            <Route path="/login" render = {props => <Login {...props} /> }/>

            <Route path="/inicio" render = {props => <InicioRoutes {...props} isLoggedIn = {isLoggedIn} admin = {admin} /> }/>

            <Route path="/registro" render = {
                isLoggedIn 
                ? props => <InicioRoutes {...props} isLoggedIn = {isLoggedIn} admin = {admin} />
                : props => <Registro {...props} /> }/>

        </Switch>
    </>)
};

export default connect( null, { login, logout } )( Routes );