import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppSelector } from "../../redux-tool-kit/hooks/useAppSelector";
import { selectReparacionById } from "../../redux-tool-kit/reparacion";
import { obtenerEstadoSeguro } from '../../utils/estadosHelper';
import {
    ReparacionHeader,
    ReparacionProgreso,
    ReparacionConsulta,
    ReparacionRecepcion,
    ReparacionRevision,
    ReparacionPresupuesto,
    ReparacionRepuestos,
    ReparacionReparar,
    ReparacionEntrega,
    ReparacionFotos,
    ReparacionDocumentos,
    ReparacionAnotacionesConfidenciales,
    ReparacionDrive,
    ReparacionAcciones,
    ReparacionSeccionesProvider,
    obtenerSeccionIdPorEstado,
} from './sections';

interface ParamTypes extends Record<string, string | undefined> {
    id: string;
}

export default function ReparacionComponent(): React.ReactElement | null {
    console.log("REPARACION component");

    const isAdmin = useAppSelector(state => state.app.usuario?.data.Role === 'admin') ?? false;
    const { id } = useParams<ParamTypes>();
    const isNew = id === "new";

    // Obtener datos directamente del store
    const reparacion = useAppSelector(selectReparacionById(id || ""));

    // useEffect para scroll automático según el estado
    useEffect(() => {
        if (!reparacion || isNew) return;

        const scrollToSection = () => {
            const estadoActual = obtenerEstadoSeguro(reparacion.data.EstadoRep);
            const sectionId = obtenerSeccionIdPorEstado(estadoActual.nombre);

            // Hacer scroll suave a la sección con offset para compensar el NavMcDron
            setTimeout(() => {
                if (!sectionId) return;
                const element = document.getElementById(sectionId);
                if (element) {
                    const navHeight = 80; // Altura aproximada del NavMcDron + padding
                    const elementPosition = element.offsetTop - navHeight;

                    window.scrollTo({
                        top: elementPosition,
                        behavior: 'smooth'
                    });
                }
            }, 100); // Pequeño delay para asegurar que el DOM esté renderizado
        };

        scrollToSection();
    }, [reparacion?.data.EstadoRep, isNew]);

    if (!reparacion) return null;
    const estadoActual = obtenerEstadoSeguro(reparacion.data.EstadoRep);
    const seccionActivaId = obtenerSeccionIdPorEstado(estadoActual.nombre);

    // UI RENDER - Componente contenedor simple que orquesta las secciones
    return (
        <div
            className="reparacion-page"
            style={{
                backgroundColor: estadoActual.color
            }}
        >
            {/* Header con información básica */}
            <ReparacionHeader reparacionId={id || ""} />

            {/* Indicador de progreso */}
            <ReparacionProgreso reparacionId={id || ""} />

            {/* Anotaciones confidenciales siempre visibles (solo admin) */}
            <ReparacionAnotacionesConfidenciales reparacionId={id || ""} isAdmin={isAdmin} />

                        <ReparacionSeccionesProvider
                                seccionActivaId={seccionActivaId}
                                colorEstado={estadoActual.color}
                        >
                            {/* Drive colapsable (solo admin) */}
                            <ReparacionDrive reparacionId={id || ""} isAdmin={isAdmin} />

            {/* Sección de Consulta */}
            <ReparacionConsulta reparacionId={id || ""} isAdmin={isAdmin} />

            {/* Sección de Recepción */}
            <ReparacionRecepcion reparacionId={id || ""} isAdmin={isAdmin} />

            {/* Sección de Revisión */}
            <ReparacionRevision reparacionId={id || ""} isAdmin={isAdmin} />

            {/* Sección de Presupuesto */}
            <ReparacionPresupuesto reparacionId={id || ""} isAdmin={isAdmin} />

            {/* Sección de Repuestos */}
            <ReparacionRepuestos reparacionId={id || ""} isAdmin={isAdmin} />

            {/* Sección de Reparar */}
            <ReparacionReparar reparacionId={id || ""} isAdmin={isAdmin} />

            {/* Sección de Entrega */}
            <ReparacionEntrega reparacionId={id || ""} isAdmin={isAdmin} />

            {/* Sección de Fotos */}
            <ReparacionFotos reparacionId={id || ""} isAdmin={isAdmin} />

            {/* Sección de Documentos */}
            <ReparacionDocumentos reparacionId={id || ""} isAdmin={isAdmin} />

            {/* Botón de eliminar (solo admin) */}
                            <ReparacionAcciones reparacionId={id || ""} isAdmin={isAdmin} />
                        </ReparacionSeccionesProvider>
        </div>
    );
}
