/**
 * DetallesSection.tsx
 * 
 * Sección que muestra detalles de la reparación.
 * 
 * @module Reparacion/tabs/GeneralTab
 */

import React from 'react';
import { Row, Col, Badge } from 'react-bootstrap';
import { useReparacion, useReparacionStatus } from '../../ReparacionContext';
import { SeccionCard } from '../../components/shared/SeccionCard.component';
import { FormField } from '../../components/shared/FormField.component';

/**
 * Sección de detalles de la reparación.
 * Muestra descripción del problema, observaciones, fechas y costos.
 */
export function DetallesSection(): React.ReactElement {
    const { 
        reparacion, 
        onChange, 
        validationErrors,
        isAdmin 
    } = useReparacion();
    
    const { estadoActual } = useReparacionStatus();
    
    const handleFieldChange = (field: string, value: string | number) => {
        onChange(field, value);
    };
    
    /**
     * Formatea fecha para mostrar en formato legible
     */
    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return 'No especificada';
        try {
            return new Date(dateString).toLocaleDateString('es-AR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return 'Fecha inválida';
        }
    };
    
    return (
        <SeccionCard
            title="Detalles de la Reparación"
            subtitle={`Estado: ${estadoActual}`}
            icon="tools"
        >
            <Row>
                {/* Número de reparación y fechas (solo lectura) */}
                <Col md={12}>
                    <div className="mb-3 p-3 bg-light rounded">
                        <Row>
                            <Col md={6}>
                                <strong>Nº Reparación:</strong>
                                <Badge bg="secondary" className="ms-2">
                                    {reparacion.id || 'Nuevo'}
                                </Badge>
                            </Col>
                            <Col md={6}>
                                <strong>Fecha Ingreso:</strong>
                                <div className="text-muted">
                                    {formatDate(reparacion.data.FechaIngresoRep)}
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Col>
                
                {/* Descripción del usuario (problema reportado) */}
                <Col md={12}>
                    <FormField
                        type="textarea"
                        label="Descripción del Problema (Cliente)"
                        name="DescripcionUsuRep"
                        value={reparacion.data.DescripcionUsuRep || ''}
                        onChange={handleFieldChange}
                        error={validationErrors.DescripcionUsuRep}
                        required
                        disabled={!isAdmin}
                        placeholder="Descripción del problema según lo reportado por el cliente"
                        rows={4}
                        helpText="Lo que el cliente indica como problema"
                    />
                </Col>
                
                {/* Observaciones técnicas */}
                <Col md={12}>
                    <FormField
                        type="textarea"
                        label="Observaciones Técnicas"
                        name="ObservacionesRep"
                        value={reparacion.data.ObservacionesRep || ''}
                        onChange={handleFieldChange}
                        error={validationErrors.ObservacionesRep}
                        disabled={!isAdmin}
                        placeholder="Observaciones técnicas del personal de taller"
                        rows={4}
                        helpText="Notas internas sobre la reparación"
                    />
                </Col>
                
                {/* Diagnóstico técnico */}
                <Col md={12}>
                    <FormField
                        type="textarea"
                        label="Diagnóstico Técnico"
                        name="DiagnosticoRep"
                        value={reparacion.data.DiagnosticoRep || ''}
                        onChange={handleFieldChange}
                        error={validationErrors.DiagnosticoRep}
                        disabled={!isAdmin}
                        placeholder="Diagnóstico técnico detallado del problema"
                        rows={4}
                        helpText="Resultado del análisis técnico"
                    />
                </Col>
                
                {/* Información de costos */}
                <Col md={12}>
                    <div className="mt-3 p-3 bg-info bg-opacity-10 rounded border border-info">
                        <h6 className="mb-3">
                            <i className="bi bi-cash-coin me-2"></i>
                            Información de Costos
                        </h6>
                        <Row>
                            <Col md={6}>
                                <FormField
                                    type="number"
                                    label="Presupuesto (ARS)"
                                    name="PresupuestoRep"
                                    value={reparacion.data.PresupuestoRep || 0}
                                    onChange={handleFieldChange}
                                    error={validationErrors.PresupuestoRep}
                                    disabled={!isAdmin}
                                    placeholder="0.00"
                                    helpText="Monto presupuestado"
                                />
                            </Col>
                            <Col md={6}>
                                <FormField
                                    type="number"
                                    label="Costo Final (ARS)"
                                    name="CostoFinalRep"
                                    value={reparacion.data.CostoFinalRep || 0}
                                    onChange={handleFieldChange}
                                    error={validationErrors.CostoFinalRep}
                                    disabled={!isAdmin}
                                    placeholder="0.00"
                                    helpText="Costo final de la reparación"
                                />
                            </Col>
                        </Row>
                    </div>
                </Col>
                
                {/* Fechas adicionales */}
                <Col md={12}>
                    <div className="mt-3">
                        <h6 className="mb-3">
                            <i className="bi bi-calendar-event me-2"></i>
                            Fechas Importantes
                        </h6>
                        <Row>
                            <Col md={6}>
                                <FormField
                                    type="date"
                                    label="Fecha Estimada Entrega"
                                    name="FechaEstimadaEntregaRep"
                                    value={reparacion.data.FechaEstimadaEntregaRep || ''}
                                    onChange={handleFieldChange}
                                    error={validationErrors.FechaEstimadaEntregaRep}
                                    disabled={!isAdmin}
                                    helpText="Fecha prevista de finalización"
                                />
                            </Col>
                            <Col md={6}>
                                <FormField
                                    type="date"
                                    label="Fecha Real Entrega"
                                    name="FechaEntregaRep"
                                    value={reparacion.data.FechaEntregaRep || ''}
                                    onChange={handleFieldChange}
                                    error={validationErrors.FechaEntregaRep}
                                    disabled={!isAdmin}
                                    helpText="Fecha real de entrega"
                                />
                            </Col>
                        </Row>
                    </div>
                </Col>
            </Row>
        </SeccionCard>
    );
}
