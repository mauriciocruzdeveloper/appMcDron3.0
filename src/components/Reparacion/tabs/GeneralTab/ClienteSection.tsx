/**
 * ClienteSection.tsx
 * 
 * Sección que muestra información del cliente de la reparación.
 * 
 * @module Reparacion/tabs/GeneralTab
 */

import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { useReparacion } from '../../ReparacionContext';
import { SeccionCard } from '../../components/shared/SeccionCard.component';
import { FormField } from '../../components/shared/FormField.component';

/**
 * Sección de información del cliente.
 * Muestra y permite editar nombre, email, teléfono y dirección.
 */
export function ClienteSection(): React.ReactElement {
    const { 
        reparacion, 
        usuario, 
        onChange, 
        validationErrors,
        isAdmin 
    } = useReparacion();
    
    const handleFieldChange = (field: string, value: string | number) => {
        onChange(field, value);
    };
    
    return (
        <SeccionCard
            title="Información del Cliente"
            subtitle={usuario ? `ID: ${usuario.id}` : undefined}
            icon="person-circle"
        >
            <Row>
                <Col md={12}>
                    <FormField
                        type="text"
                        label="Nombre Completo"
                        name="NombreUsuRep"
                        value={reparacion.data.NombreUsuRep || ''}
                        onChange={handleFieldChange}
                        error={validationErrors.NombreUsuRep}
                        required
                        disabled={!isAdmin}
                        placeholder="Ingrese el nombre del cliente"
                    />
                </Col>
                
                <Col md={6}>
                    <FormField
                        type="email"
                        label="Email"
                        name="EmailUsuRep"
                        value={reparacion.data.EmailUsuRep || ''}
                        onChange={handleFieldChange}
                        error={validationErrors.EmailUsuRep}
                        required
                        disabled={!isAdmin}
                        placeholder="cliente@ejemplo.com"
                        helpText="Email para notificaciones"
                    />
                </Col>
                
                <Col md={6}>
                    <FormField
                        type="text"
                        label="Teléfono"
                        name="TelefonoUsuRep"
                        value={reparacion.data.TelefonoUsuRep || ''}
                        onChange={handleFieldChange}
                        error={validationErrors.TelefonoUsuRep}
                        disabled={!isAdmin}
                        placeholder="+54 9 11 1234-5678"
                        helpText="Número de contacto"
                    />
                </Col>
                
                <Col md={12}>
                    <FormField
                        type="textarea"
                        label="Dirección"
                        name="DireccionUsuRep"
                        value={reparacion.data.DireccionUsuRep || ''}
                        onChange={handleFieldChange}
                        error={validationErrors.DireccionUsuRep}
                        disabled={!isAdmin}
                        placeholder="Calle, número, piso, departamento"
                        rows={2}
                        helpText="Dirección para envío (opcional)"
                    />
                </Col>
            </Row>
            
            {/* Información adicional del usuario (solo lectura) */}
            {usuario && (
                <div className="mt-3 p-3 bg-light rounded">
                    <small className="text-muted">
                        <strong>Usuario registrado:</strong> {usuario.data.NombreUsu || 'N/A'}
                        {usuario.data.EmailUsu && (
                            <> | <strong>Email registrado:</strong> {usuario.data.EmailUsu}</>
                        )}
                    </small>
                </div>
            )}
        </SeccionCard>
    );
}
