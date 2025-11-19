/**
 * DetallesSection.tsx
 * 
 * Sección que muestra detalles de la reparación.
 * 
 * @module Reparacion/tabs/GeneralTab
 */

import React from 'react';
import { Row, Col, Badge } from 'react-bootstrap';
import { useReparacion } from '../../ReparacionContext';
import { SeccionCard } from '../../components/shared/SeccionCard.component';
import { FormField } from '../../components/shared/FormField.component';

/**
 * Sección de detalles de la reparación.
 * Muestra descripción del problema, diagnóstico, observaciones y costos.
 * 
 * **Phase 3 - T3.5:** Conectado a datos reales desde Context.
 * Campos mapeados a DataReparacion real.
 */
export function DetallesSection(): React.ReactElement {
    const { 
        reparacion, 
        onChange, 
        validationErrors,
        isAdmin,
        getCurrentEstado 
    } = useReparacion();
    
    const estadoActual = getCurrentEstado();
    
    const handleFieldChange = (field: string, value: string | number) => {
        onChange(field, value);
    };
    
    /**
     * Formatea timestamp para mostrar en formato legible
     */
    const formatDate = (timestamp: number | null | undefined): string => {
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
        <SeccionCard
            title="Detalles de la Reparación"
            subtitle={`Estado: ${estadoActual}`}
            icon="tools"
        >
            <Row>
                {/* Número de reparación y fecha de consulta (solo lectura) */}
                <Col md={12}>
                    <div className="mb-3 p-3 bg-light rounded">
                        <Row>
                            <Col md={6}>
                                <strong>Nº Reparación:</strong>
                                <Badge bg="secondary" className="ms-2">
                                    {reparacion.id === 'new' ? 'Nueva' : reparacion.id}
                                </Badge>
                            </Col>
                            <Col md={6}>
                                <strong>Fecha Consulta:</strong>
                                <div className="text-muted">
                                    {formatDate(reparacion.data.FeConRep)}
                                </div>
                            </Col>
                        </Row>
                        {reparacion.data.FeRecRep && (
                            <Row className="mt-2">
                                <Col md={12}>
                                    <strong>Fecha Recibido:</strong>
                                    <div className="text-muted">
                                        {formatDate(reparacion.data.FeRecRep)}
                                    </div>
                                </Col>
                            </Row>
                        )}
                    </div>
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
                
                {/* Descripción técnica de la reparación */}
                <Col md={12}>
                    <FormField
                        type="textarea"
                        label="Descripción Técnica de la Reparación"
                        name="DescripcionTecRep"
                        value={reparacion.data.DescripcionTecRep || ''}
                        onChange={handleFieldChange}
                        error={validationErrors.DescripcionTecRep}
                        disabled={!isAdmin}
                        placeholder="Descripción detallada del trabajo realizado"
                        rows={4}
                        helpText="Procedimientos realizados durante la reparación"
                    />
                </Col>
                
                {/* Anotaciones privadas */}
                <Col md={12}>
                    <FormField
                        type="textarea"
                        label="Anotaciones Privadas"
                        name="AnotacionesRep"
                        value={reparacion.data.AnotacionesRep || ''}
                        onChange={handleFieldChange}
                        error={validationErrors.AnotacionesRep}
                        disabled={!isAdmin}
                        placeholder="Notas internas del taller (no visibles para el cliente)"
                        rows={3}
                        helpText="Información interna del taller"
                    />
                </Col>
                
                {/* Información de costos */}
                <Col md={12}>
                    <div className="mt-3 p-3 bg-info bg-opacity-10 rounded border border-info">
                        <h6 className="mb-3">
                            <i className="bi bi-cash-coin me-2"></i>
                            Información de Presupuestos
                        </h6>
                        <Row>
                            <Col md={6}>
                                <FormField
                                    type="number"
                                    label="Presupuesto Diagnóstico (ARS)"
                                    name="PresuDiRep"
                                    value={reparacion.data.PresuDiRep || 0}
                                    onChange={handleFieldChange}
                                    error={validationErrors.PresuDiRep}
                                    disabled={!isAdmin}
                                    placeholder="0.00"
                                    helpText="Costo del diagnóstico"
                                />
                            </Col>
                            <Col md={6}>
                                <FormField
                                    type="number"
                                    label="Presupuesto Mano de Obra (ARS)"
                                    name="PresuMoRep"
                                    value={reparacion.data.PresuMoRep || 0}
                                    onChange={handleFieldChange}
                                    error={validationErrors.PresuMoRep}
                                    disabled={!isAdmin}
                                    placeholder="0.00"
                                    helpText="Costo de mano de obra"
                                />
                            </Col>
                            <Col md={6}>
                                <FormField
                                    type="number"
                                    label="Presupuesto Repuestos (ARS)"
                                    name="PresuReRep"
                                    value={reparacion.data.PresuReRep || 0}
                                    onChange={handleFieldChange}
                                    error={validationErrors.PresuReRep}
                                    disabled={!isAdmin}
                                    placeholder="0.00"
                                    helpText="Costo de repuestos"
                                />
                            </Col>
                            <Col md={6}>
                                <FormField
                                    type="number"
                                    label="Presupuesto Final (ARS)"
                                    name="PresuFiRep"
                                    value={reparacion.data.PresuFiRep || 0}
                                    onChange={handleFieldChange}
                                    error={validationErrors.PresuFiRep}
                                    disabled={!isAdmin}
                                    placeholder="0.00"
                                    helpText="Presupuesto total final"
                                />
                            </Col>
                        </Row>
                    </div>
                </Col>
                
                {/* Prioridad */}
                <Col md={12}>
                    <div className="mt-3">
                        <FormField
                            type="number"
                            label="Prioridad"
                            name="PrioridadRep"
                            value={reparacion.data.PrioridadRep || 0}
                            onChange={handleFieldChange}
                            error={validationErrors.PrioridadRep}
                            disabled={!isAdmin}
                            placeholder="0"
                            helpText="Nivel de prioridad (0 = normal, mayor número = más prioritario)"
                        />
                    </div>
                </Col>
            </Row>
        </SeccionCard>
    );
}
