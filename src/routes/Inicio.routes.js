// React Router Dom imports
import { Route, Routes, Navigate } from "react-router-dom";

// Components
import Inicio from "../components/Inicio/Inicio.component";
import ListaUsuarios from "../components/ListaUsuarios.component";
import Reparacion from "../components/Reparacion/Reparacion.component";
import Usuario from "../components/Usuario.component";
import PerfilPropio from "../components/PerfilPropio.component";
import Presupuesto from "../components/Presupuesto.component";
import NavMcDron from "../components/NavMcDron.component";
import Mensajes from "../components/Mensajes.container";
import ListaReparaciones from "../components/ListaReparaciones.component";
import ListaRepuestos from "../components/ListaRepuestos.component";
import ListaModelosDrone from "../components/ListaModelosDrone.component";
import ListaDrones from "../components/ListaDrones.component";
import ModeloDrone from "../components/ModeloDrone.component";
import Repuesto from "../components/Repuesto.component";
import Drone from "../components/Drone.component";
import { DataManagerComponent } from "../components/DataManager.component";
import ListaIntervenciones from "../components/ListaIntervenciones.component";
import IntervencionesReparacion from "../components/IntervencionesReparacion.component";
import Intervencion from "../components/Intervencion.component";
import Estadisticas from "../components/Estadisticas.component";
import EstadisticasLocacion from "../components/EstadisticasLocacion.component";
import EstadosLegacyManager from "../components/EstadosLegacyManager.component";
import GaleriaReparaciones from "../components/GaleriaReparaciones.component";
import RoleGuard from "../components/RoleGuard.component";
import { useAppSelector } from "../redux-tool-kit/hooks/useAppSelector";

const InicioRoutes = ({ isLoggedIn, admin }) => {

    console.log("INICIO ROUTES");
    
    const userRole = useAppSelector(state => state.app.usuario?.data.Role || 'cliente');

    // render renderiza una vez y luego queda en segundo plano
    // component instancia el componenete cada vez
    return (
        isLoggedIn ?
        <DataManagerComponent>
            {/* TODO: Verificar si Nav debe ir acá, quizás en App */}
            <NavMcDron /> 
            <Routes>
                {/* Rutas accesibles para todos los usuarios autenticados */}
                <Route index element={<Inicio admin={admin}/>} />
                <Route path="reparaciones" element={<ListaReparaciones admin={admin}/>} />
                <Route path="reparaciones/:id" element={<Reparacion admin={admin}/>} />
                <Route path="mensajes" element={<Mensajes admin={admin}/>} />
                
                {/* Perfil - accesible para todos */}
                <Route path="perfil" element={<PerfilPropio />} />
                <Route path="perfil/:id" element={<Usuario />} />
                
                {/* Rutas solo para ADMIN */}
                <Route path="usuarios" element={
                    <RoleGuard allowedRoles={['admin']} userRole={userRole}>
                        <ListaUsuarios />
                    </RoleGuard>
                } />
                <Route path="usuarios/:id" element={
                    <RoleGuard allowedRoles={['admin']} userRole={userRole}>
                        <Usuario/>
                    </RoleGuard>
                } />
                <Route path="presupuesto" element={
                    <RoleGuard allowedRoles={['admin']} userRole={userRole}>
                        <Presupuesto admin={admin}/>
                    </RoleGuard>
                } />
                <Route path="repuestos" element={
                    <RoleGuard allowedRoles={['admin']} userRole={userRole}>
                        <ListaRepuestos admin={admin}/>
                    </RoleGuard>
                } />
                <Route path="repuestos/:id" element={
                    <RoleGuard allowedRoles={['admin']} userRole={userRole}>
                        <Repuesto />
                    </RoleGuard>
                } />
                <Route path="modelos-drone" element={
                    <RoleGuard allowedRoles={['admin']} userRole={userRole}>
                        <ListaModelosDrone />
                    </RoleGuard>
                } />
                <Route path="modelos-drone/:id" element={
                    <RoleGuard allowedRoles={['admin']} userRole={userRole}>
                        <ModeloDrone />
                    </RoleGuard>
                } />
                <Route path="drones" element={
                    <RoleGuard allowedRoles={['admin']} userRole={userRole}>
                        <ListaDrones />
                    </RoleGuard>
                } />
                <Route path="drones/:id" element={
                    <RoleGuard allowedRoles={['admin']} userRole={userRole}>
                        <Drone />
                    </RoleGuard>
                } />
                <Route path="intervenciones" element={
                    <RoleGuard allowedRoles={['admin']} userRole={userRole}>
                        <ListaIntervenciones />
                    </RoleGuard>
                } />
                <Route path="intervenciones/:id" element={
                    <RoleGuard allowedRoles={['admin']} userRole={userRole}>
                        <Intervencion />
                    </RoleGuard>
                } />
                <Route path="intervenciones-reparacion/:id" element={
                    <RoleGuard allowedRoles={['admin']} userRole={userRole}>
                        <IntervencionesReparacion />
                    </RoleGuard>
                } />
                <Route path="estadisticas" element={
                    <RoleGuard allowedRoles={['admin']} userRole={userRole}>
                        <Estadisticas />
                    </RoleGuard>
                } />
                <Route path="estadisticas-locacion" element={
                    <RoleGuard allowedRoles={['admin']} userRole={userRole}>
                        <EstadisticasLocacion />
                    </RoleGuard>
                } />
                <Route path="galeria-reparaciones" element={
                    <RoleGuard allowedRoles={['admin']} userRole={userRole}>
                        <GaleriaReparaciones />
                    </RoleGuard>
                } />
                <Route path="estados-legacy" element={
                    <RoleGuard allowedRoles={['admin']} userRole={userRole}>
                        <EstadosLegacyManager />
                    </RoleGuard>
                } />
            </Routes>
        </DataManagerComponent>
        : <Navigate to="/login" replace />        
    )
}

export default InicioRoutes;