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

const Routes = ({ isLoggedIn, admin, isFetching }) => {
    return (<>
        { !isFetching ?
        <Switch>
            <Route exact path="/" render={() => <Redirect to="/inicio" />}/>

            <Route path="/noautorizado" render = { () => <Error mensaje={"Acceso no autorizado"} /> } />
            <Route path="/errorlogin" render = { () => <Error mensaje={"Login incorrecto"} /> } />
            <Route path="/ocurrioproblema" render = { () => <Error mensaje={"Ocurrió un problema"} /> } />

            <Route path="/login" render = {props => <Login {...props} /> }/>

            <Route path="/inicio" render = {props => <InicioRoutes {...props} isLoggedIn = { isLoggedIn } admin = { admin } /> }/>

        </Switch> : <h1>Cargando</h1>
        }
    </>)
};

const mapStateToProps = (state) => ({
    isFetching: state.app?.isFetching
});

export default connect( mapStateToProps, { login, logout } )( Routes );