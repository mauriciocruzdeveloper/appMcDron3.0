import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import Inicio from "../components/Inicio.component";
import ListaReparaciones from "../components/ListaReparaciones.component";
import Reparacion from "../components/Reparacion.component";

import NavMcDron from "../components/NavMcDron.component";


const InicioRoutes = ({ match, isLoggedIn, admin }) => {

    console.log("inicio rutes")
    console.log(isLoggedIn);

    return (
        <>
        { isLoggedIn ?
        // true ? 
        <>
            <NavMcDron />

            <Switch>

                <Route exact path = {`${match.path}`} component= {Inicio} />

                <Route exact path={`${match.path}/reparaciones`} component={ListaReparaciones} />

                <Route exact path={`${match.path}/:id`} component={Reparacion} />

            </Switch> 
        </>
        : 
             <Redirect to="/login" />
            
        }
        </>
        
    )
}

export default InicioRoutes;