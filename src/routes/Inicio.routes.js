// React Router Dom imports
import { Route, Routes, Navigate } from "react-router-dom";

// Components
import Inicio from "../components/Inicio.component";
import ListaUsuarios from "../components/ListaUsuarios.component";
import Reparacion from "../components/Reparacion/Reparacion.component";
import Usuario from "../components/Usuario.component";
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
import EstadosLegacyManager from "../components/EstadosLegacyManager.component";
import GaleriaReparaciones from "../components/GaleriaReparaciones.component";
import AdminGuard from "../components/AdminGuard.component";

const InicioRoutes = ({ isLoggedIn, admin }) => {

    console.log("INICIO ROUTES");

    // render renderiza una vez y luego queda en segundo plano
    // component instancia el componenete cada vez
    return (
        isLoggedIn ?
        <DataManagerComponent>
            {/* TODO: Verificar si Nav debe ir acá, quizás en App */}
            <NavMcDron /> 
            <Routes>
                {/* Rutas públicas */}
                
                
                {/* Rutas protegidas con AdminGuard */}
                <Route path="*" element={
                    <AdminGuard admin={admin}>
                        <Routes>
                            <Route index element={<Inicio admin={admin}/>} />
                            <Route path="presupuesto" element={<Presupuesto admin={admin}/>} />
                            <Route path="reparaciones" element={<ListaReparaciones admin={admin}/>} />
                            <Route path="reparaciones/:id" element={<Reparacion admin={admin}/>} />
                            <Route path="usuarios" element={<ListaUsuarios />} />
                            <Route path="usuarios/:id" element={<Usuario/>} />
                            <Route path="mensajes" element={<Mensajes admin={admin}/>} />
                            <Route path="repuestos" element={<ListaRepuestos admin={admin}/>} />
                            <Route path="repuestos/:id" element={<Repuesto />} />
                            <Route path="modelos-drone" element={<ListaModelosDrone />} />
                            <Route path="modelos-drone/:id" element={<ModeloDrone />} />
                            <Route path="drones" element={<ListaDrones />} />
                            <Route path="drones/:id" element={<Drone />} />
                            <Route path="intervenciones" element={<ListaIntervenciones />} />
                            <Route path="intervenciones/:id" element={<Intervencion />} />
                            <Route path="intervenciones-reparacion/:id" element={<IntervencionesReparacion />} />
                            <Route path="estadisticas" element={<Estadisticas />} />
                            <Route path="galeria-reparaciones" element={<GaleriaReparaciones />} />
                            <Route path="estados-legacy" element={<EstadosLegacyManager />} />
                        </Routes>
                    </AdminGuard>
                } />
            </Routes>
        </DataManagerComponent>
        : <Navigate to="/login" replace />        
    )
}

export default InicioRoutes;