/**
 * GeneralTab.tsx
 * 
 * Tab de información general de la reparación.
 * Muestra datos del cliente, drone y detalles de la reparación.
 * 
 * @module Reparacion/tabs/GeneralTab
 */

import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useReparacion } from '../../ReparacionContext';
import { ClienteSection } from './ClienteSection';
import { DroneSection } from './DroneSection';
import { DetallesSection } from './DetallesSection';

/**
 * Tab General - Información básica de la reparación.
 * 
 * Secciones:
 * 1. Cliente - Nombre, email, teléfono, dirección
 * 2. Drone - Modelo, serie, accesorios, estado físico
 * 3. Detalles - Descripción, observaciones, fechas
 * 
 * @example
 * ```tsx
 * <GeneralTab />
 * ```
 */
export function GeneralTab(): React.ReactElement {
    const { isLoading } = useReparacion();
    
    if (isLoading) {
        return (
            <Container fluid className="py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3 text-muted">Cargando información...</p>
            </Container>
        );
    }
    
    return (
        <Container fluid className="py-3">
            <Row>
                {/* Columna izquierda: Cliente y Drone */}
                <Col lg={6}>
                    <ClienteSection />
                    <DroneSection />
                </Col>
                
                {/* Columna derecha: Detalles de la reparación */}
                <Col lg={6}>
                    <DetallesSection />
                </Col>
            </Row>
        </Container>
    );
}
