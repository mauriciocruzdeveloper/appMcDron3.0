/**
 * ReparacionLayout.component.tsx
 * 
 * Layout Component (Presentation Component) para reparaciones.
 * 
 * Responsabilidades:
 * - Estructura visual del módulo (Header + Tabs + Footer)
 * - Navegación entre tabs
 * - NO contiene lógica de negocio (solo UI)
 * 
 * @module Reparacion/ReparacionLayout
 */

import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import { useReparacion } from './ReparacionContext';
import { ReparacionHeader } from './components/Header';
import { ReparacionFooter } from './components/Footer';
import { ReparacionTabs } from './components/Tabs';

/**
 * Layout principal del módulo de reparación.
 * 
 * Estructura:
 * - Header (estado actual + botones de acción)
 * - Tabs (navegación entre secciones)
 * - Footer (botones guardar/cancelar)
 * 
 * @example
 * ```tsx
 * <ReparacionProvider {...props}>
 *   <ReparacionLayout />
 * </ReparacionProvider>
 * ```
 */
export function ReparacionLayout(): React.ReactElement {
    const { isAdmin } = useReparacion();
    
    /**
     * Estado local para la tab activa
     */
    const [activeTab, setActiveTab] = useState<string>('general');
    
    /**
     * Manejar cambio de tab
     */
    const handleTabChange = (tabKey: string) => {
        setActiveTab(tabKey);
        
        // Scroll al inicio cuando cambia de tab
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    return (
        <div className="reparacion-layout">
            {/* Header con estado y acciones */}
            <ReparacionHeader />
            
            {/* Contenido principal */}
            <Container fluid className="mt-3 mb-5">
                {/* Sistema de tabs */}
                <ReparacionTabs 
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                />
            </Container>
            
            {/* Footer con botones principales (solo para admin) */}
            {isAdmin && <ReparacionFooter />}
        </div>
    );
}
