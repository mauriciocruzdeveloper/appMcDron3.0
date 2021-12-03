import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import Inicio from "../components/Inicio.component";
// import CargaEmpleados from "../../components/Carga.empleados.component";

import NavMcDron from "../components/NavMcDron.component";


const InicioRoutes = ({ match, isLoggedIn, admin }) => {

    return (<>
        <NavMcDron />
        {
        !isLoggedIn ? <Redirect to = "/" /> : 
            // !admin ? <Redirect to = "/noautorizado" /> :
        <Switch>

            <Route exact path = {`${match.path}`} render = { () => <Inicio /> } />

            {/* <Route exact path={`${match.path}/carga`} render={() => {
                return <CargaEmpleados />
            }} /> */}

        </Switch>
        }
    </>)
}

export default InicioRoutes;