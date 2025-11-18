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
import { useReparacion, useReparacionStatus } from '../../ReparacionContext';
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
 * @example
 * ```tsx
 * <WorkflowTab />
 * ```
 */
export function WorkflowTab(): React.ReactElement {
    const { reparacion, isLoading } = useReparacion();
    const { estadoActual, esEstadoFinal, esEstadoPausado } = useReparacionStatus();
    
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
                                    <strong>Fecha de ingreso:</strong>
                                </small>
                                <div>
                                    {reparacion.data.FechaIngresoRep 
                                        ? new Date(reparacion.data.FechaIngresoRep).toLocaleDateString('es-AR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })
                                        : 'No especificada'
                                    }
                                </div>
                            </div>
                            
                            {reparacion.data.FechaEstimadaEntregaRep && (
                                <div className="mb-2">
                                    <small className="text-muted">
                                        <strong>Fecha estimada de entrega:</strong>
                                    </small>
                                    <div>
                                        {new Date(reparacion.data.FechaEstimadaEntregaRep).toLocaleDateString('es-AR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                            )}
                            
                            <div className="mt-3 pt-3 border-top">
                                <small className="text-muted">
                                    <i className="bi bi-clock-history me-1"></i>
                                    Tiempo en estado actual: <strong>Calculando...</strong>
                                </small>
                            </div>
                        </div>
                    </SeccionCard>
                </Col>
            </Row>
        </Container>
    );
}
