// Modules
import React from 'react';
import { Route, Switch, Redirect } from "react-router-dom";
import { connect } from "react-redux";

// Componenst
import Principal from '../components/Principal.component';
import Login from '../components/Login.component';
import Error from "../components/Error.component";
// import Turno from "../components/Turno.components";
// import Resumen from "../components/Resumen.component";


//Routes
// import EmpleadosRoutes from "./Empleados/Empleados.routes";
// import TiposJornadaRoutes from "./TiposJornada/TiposJornada.routes";

// Actions
import { login, logout } from "../redux/root-actions";

const Routes = ({ isLoggedIn, admin }) => (
    <Switch>

        {/* Si está logueado, entra a la página principal, sino a la página de login. */}
        <Route exact path="/" render = { () => {
            return !isLoggedIn ? <Redirect to="/login" /> : <Principal admin = { admin }/>
        }} />

        <Route path="/empleados" render = { ( props ) => {
                return <EmpleadosRoutes { ...props } isLoggedIn = { isLoggedIn } admin = { admin } />;
        }} />

        <Route exact path="/noautorizado" render = { () => <Error mensaje={"Acceso no autorizado"} /> } />
        <Route exact path="/errorlogin" render = { () => <Error mensaje={"Login incorrecto"} /> } />
        <Route exact path="/ocurrioproblema" render = { () => <Error mensaje={"Ocurrió un problema"} /> } />

        <Route exact path="/turnos" render = { () => {
            return !isLoggedIn ? <Redirect to="/login" /> : <Turno />
        }} />  

        <Route path="/tiposjornada" render = { ( props ) =>{
                return <TiposJornadaRoutes { ...props } isLoggedIn = { isLoggedIn } admin = { admin }/>;
        }} />

        <Route exact path="/resumen" render = { () => {
            return !isLoggedIn ? <Redirect to="/login" /> : <Resumen />
        }} />  

        <Route path="/login" render = {( props ) => <Login { ...props } /> }/>

    </Switch>
);

export default connect( null, { login, logout } )( Routes );