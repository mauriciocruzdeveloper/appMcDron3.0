// React Router Dom imports
import { Route, Routes, Navigate } from "react-router-dom";

// Components
import Inicio from "../components/Inicio.component";
import ListaUsuarios from "../components/ListaUsuarios.component";
import Reparacion from "../components/Reparacion.component";
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
                <Route index element={<Inicio admin={admin}/>} />
                <Route path="reparaciones" element={<ListaReparaciones admin={admin}/>} />
                <Route path="reparaciones/:id" element={<Reparacion admin={admin}/>} />
                <Route path="usuarios" element={admin ? <ListaUsuarios /> : <h1>ACCESO NO AUTORIZADO</h1>} />
                <Route path="usuarios/:id" element={<Usuario/>} />
                <Route path="presupuesto" element={<Presupuesto admin={admin}/>} />
                <Route path="mensajes" element={<Mensajes admin={admin}/>} />
                <Route path="repuestos" element={<ListaRepuestos admin={admin}/>} />
                <Route path="repuestos/:id" element={admin ? <Repuesto /> : <h1>ACCESO NO AUTORIZADO</h1>} />
                
                {/* Rutas para modelos de drone */}
                <Route path="modelos-drone" element={admin ? <ListaModelosDrone /> : <h1>ACCESO NO AUTORIZADO</h1>} />
                <Route path="modelos-drone/:id" element={admin ? <ModeloDrone /> : <h1>ACCESO NO AUTORIZADO</h1>} />
                
                {/* Rutas para drones */}
                <Route path="drones" element={admin ? <ListaDrones /> : <h1>ACCESO NO AUTORIZADO</h1>} />
                <Route path="drones/:id" element={admin ? <Drone /> : <h1>ACCESO NO AUTORIZADO</h1>} />
                
                {/* Rutas para intervenciones */}
                <Route path="intervenciones" element={admin ? <ListaIntervenciones /> : <h1>ACCESO NO AUTORIZADO</h1>} />
                <Route path="intervenciones/:id" element={admin ? <Intervencion /> : <h1>ACCESO NO AUTORIZADO</h1>} />
                <Route path="intervenciones-reparacion/:id" element={admin ? <IntervencionesReparacion /> : <h1>ACCESO NO AUTORIZADO</h1>} />
                
                {/* Ruta para estadísticas */}
                <Route path="estadisticas" element={admin ? <Estadisticas /> : <h1>ACCESO NO AUTORIZADO</h1>} />
            </Routes>
        </DataManagerComponent>
        : <Navigate to="/login" replace />        
    )
}

export default InicioRoutes;