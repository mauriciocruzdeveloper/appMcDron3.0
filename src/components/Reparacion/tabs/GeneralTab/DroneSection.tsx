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
 * Muestra modelo, número de serie, accesorios y estado físico.
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
            subtitle={drone ? `ID: ${drone.id}` : undefined}
            icon="disc"
        >
            <Row>
                {/* Modelo (solo lectura desde la BD) */}
                <Col md={6}>
                    <div className="mb-3">
                        <label className="form-label">
                            <strong>Modelo</strong>
                        </label>
                        <div className="p-2 bg-light rounded">
                            <Badge bg="primary" className="me-2">
                                {modelo?.data.NombreModelo || 'N/A'}
                            </Badge>
                            {modelo && (
                                <small className="text-muted">
                                    {modelo.data.MarcaModelo || ''}
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
                        name="NumeroSerie"
                        value={drone?.data.NumeroSerie || ''}
                        onChange={handleFieldChange}
                        error={validationErrors.NumeroSerie}
                        disabled={!isAdmin}
                        placeholder="SN123456789"
                        helpText="Número de serie del drone"
                    />
                </Col>
                
                {/* Accesorios incluidos */}
                <Col md={12}>
                    <FormField
                        type="textarea"
                        label="Accesorios Incluidos"
                        name="AccesoriosRep"
                        value={reparacion.data.AccesoriosRep || ''}
                        onChange={handleFieldChange}
                        error={validationErrors.AccesoriosRep}
                        disabled={!isAdmin}
                        placeholder="Ejemplo: Control, batería, cargador, estuche"
                        rows={3}
                        helpText="Lista de accesorios que acompañan al drone"
                    />
                </Col>
                
                {/* Estado físico del drone */}
                <Col md={12}>
                    <FormField
                        type="textarea"
                        label="Estado Físico"
                        name="EstadoFisicoRep"
                        value={reparacion.data.EstadoFisicoRep || ''}
                        onChange={handleFieldChange}
                        error={validationErrors.EstadoFisicoRep}
                        disabled={!isAdmin}
                        placeholder="Descripción del estado físico: rayones, golpes, partes faltantes, etc."
                        rows={3}
                        helpText="Condición física del drone al momento del ingreso"
                    />
                </Col>
            </Row>
            
            {/* Información adicional del drone (solo lectura) */}
            {drone && (
                <div className="mt-3 p-3 bg-light rounded">
                    <small className="text-muted">
                        <div className="mb-1">
                            <strong>Fecha de compra:</strong> {
                                drone.data.FechaCompraDro 
                                    ? new Date(drone.data.FechaCompraDro).toLocaleDateString('es-AR')
                                    : 'No especificada'
                            }
                        </div>
                        {drone.data.ObservacionesDro && (
                            <div>
                                <strong>Observaciones del drone:</strong> {drone.data.ObservacionesDro}
                            </div>
                        )}
                    </small>
                </div>
            )}
        </SeccionCard>
    );
}
