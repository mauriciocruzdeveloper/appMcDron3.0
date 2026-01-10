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
    ReparacionDriveYAnotaciones,
    ReparacionAcciones,
} from './sections';

interface ParamTypes extends Record<string, string | undefined> {
    id: string;
}

export default function ReparacionComponent(): React.ReactElement | null {
    console.log("REPARACION component");

    const isAdmin = useAppSelector(state => state.app.usuario?.data.Admin) ?? false;
    const { id } = useParams<ParamTypes>();
    const isNew = id === "new";

    // Obtener datos directamente del store
    const reparacion = useAppSelector(selectReparacionById(id || ""));

    // useEffect para scroll automático según el estado
    useEffect(() => {
        if (!reparacion || isNew) return;

        const scrollToSection = () => {
            const estadoActual = obtenerEstadoSeguro(reparacion.data.EstadoRep);
            let sectionId = '';

            // Determinar a qué sección hacer scroll según el estado
            switch (estadoActual.nombre) {
                case 'Consulta':
                case 'Respondido':
                    sectionId = 'seccion-consulta';
                    break;
                case 'Transito':
                    sectionId = 'seccion-recepcion';
                    break;
                case 'Recibido':
                    sectionId = 'seccion-revision';
                    break;
                case 'Revisado':
                case 'Presupuestado':
                    sectionId = 'seccion-presupuesto';
                    break;
                case 'Aceptado':
                case 'Rechazado':
                    sectionId = 'seccion-reparar';
                    break;
                case 'Reparado':
                case 'Diagnosticado':
                case 'Cobrado':
                case 'Enviado':
                    sectionId = 'seccion-entrega';
                    break;
                case 'Finalizado':
                case 'Abandonado':
                case 'Cancelado':
                    break; // No hacer scroll
                // Estados legacy
                case 'Reparar':
                case 'Repuestos':
                    sectionId = 'seccion-reparar';
                    break;
                case 'Entregado':
                    sectionId = 'seccion-entrega';
                    break;
                default:
                    sectionId = 'seccion-consulta';
                    break;
            }

            // Hacer scroll suave a la sección con offset para compensar el NavMcDron
            setTimeout(() => {
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

    // UI RENDER - Componente contenedor simple que orquesta las secciones
    return (
        <div
            className="p-4"
            style={{
                backgroundColor: obtenerEstadoSeguro(reparacion.data.EstadoRep).color
            }}
        >
            {/* Header con información básica */}
            <ReparacionHeader reparacionId={id || ""} />

            {/* Indicador de progreso */}
            <ReparacionProgreso reparacionId={id || ""} />

            {/* Drive y Anotaciones (solo admin) */}
            <ReparacionDriveYAnotaciones reparacionId={id || ""} isAdmin={isAdmin} />

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
        </div>
    );
}
