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
 * Muestra y permite editar nombre, email, teléfono.
 * 
 * **Phase 3 - T3.5:** Conectado a datos reales desde Context.
 * Campos mapeados a DataReparacion: NombreUsu, EmailUsu, TelefonoUsu, ApellidoUsu
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
                <Col md={6}>
                    <FormField
                        type="text"
                        label="Nombre"
                        name="NombreUsu"
                        value={reparacion.data.NombreUsu || ''}
                        onChange={handleFieldChange}
                        error={validationErrors.NombreUsu}
                        required
                        disabled={!isAdmin}
                        placeholder="Ingrese el nombre"
                    />
                </Col>
                
                <Col md={6}>
                    <FormField
                        type="text"
                        label="Apellido"
                        name="ApellidoUsu"
                        value={reparacion.data.ApellidoUsu || ''}
                        onChange={handleFieldChange}
                        error={validationErrors.ApellidoUsu}
                        disabled={!isAdmin}
                        placeholder="Ingrese el apellido"
                    />
                </Col>
                
                <Col md={6}>
                    <FormField
                        type="email"
                        label="Email"
                        name="EmailUsu"
                        value={reparacion.data.EmailUsu || ''}
                        onChange={handleFieldChange}
                        error={validationErrors.EmailUsu}
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
                        name="TelefonoUsu"
                        value={reparacion.data.TelefonoUsu || ''}
                        onChange={handleFieldChange}
                        error={validationErrors.TelefonoUsu}
                        disabled={!isAdmin}
                        placeholder="+54 9 11 1234-5678"
                        helpText="Número de contacto"
                    />
                </Col>
            </Row>
            
            {/* Información adicional del usuario desde Redux (solo lectura) */}
            {usuario && (
                <div className="mt-3 p-3 bg-light rounded">
                    <small className="text-muted d-block">
                        <strong>Usuario en sistema:</strong> {usuario.data.NombreUsu}
                        {usuario.data.ApellidoUsu && ` ${usuario.data.ApellidoUsu}`}
                    </small>
                    {usuario.data.EmailUsu && (
                        <small className="text-muted d-block">
                            <strong>Email registrado:</strong> {usuario.data.EmailUsu}
                        </small>
                    )}
                    {usuario.data.TelefonoUsu && (
                        <small className="text-muted d-block">
                            <strong>Teléfono registrado:</strong> {usuario.data.TelefonoUsu}
                        </small>
                    )}
                </div>
            )}
        </SeccionCard>
    );
}
