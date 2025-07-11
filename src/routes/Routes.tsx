import { Route, Routes as RouterRoutes, Navigate } from "react-router-dom";
import Login from '../components/Login.container';
import Registro from '../components/Registro.container';
import InicioRoutes from "./Inicio.routes";
import { useAppSelector } from "../redux-tool-kit/hooks/useAppSelector";

export default function Routes(): JSX.Element {
    console.log("ROUTES");
    const isLoggedIn = useAppSelector(state => state.app.isLoggedIn);
    const isAdmin = useAppSelector(state => state.app.usuario?.data.Admin);

    return (<>
        <RouterRoutes>
            <Route path="/" element={<Navigate to="/inicio" replace />} />

            {/* <Route path="/noautorizado" element={<Modal mensaje={"Acceso no autorizado"} />} />
            <Route path="/errorlogin" element={<Modal mensaje={"Login incorrecto"} />} />
            <Route path="/ocurrioproblema" element={<Modal mensaje={"Ocurrió un problema"} />} /> */}

            <Route path="/login" element={<Login />} />

            <Route path="/inicio/*" element={<InicioRoutes isLoggedIn={isLoggedIn} admin={isAdmin} />} />

            <Route path="/registro" element={
                isLoggedIn
                    ? <InicioRoutes isLoggedIn={isLoggedIn} admin={isAdmin} />
                    : <Registro />
            } />

        </RouterRoutes>
    </>)
}
