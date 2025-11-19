/**
 * StateTransitionPanel.tsx
 * 
 * Panel que muestra las transiciones de estado disponibles.
 * Permite cambiar el estado de la reparación.
 * 
 * **Phase 3 - T3.5:** Conectado a datos reales desde Context usando
 * useReparacion y useReparacionPermissions para validaciones de permisos.
 * 
 * @module Reparacion/tabs/WorkflowTab
 */

import React, { useState } from 'react';
import { Alert } from 'react-bootstrap';
import { useReparacion, useReparacionPermissions } from '../../ReparacionContext';
import { SeccionCard } from '../../components/shared/SeccionCard.component';
import { ActionButton } from '../../components/shared/ActionButton.component';
import { EstadoBadge } from '../../components/shared/EstadoBadge.component';
import { EstadoReparacion } from '../../../../usecases/estadosReparacion';

/**
 * Mapeo de estados a descripciones
 */
const ESTADO_DESCRIPTIONS: Partial<Record<EstadoReparacion, string>> = {
    Consulta: 'Cliente realiza consulta inicial',
    Respondido: 'Consulta respondida por el equipo',
    Transito: 'Drone en tránsito hacia el taller',
    Recibido: 'Drone recibido en el taller',
    Revisado: 'Revisión técnica inicial completada',
    Presupuestado: 'Presupuesto generado y enviado',
    Aceptado: 'Cliente aceptó el presupuesto',
    Repuestos: 'Esperando llegada de repuestos',
    Reparado: 'Reparación completada exitosamente',
    Diagnosticado: 'Diagnóstico técnico completado',
    Cobrado: 'Pago recibido',
    Enviado: 'Drone enviado al cliente',
    Finalizado: 'Proceso finalizado',
    Rechazado: 'Presupuesto rechazado por el cliente',
    Cancelado: 'Reparación cancelada'
};

/**
 * Panel de transiciones de estado disponibles.
 * Muestra botones para avanzar al siguiente estado.
 */
export function StateTransitionPanel(): React.ReactElement {
    const { 
        getNextEstados, 
        onAdvanceState, 
        isSaving,
        isAdmin
    } = useReparacion();
    
    const { canAdvance } = useReparacionPermissions();
    
    const [selectedEstado, setSelectedEstado] = useState<string | null>(null);
    
    const nextEstados = getNextEstados();
    
    /**
     * Maneja el click en un botón de transición
     */
    const handleTransition = async (estadoNuevo: string) => {
        if (!canAdvance(estadoNuevo)) {
            return;
        }
        
        setSelectedEstado(estadoNuevo);
        
        try {
            await onAdvanceState(estadoNuevo);
            setSelectedEstado(null);
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            setSelectedEstado(null);
        }
    };
    
    if (!isAdmin) {
        return (
            <SeccionCard
                title="Transiciones de Estado"
                icon="arrow-right-circle"
            >
                <Alert variant="warning" className="mb-0">
                    <i className="bi bi-lock-fill me-2"></i>
                    Solo administradores pueden cambiar el estado de las reparaciones.
                </Alert>
            </SeccionCard>
        );
    }
    
    if (nextEstados.length === 0) {
        return (
            <SeccionCard
                title="Transiciones de Estado"
                icon="arrow-right-circle"
            >
                <Alert variant="info" className="mb-0">
                    <i className="bi bi-info-circle-fill me-2"></i>
                    No hay transiciones disponibles desde el estado actual.
                    Esta reparación puede haber llegado a un estado final.
                </Alert>
            </SeccionCard>
        );
    }
    
    return (
        <SeccionCard
            title="Transiciones Disponibles"
            subtitle={`${nextEstados.length} opción${nextEstados.length !== 1 ? 'es' : ''} disponible${nextEstados.length !== 1 ? 's' : ''}`}
            icon="arrow-right-circle"
        >
            <div className="d-flex flex-column gap-3">
                {nextEstados.map((estado) => (
                    <div key={estado} className="border rounded p-3">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <EstadoBadge estado={estado as EstadoReparacion} />
                        </div>
                        
                        <p className="mb-3 small text-muted">
                            {ESTADO_DESCRIPTIONS[estado as EstadoReparacion] || 'Cambiar al siguiente estado'}
                        </p>
                        
                        <ActionButton
                            variant="primary"
                            size="sm"
                            icon="arrow-right"
                            onClick={() => handleTransition(estado)}
                            loading={isSaving && selectedEstado === estado}
                            loadingText="Cambiando..."
                            disabled={!canAdvance(estado) || (isSaving && selectedEstado !== estado)}
                            className="w-100"
                        >
                            Avanzar a {estado}
                        </ActionButton>
                    </div>
                ))}
            </div>
            
            <Alert variant="light" className="mt-3 mb-0">
                <small className="text-muted">
                    <i className="bi bi-exclamation-triangle me-1"></i>
                    <strong>Importante:</strong> Los cambios de estado son permanentes y quedarán registrados en el historial.
                </small>
            </Alert>
        </SeccionCard>
    );
}
