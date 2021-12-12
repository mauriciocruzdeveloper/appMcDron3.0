// Modules
import React from 'react';
import { Route, Switch, Redirect } from "react-router-dom";
import { connect } from "react-redux";

// Componenst
import Login from '../components/Login.component';
import Error from "../components/Error.component";

// import Turno from "../components/Turno.components";
// import Resumen from "../components/Resumen.component";

//Routes
import InicioRoutes from "./Inicio.routes";
// import TiposJornadaRoutes from "./TiposJornada/TiposJornada.routes";

// Actions
import { login, logout } from "../redux/root-actions";

const Routes = ({ isLoggedIn, admin }) => (
    <Switch>

        {/* Si está logueado, entra a la página principal, sino a la página de login. */}
        <Route exact path="/" render = { () => {
                return !isLoggedIn ? <Redirect to="/login" /> : <Redirect to="/inicio" />;
        }} />

        <Route exact path="/noautorizado" render = { () => <Error mensaje={"Acceso no autorizado"} /> } />
        <Route exact path="/errorlogin" render = { () => <Error mensaje={"Login incorrecto"} /> } />
        <Route exact path="/ocurrioproblema" render = { () => <Error mensaje={"Ocurrió un problema"} /> } />

        <Route exact path="/login" render = {props => <Login {...props} /> }/>

        <Route path="/inicio" render = {props => <InicioRoutes {...props} isLoggedIn = { isLoggedIn } admin = { admin } /> }/>

    </Switch>
);

export default connect( null, { login, logout } )( Routes );