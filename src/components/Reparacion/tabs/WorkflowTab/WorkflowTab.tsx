/**
 * WorkflowTab.tsx
 * 
 * Tab de flujo de trabajo y timeline de estados.
 * Muestra el historial de cambios de estado y permite transiciones.
 * 
 * @module Reparacion/tabs/WorkflowTab
 */

import React from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { useReparacion } from '../../ReparacionContext';
import { WorkflowTimeline } from './WorkflowTimeline';
import { StateTransitionPanel } from './StateTransitionPanel';
import { SeccionCard } from '../../components/shared/SeccionCard.component';

/**
 * Tab Workflow - Timeline de estados y transiciones.
 * 
 * Secciones:
 * 1. Timeline vertical con estados completados
 * 2. Panel de transiciones disponibles
 * 3. Información del estado actual
 * 
 * **Phase 3 - T3.5:** Conectado a datos reales desde Context.
 * 
 * @example
 * ```tsx
 * <WorkflowTab />
 * ```
 */
export function WorkflowTab(): React.ReactElement {
    const { 
        reparacion, 
        isLoading, 
        getCurrentEstado 
    } = useReparacion();
    
    const estadoActual = getCurrentEstado();
    const esEstadoFinal = ['Finalizado', 'Cancelado', 'Entregado'].includes(estadoActual);
    const esEstadoPausado = estadoActual === 'Repuestos';
    
    if (isLoading) {
        return (
            <Container fluid className="py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3 text-muted">Cargando flujo de trabajo...</p>
            </Container>
        );
    }
    
    /**
     * Formatea timestamp a fecha legible
     */
    const formatFecha = (timestamp: number | null | undefined): string => {
        if (!timestamp) return 'No especificada';
        try {
            return new Date(timestamp).toLocaleDateString('es-AR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Fecha inválida';
        }
    };
    
    return (
        <Container fluid className="py-3">
            <Row>
                {/* Columna izquierda: Timeline de estados */}
                <Col lg={8}>
                    <SeccionCard
                        title="Timeline de Estados"
                        subtitle={`Estado actual: ${estadoActual}`}
                        icon="diagram-3"
                    >
                        {/* Alertas de estado especial */}
                        {esEstadoFinal && (
                            <Alert variant="success" className="mb-3">
                                <i className="bi bi-check-circle-fill me-2"></i>
                                <strong>Reparación finalizada</strong> - Esta reparación ha completado su ciclo.
                            </Alert>
                        )}
                        
                        {esEstadoPausado && (
                            <Alert variant="warning" className="mb-3">
                                <i className="bi bi-pause-circle-fill me-2"></i>
                                <strong>En espera de repuestos</strong> - La reparación está pausada esperando componentes.
                            </Alert>
                        )}
                        
                        <WorkflowTimeline />
                    </SeccionCard>
                </Col>
                
                {/* Columna derecha: Panel de transiciones */}
                <Col lg={4}>
                    <StateTransitionPanel />
                    
                    {/* Información del estado actual */}
                    <SeccionCard
                        title="Estado Actual"
                        icon="info-circle"
                        className="mt-3"
                    >
                        <div className="p-3 bg-light rounded">
                            <h5 className="mb-3">{estadoActual}</h5>
                            
                            <div className="mb-2">
                                <small className="text-muted">
                                    <strong>Fecha de consulta:</strong>
                                </small>
                                <div>
                                    {formatFecha(reparacion.data.FeConRep)}
                                </div>
                            </div>
                            
                            {reparacion.data.FeRecRep && (
                                <div className="mb-2">
                                    <small className="text-muted">
                                        <strong>Fecha de recepción:</strong>
                                    </small>
                                    <div>
                                        {formatFecha(reparacion.data.FeRecRep)}
                                    </div>
                                </div>
                            )}
                            
                            {reparacion.data.FeFinRep && (
                                <div className="mb-2">
                                    <small className="text-muted">
                                        <strong>Fecha de finalización:</strong>
                                    </small>
                                    <div>
                                        {formatFecha(reparacion.data.FeFinRep)}
                                    </div>
                                </div>
                            )}
                            
                            <div className="mt-3 pt-3 border-top">
                                <small className="text-muted">
                                    <strong>Prioridad:</strong> {reparacion.data.PrioridadRep || 0}
                                </small>
                            </div>
                        </div>
                    </SeccionCard>
                </Col>
            </Row>
        </Container>
    );
}
