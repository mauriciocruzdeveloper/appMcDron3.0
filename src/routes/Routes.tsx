import { Route, Switch, Redirect } from "react-router-dom";
import Login from '../components/Login.container';
import Registro from '../components/Registro.container';
import InicioRoutes from "./Inicio.routes";
import { useAppSelector } from "../redux-tool-kit/hooks/useAppSelector";

export default function Routes(): JSX.Element {
    console.log("ROUTES");
    const isLoggedIn = useAppSelector(state => state.app.isLoggedIn);
    const isAdmin = useAppSelector(state => state.app.usuario?.data.Admin);

    return (<>
        <Switch>
            <Route exact path="/" render={() => <Redirect to="/inicio" />} />

            {/* <Route path="/noautorizado" render = { () => <Modal mensaje={"Acceso no autorizado"} /> } />
            <Route path="/errorlogin" render = { () => <Modal mensaje={"Login incorrecto"} /> } />
            <Route path="/ocurrioproblema" render = { () => <Modal mensaje={"Ocurrió un problema"} /> } /> */}

            <Route path="/login" render={() => <Login />} />

            <Route path="/inicio" render={props => <InicioRoutes {...props} isLoggedIn={isLoggedIn} admin={isAdmin} />} />

            <Route path="/registro" render={
                isLoggedIn
                    ? props => <InicioRoutes {...props} isLoggedIn={isLoggedIn} admin={isAdmin} />
                    : () => <Registro />
            } />

        </Switch>
    </>)
}
