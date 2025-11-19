/**
 * WorkflowTimeline.tsx
 * 
 * Timeline vertical que muestra el historial de estados de la reparación.
 * 
 * @module Reparacion/tabs/WorkflowTab
 */

import React, { useMemo } from 'react';
import { useReparacion } from '../../ReparacionContext';
import { TimelineItem } from './TimelineItem';
import { EstadoReparacion } from '../../../../usecases/estadosReparacion';

/**
 * Interfaz para un item del timeline
 */
interface TimelineItemData {
    estado: EstadoReparacion;
    fecha: string | null;
    esActual: boolean;
    esCompletado: boolean;
    observaciones?: string;
}

/**
 * Timeline vertical de estados.
 * Muestra todos los estados posibles del flujo de reparación.
 * 
 * **Phase 3 - T3.5:** Conectado a datos reales desde Context.
 */
export function WorkflowTimeline(): React.ReactElement {
    const { reparacion, getCurrentEstado } = useReparacion();
    const estadoActual = getCurrentEstado();
    
    /**
     * Define el flujo completo de estados en orden
     */
    const flujoCompleto: EstadoReparacion[] = useMemo(() => [
        'Consulta',
        'Respondido',
        'Transito',
        'Recibido',
        'Revisado',
        'Presupuestado',
        'Aceptado',
        'Repuestos', // Estado opcional
        'Reparado',
        'Diagnosticado',
        'Cobrado',
        'Enviado',
        'Finalizado'
    ], []);
    
    /**
     * Determina qué estados han sido completados
     */
    const getEstadoIndex = (estado: EstadoReparacion): number => {
        return flujoCompleto.indexOf(estado);
    };
    
    const estadoActualIndex = getEstadoIndex(estadoActual as EstadoReparacion);
    
    /**
     * Genera los items del timeline
     */
    const timelineItems: TimelineItemData[] = useMemo(() => {
        return flujoCompleto.map((estado, index) => {
            const esActual = estado === estadoActual;
            const esCompletado = index < estadoActualIndex || esActual;
            
            // Mapear fechas reales desde DataReparacion
            let fecha: string | number | null = null;
            if (estado === 'Consulta') fecha = reparacion.data.FeConRep;
            if (estado === 'Recibido') fecha = reparacion.data.FeRecRep;
            if (estado === 'Finalizado') fecha = reparacion.data.FeFinRep;
            if (estado === 'Entregado') fecha = reparacion.data.FeEntRep;
            
            return {
                estado,
                fecha: fecha ? fecha.toString() : null,
                esActual,
                esCompletado,
                observaciones: esActual && reparacion.data.AnotacionesRep 
                    ? reparacion.data.AnotacionesRep 
                    : undefined
            };
        });
    }, [flujoCompleto, estadoActual, estadoActualIndex, reparacion.data]);
    
    /**
     * Filtra estados que no están en el flujo actual
     * (por ejemplo, si no pasó por Repuestos)
     */
    const timelineItemsFiltered = useMemo(() => {
        // Por ahora mostramos todos, en el futuro filtraremos según historial real
        return timelineItems;
    }, [timelineItems]);
    
    return (
        <div className="workflow-timeline">
            {timelineItemsFiltered.map((item, index) => (
                <TimelineItem
                    key={item.estado}
                    estado={item.estado}
                    fecha={item.fecha}
                    esActual={item.esActual}
                    esCompletado={item.esCompletado}
                    observaciones={item.observaciones}
                    isLast={index === timelineItemsFiltered.length - 1}
                />
            ))}
            
            {/* Nota informativa */}
            <div className="mt-4 p-3 bg-light rounded">
                <small className="text-muted">
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>Nota:</strong> Este timeline muestra el flujo estándar de estados. 
                    Los estados marcados en verde han sido completados, el estado actual está destacado en azul.
                </small>
            </div>
        </div>
    );
}
