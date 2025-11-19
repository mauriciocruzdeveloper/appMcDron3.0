/**
 * ReparacionTabs.component.tsx
 * 
 * Sistema de pestañas para organizar las secciones del módulo de reparación.
 * Muestra: Datos Generales, Flujo de Trabajo, Repuestos, Archivos.
 * 
 * @module Reparacion/components/Tabs
 */

import React from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { GeneralTab } from '../../tabs/GeneralTab';
import { WorkflowTab } from '../../tabs/WorkflowTab';
import { ArchivosTab } from '../../tabs/ArchivosTab';
import { RepuestosTab } from '../../tabs/RepuestosTab';

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
                <WorkflowTab />
            </Tab>

            <Tab eventKey="repuestos" title="Repuestos">
                <RepuestosTab />
            </Tab>

            <Tab eventKey="archivos" title="Archivos">
                <ArchivosTab />
            </Tab>
        </Tabs>
    );
}
