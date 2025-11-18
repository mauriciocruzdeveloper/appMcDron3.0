/**
 * ReparacionTabs.component.tsx
 * 
 * Sistema de pestañas para organizar las secciones del módulo de reparación.
 * Muestra: Datos Generales, Flujo de Trabajo, Repuestos, Archivos.
 * 
 * @module Reparacion/components/Tabs
 */

import React from 'react';
import { Tabs, Tab, Container } from 'react-bootstrap';
import { GeneralTab } from '../../tabs/GeneralTab';

interface ReparacionTabsProps {
    /** Tab activa actual */
    activeTab: string;
    
    /** Callback cuando cambia la tab */
    onTabChange: (tabKey: string) => void;
}

/**
 * Sistema de pestañas para el módulo de reparación.
 * 
 * En Phase 2 se implementarán los contenidos de cada tab:
 * - general: Datos básicos del drone y reparación
 * - workflow: Timeline del flujo de estados
 * - repuestos: Gestión de repuestos
 * - archivos: Gestión de archivos adjuntos
 */
export function ReparacionTabs({ activeTab, onTabChange }: ReparacionTabsProps): React.ReactElement {
    return (
        <Tabs
            activeKey={activeTab}
            onSelect={(key) => key && onTabChange(key)}
            id="reparacion-tabs"
            className="mb-3"
        >
            <Tab eventKey="general" title="Datos Generales">
                <GeneralTab />
            </Tab>

            <Tab eventKey="workflow" title="Flujo de Trabajo">
                <Container fluid className="py-3">
                    <div className="text-center text-muted py-5">
                        <i className="bi bi-diagram-3 fs-1 mb-3 d-block"></i>
                        <h5>Pestaña Flujo de Trabajo</h5>
                        <p>Se implementará en Phase 2 - Tab System</p>
                        <small className="text-muted">
                            Mostrará el timeline de estados y transiciones de la reparación
                        </small>
                    </div>
                </Container>
            </Tab>

            <Tab eventKey="repuestos" title="Repuestos">
                <Container fluid className="py-3">
                    <div className="text-center text-muted py-5">
                        <i className="bi bi-box-seam fs-1 mb-3 d-block"></i>
                        <h5>Pestaña Repuestos</h5>
                        <p>Se implementará en Phase 2 - Tab System</p>
                        <small className="text-muted">
                            Mostrará la gestión de repuestos asociados a esta reparación
                        </small>
                    </div>
                </Container>
            </Tab>

            <Tab eventKey="archivos" title="Archivos">
                <Container fluid className="py-3">
                    <div className="text-center text-muted py-5">
                        <i className="bi bi-folder fs-1 mb-3 d-block"></i>
                        <h5>Pestaña Archivos</h5>
                        <p>Se implementará en Phase 2 - Tab System</p>
                        <small className="text-muted">
                            Mostrará fotos, videos y documentos adjuntos
                        </small>
                    </div>
                </Container>
            </Tab>
        </Tabs>
    );
}
