import { Route, Routes as RouterRoutes, Navigate } from "react-router-dom";
import Login from '../components/Login.container';
import Registro from '../components/Registro.container';
import InicioRoutes from "./Inicio.routes";
import { useAppSelector } from "../redux-tool-kit/hooks/useAppSelector";
import type { ThemeMode } from '../utils/theme';

type RoutesProps = {
    themeMode: ThemeMode;
    resolvedTheme: 'light' | 'dark';
    onThemeChange: (mode: ThemeMode) => void;
};

export default function Routes({ themeMode, resolvedTheme, onThemeChange }: RoutesProps): JSX.Element {
    console.log("ROUTES");
    const isLoggedIn = useAppSelector(state => state.app.isLoggedIn);
    const isAdmin = useAppSelector(state => state.app.usuario?.data.Role === 'admin');

    return (<>
        <RouterRoutes>
            <Route path="/" element={<Navigate to="/inicio" replace />} />

            {/* <Route path="/noautorizado" element={<Modal mensaje={"Acceso no autorizado"} />} />
            <Route path="/errorlogin" element={<Modal mensaje={"Login incorrecto"} />} />
            <Route path="/ocurrioproblema" element={<Modal mensaje={"Ocurrió un problema"} />} /> */}

            <Route path="/login" element={<Login />} />

            <Route path="/inicio/*" element={<InicioRoutes isLoggedIn={isLoggedIn} admin={isAdmin} themeMode={themeMode} resolvedTheme={resolvedTheme} onThemeChange={onThemeChange} />} />

            <Route path="/registro" element={
                isLoggedIn
                    ? <InicioRoutes isLoggedIn={isLoggedIn} admin={isAdmin} themeMode={themeMode} resolvedTheme={resolvedTheme} onThemeChange={onThemeChange} />
                    : <Registro />
            } />

        </RouterRoutes>
    </>)
}
