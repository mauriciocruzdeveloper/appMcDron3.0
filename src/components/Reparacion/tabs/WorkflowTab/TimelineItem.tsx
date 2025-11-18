/**
 * TimelineItem.tsx
 * 
 * Item individual del timeline de estados.
 * 
 * @module Reparacion/tabs/WorkflowTab
 */

import React from 'react';
import { Badge } from 'react-bootstrap';
import { EstadoReparacion } from '../../../../usecases/estadosReparacion';

interface TimelineItemProps {
    /** Estado que representa este item */
    estado: EstadoReparacion;
    
    /** Fecha en que se alcanzó este estado */
    fecha: string | null;
    
    /** Si es el estado actual */
    esActual: boolean;
    
    /** Si este estado ya fue completado */
    esCompletado: boolean;
    
    /** Observaciones del estado */
    observaciones?: string;
    
    /** Si es el último item del timeline */
    isLast?: boolean;
}

/**
 * Mapeo de estados a iconos Bootstrap Icons
 */
const ESTADO_ICONS: Partial<Record<EstadoReparacion, string>> = {
    Consulta: 'question-circle',
    Respondido: 'reply',
    Transito: 'truck',
    Recibido: 'inbox',
    Revisado: 'eye',
    Presupuestado: 'calculator',
    Aceptado: 'check-circle',
    Repuestos: 'box-seam',
    Reparado: 'tools',
    Diagnosticado: 'clipboard-check',
    Cobrado: 'cash-coin',
    Enviado: 'send',
    Finalizado: 'flag-fill',
    Rechazado: 'x-circle',
    Cancelado: 'slash-circle'
};

/**
 * Componente para un item individual del timeline.
 * Muestra estado, fecha, icono y línea conectora.
 */
export function TimelineItem({
    estado,
    fecha,
    esActual,
    esCompletado,
    observaciones,
    isLast = false
}: TimelineItemProps): React.ReactElement {
    
    const icon = ESTADO_ICONS[estado] || 'circle';
    
    /**
     * Determina el color del item según su estado
     */
    const getItemColor = (): string => {
        if (esActual) return 'primary';
        if (esCompletado) return 'success';
        return 'secondary';
    };
    
    const color = getItemColor();
    
    /**
     * Formatea la fecha para mostrar
     */
    const formatFecha = (fechaStr: string | null): string => {
        if (!fechaStr) return '';
        try {
            return new Date(fechaStr).toLocaleDateString('es-AR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return fechaStr;
        }
    };
    
    return (
        <div className="timeline-item d-flex position-relative mb-4">
            {/* Línea conectora vertical */}
            {!isLast && (
                <div 
                    className="timeline-line position-absolute"
                    style={{
                        left: '19px',
                        top: '40px',
                        bottom: '-32px',
                        width: '2px',
                        backgroundColor: esCompletado ? '#198754' : '#dee2e6'
                    }}
                />
            )}
            
            {/* Icono del estado */}
            <div 
                className={`timeline-icon rounded-circle d-flex align-items-center justify-content-center text-white bg-${color}`}
                style={{
                    width: '40px',
                    height: '40px',
                    minWidth: '40px',
                    position: 'relative',
                    zIndex: 1,
                    border: esActual ? '3px solid #0d6efd' : 'none',
                    boxShadow: esActual ? '0 0 0 4px rgba(13, 110, 253, 0.25)' : 'none'
                }}
            >
                <i className={`bi bi-${icon} ${esActual ? 'fs-5' : ''}`}></i>
            </div>
            
            {/* Contenido del estado */}
            <div className="timeline-content ms-3 flex-grow-1">
                <div className="d-flex align-items-center mb-1">
                    <h6 className="mb-0 me-2">
                        {estado}
                    </h6>
                    
                    {esActual && (
                        <Badge bg="primary" pill>
                            Actual
                        </Badge>
                    )}
                    
                    {esCompletado && !esActual && (
                        <Badge bg="success" pill>
                            <i className="bi bi-check"></i>
                        </Badge>
                    )}
                </div>
                
                {fecha && (
                    <small className="text-muted d-block mb-1">
                        <i className="bi bi-calendar3 me-1"></i>
                        {formatFecha(fecha)}
                    </small>
                )}
                
                {observaciones && (
                    <div className="mt-2 p-2 bg-light rounded">
                        <small className="text-muted">
                            <i className="bi bi-chat-left-text me-1"></i>
                            {observaciones}
                        </small>
                    </div>
                )}
                
                {/* Placeholder para información adicional futura */}
                {esActual && !observaciones && (
                    <small className="text-muted fst-italic">
                        Estado actual de la reparación
                    </small>
                )}
            </div>
        </div>
    );
}
