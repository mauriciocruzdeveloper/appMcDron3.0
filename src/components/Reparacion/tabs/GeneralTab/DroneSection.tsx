/**
 * DroneSection.tsx
 * 
 * Sección que muestra información del drone en reparación.
 * 
 * @module Reparacion/tabs/GeneralTab
 */

import React from 'react';
import { Row, Col, Badge } from 'react-bootstrap';
import { useReparacion } from '../../ReparacionContext';
import { SeccionCard } from '../../components/shared/SeccionCard.component';
import { FormField } from '../../components/shared/FormField.component';

/**
 * Sección de información del drone.
 * Muestra modelo, número de serie y observaciones.
 * 
 * **Phase 3 - T3.5:** Conectado a datos reales desde Context.
 * Modelo y drone vienen de Redux, número de serie de DataReparacion.
 */
export function DroneSection(): React.ReactElement {
    const { 
        reparacion, 
        drone,
        modelo,
        onChange, 
        validationErrors,
        isAdmin 
    } = useReparacion();
    
    const handleFieldChange = (field: string, value: string | number) => {
        onChange(field, value);
    };
    
    return (
        <SeccionCard
            title="Información del Drone"
            subtitle={drone ? `${drone.data.Nombre} (ID: ${drone.id})` : 'No asignado'}
            icon="disc"
        >
            <Row>
                {/* Modelo (solo lectura desde Redux) */}
                <Col md={6}>
                    <div className="mb-3">
                        <label className="form-label">
                            <strong>Modelo</strong>
                        </label>
                        <div className="p-2 bg-light rounded">
                            <Badge bg="primary" className="me-2">
                                {modelo?.data.NombreModelo || reparacion.data.ModeloDroneNameRep || 'N/A'}
                            </Badge>
                            {modelo && (
                                <small className="text-muted d-block mt-1">
                                    <strong>Fabricante:</strong> {modelo.data.Fabricante || 'N/A'}
                                </small>
                            )}
                        </div>
                    </div>
                </Col>
                
                {/* Número de Serie */}
                <Col md={6}>
                    <FormField
                        type="text"
                        label="Número de Serie"
                        name="NumeroSerieRep"
                        value={reparacion.data.NumeroSerieRep || drone?.data.NumeroSerie || ''}
                        onChange={handleFieldChange}
                        error={validationErrors.NumeroSerieRep}
                        disabled={!isAdmin}
                        placeholder="SN123456789"
                        helpText="Número de serie del drone"
                    />
                </Col>
                
                {/* Descripción del usuario sobre el problema */}
                <Col md={12}>
                    <FormField
                        type="textarea"
                        label="Descripción del Problema (Cliente)"
                        name="DescripcionUsuRep"
                        value={reparacion.data.DescripcionUsuRep || ''}
                        onChange={handleFieldChange}
                        error={validationErrors.DescripcionUsuRep}
                        disabled={!isAdmin}
                        placeholder="Descripción del problema según el cliente"
                        rows={3}
                        helpText="Motivo de la consulta/reparación"
                        required
                    />
                </Col>
            </Row>
            
            {/* Información adicional del drone desde Redux (solo lectura) */}
            {drone && (
                <div className="mt-3 p-3 bg-light rounded">
                    <small className="text-muted">
                        <div className="mb-1">
                            <strong>Nombre en sistema:</strong> {drone.data.Nombre}
                        </div>
                        <div className="mb-1">
                            <strong>Número Serie (sistema):</strong> {drone.data.NumeroSerie || 'No especificado'}
                        </div>
                        {drone.data.Observaciones && (
                            <div>
                                <strong>Observaciones:</strong> {drone.data.Observaciones}
                            </div>
                        )}
                    </small>
                </div>
            )}
        </SeccionCard>
    );
}
