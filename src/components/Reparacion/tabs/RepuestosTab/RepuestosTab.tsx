/**
 * RepuestosTab.tsx
 * 
 * Tab para gestión de repuestos de la reparación.
 * Permite agregar, editar y eliminar repuestos con sus estados y precios.
 * 
 * **Phase 3 - T3.5:** Conectado a datos reales desde Context y Redux.
 * Usa RepuestosSolicitados (array de IDs) y ObsRepuestos desde DataReparacion.
 * 
 * @module Reparacion/tabs/RepuestosTab
 */

import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Form } from 'react-bootstrap';
import { useReparacion } from '../../ReparacionContext';
import { useAppSelector } from '../../../../redux-tool-kit/redux.hooks';
import { RepuestosList } from './RepuestosList';
import { RepuestoForm } from './RepuestoForm';
import type { Repuesto } from '../../../../types/repuesto';

/**
 * Interfaz extendida para repuestos en reparación (incluye estado de instalación)
 */
export interface RepuestoEnReparacion {
    repuestoId: string;
    repuesto: Repuesto | null;
    estado: 'Pendiente' | 'Recibido' | 'Instalado';
}

/**
 * Tab de gestión de repuestos.
 * Conectado a RepuestosSolicitados del DataReparacion.
 */
export function RepuestosTab(): React.ReactElement {
    const { reparacion, isAdmin, isLoading, onChange } = useReparacion();
    const [showForm, setShowForm] = useState(false);
    const [editingRepuesto, setEditingRepuesto] = useState<string | null>(null);
    
    // Obtiene todos los repuestos del estado Redux
    const todosRepuestos = useAppSelector(state => state.repuesto.coleccionRepuestos);
    
    // Obtiene los IDs de repuestos solicitados
    const repuestoIds: string[] = reparacion.data.RepuestosSolicitados || [];
    
    /**
     * Mapea los IDs a objetos RepuestoEnReparacion con datos del Redux store
     */
    const repuestosSolicitados: RepuestoEnReparacion[] = repuestoIds.map((id: string) => ({
        repuestoId: id,
        repuesto: todosRepuestos[id] || null,
        estado: 'Pendiente' as const // TODO: guardar estado real en reparación
    }));
    
    /**
     * Calcula el total de repuestos
     */
    const calcularTotal = (): number => {
        return repuestosSolicitados.reduce((sum, item) => {
            return sum + (item.repuesto?.data.PrecioRepu || 0);
        }, 0);
    };
    
    /**
     * Cuenta repuestos por estado
     */
    const contarPorEstado = () => {
        return {
            pendientes: repuestosSolicitados.filter(r => r.estado === 'Pendiente').length,
            recibidos: repuestosSolicitados.filter(r => r.estado === 'Recibido').length,
            instalados: repuestosSolicitados.filter(r => r.estado === 'Instalado').length
        };
    };
    
    const handleAddRepuesto = () => {
        setEditingRepuesto(null);
        setShowForm(true);
    };
    
    const handleEditRepuesto = (repuestoId: string) => {
        setEditingRepuesto(repuestoId);
        setShowForm(true);
    };
    
    const handleDeleteRepuesto = async (repuestoId: string) => {
        const confirmed = window.confirm('¿Estás seguro de quitar este repuesto de la reparación?');
        if (!confirmed) return;
        
        try {
            // Remover del array RepuestosSolicitados
            const nuevosIds: string[] = (reparacion.data.RepuestosSolicitados || [])
                .filter((id: string) => id !== repuestoId);
            
            onChange('RepuestosSolicitados', nuevosIds);
        } catch (error) {
            console.error('Error al eliminar repuesto:', error);
        }
    };
    
    const handleSaveRepuesto = async (repuestoId: string) => {
        try {
            // Agregar al array RepuestosSolicitados si no existe
            const idsActuales = reparacion.data.RepuestosSolicitados || [];
            if (!idsActuales.includes(repuestoId)) {
                onChange('RepuestosSolicitados', [...idsActuales, repuestoId]);
            }
            
            setShowForm(false);
            setEditingRepuesto(null);
        } catch (error) {
            console.error('Error al guardar repuesto:', error);
            throw error;
        }
    };
    
    const handleCloseForm = () => {
        setShowForm(false);
        setEditingRepuesto(null);
    };
    
    /**
     * Maneja cambios en las observaciones de repuestos
     */
    const handleObsRepuestosChange = (value: string) => {
        onChange('ObsRepuestos', value);
    };
    
    const estadisticas = contarPorEstado();
    const total = calcularTotal();
    
    if (isLoading) {
        return (
            <Container fluid className="py-3 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </Container>
        );
    }
    
    return (
        <Container fluid className="py-3">
            {/* Header con estadísticas */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="text-center h-100">
                        <Card.Body>
                            <div className="text-muted small mb-1">Total Repuestos</div>
                            <h3 className="mb-0">{repuestosSolicitados.length}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center h-100 border-warning">
                        <Card.Body>
                            <div className="text-muted small mb-1">Pendientes</div>
                            <h3 className="mb-0 text-warning">{estadisticas.pendientes}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center h-100 border-info">
                        <Card.Body>
                            <div className="text-muted small mb-1">Recibidos</div>
                            <h3 className="mb-0 text-info">{estadisticas.recibidos}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center h-100 border-success">
                        <Card.Body>
                            <div className="text-muted small mb-1">Costo Total</div>
                            <h3 className="mb-0 text-success">
                                ${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </h3>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            {/* Información contextual según estado de reparación */}
            {reparacion.data.EstadoRep === 'Repuestos' && (
                <Alert variant="warning" className="mb-3">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    La reparación está en espera de repuestos. Actualiza el estado de los repuestos para continuar.
                </Alert>
            )}
            
            {/* Observaciones sobre repuestos */}
            <Card className="mb-3">
                <Card.Body>
                    <Card.Title className="h6 mb-3">
                        <i className="bi bi-journal-text me-2"></i>
                        Observaciones sobre Repuestos
                    </Card.Title>
                    <Form.Group>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={reparacion.data.ObsRepuestos || ''}
                            onChange={(e) => handleObsRepuestosChange(e.target.value)}
                            placeholder="Especifica qué repuestos se necesitan, detalles adicionales, etc..."
                            disabled={!isAdmin}
                            maxLength={2000}
                        />
                        <Form.Text className="text-muted">
                            Campo de texto libre para especificar detalles sobre los repuestos necesarios.
                        </Form.Text>
                    </Form.Group>
                </Card.Body>
            </Card>
            
            {/* Botón para agregar repuesto */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">
                    <i className="bi bi-box-seam me-2"></i>
                    Repuestos del Inventario ({repuestosSolicitados.length})
                </h5>
                {isAdmin && (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleAddRepuesto}
                    >
                        <i className="bi bi-plus-circle me-2"></i>
                        Agregar del Inventario
                    </Button>
                )}
            </div>
            
            {/* Lista de repuestos */}
            <RepuestosList
                repuestos={repuestosSolicitados}
                onEdit={handleEditRepuesto}
                onDelete={handleDeleteRepuesto}
                isAdmin={isAdmin}
            />
            
            {repuestosSolicitados.length === 0 && (
                <Alert variant="info" className="text-center">
                    <i className="bi bi-info-circle me-2"></i>
                    No hay repuestos agregados a esta reparación.
                    {isAdmin && ' Usa el botón "Agregar del Inventario" para seleccionar repuestos.'}
                </Alert>
            )}
            
            {/* Formulario modal */}
            <RepuestoForm
                show={showForm}
                repuestoId={editingRepuesto}
                onSave={handleSaveRepuesto}
                onClose={handleCloseForm}
            />
        </Container>
    );
}
