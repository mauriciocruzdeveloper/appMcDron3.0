/**
 * RepuestosTab.tsx
 * 
 * Tab para gestión de repuestos de la reparación.
 * Permite agregar, editar y eliminar repuestos con sus estados y precios.
 * 
 * @module Reparacion/tabs/RepuestosTab
 */

import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useReparacion } from '../../ReparacionContext';
import { RepuestosList } from './RepuestosList';
import { RepuestoForm } from './RepuestoForm';

/**
 * Interfaz para un repuesto
 */
export interface Repuesto {
    id: string;
    nombre: string;
    descripcion?: string;
    precio: number;
    estado: 'Pendiente' | 'Recibido' | 'Instalado';
    fechaSolicitud: string;
    fechaRecepcion?: string;
    fechaInstalacion?: string;
    proveedor?: string;
    notas?: string;
}

/**
 * Tab de gestión de repuestos.
 * Permite CRUD completo de repuestos asociados a la reparación.
 */
export function RepuestosTab(): React.ReactElement {
    const { reparacion, isAdmin, isLoading } = useReparacion();
    const [showForm, setShowForm] = useState(false);
    const [editingRepuesto, setEditingRepuesto] = useState<Repuesto | null>(null);
    
    /**
     * En una implementación real, los repuestos vendrían de Redux
     * Por ahora usamos datos de ejemplo
     */
    const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
    
    /**
     * Calcula el total de repuestos
     */
    const calcularTotal = (): number => {
        return repuestos.reduce((sum, rep) => sum + rep.precio, 0);
    };
    
    /**
     * Cuenta repuestos por estado
     */
    const contarPorEstado = () => {
        return {
            pendientes: repuestos.filter(r => r.estado === 'Pendiente').length,
            recibidos: repuestos.filter(r => r.estado === 'Recibido').length,
            instalados: repuestos.filter(r => r.estado === 'Instalado').length
        };
    };
    
    const handleAddRepuesto = () => {
        setEditingRepuesto(null);
        setShowForm(true);
    };
    
    const handleEditRepuesto = (repuesto: Repuesto) => {
        setEditingRepuesto(repuesto);
        setShowForm(true);
    };
    
    const handleDeleteRepuesto = async (repuestoId: string) => {
        const confirmed = window.confirm('¿Estás seguro de eliminar este repuesto?');
        if (!confirmed) return;
        
        try {
            // En implementación real, esto eliminaría del backend
            setRepuestos(prev => prev.filter(r => r.id !== repuestoId));
        } catch (error) {
            console.error('Error al eliminar repuesto:', error);
        }
    };
    
    const handleSaveRepuesto = async (repuesto: Repuesto) => {
        try {
            if (editingRepuesto) {
                // Editar existente
                setRepuestos(prev => prev.map(r => 
                    r.id === repuesto.id ? repuesto : r
                ));
            } else {
                // Agregar nuevo
                const nuevoRepuesto: Repuesto = {
                    ...repuesto,
                    id: `rep_${Date.now()}`,
                    fechaSolicitud: new Date().toISOString()
                };
                setRepuestos(prev => [...prev, nuevoRepuesto]);
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
                            <h3 className="mb-0">{repuestos.length}</h3>
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
            
            {/* Botón para agregar repuesto */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">
                    <i className="bi bi-box-seam me-2"></i>
                    Lista de Repuestos
                </h5>
                {isAdmin && (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleAddRepuesto}
                    >
                        <i className="bi bi-plus-circle me-2"></i>
                        Agregar Repuesto
                    </Button>
                )}
            </div>
            
            {/* Lista de repuestos */}
            <RepuestosList
                repuestos={repuestos}
                onEdit={handleEditRepuesto}
                onDelete={handleDeleteRepuesto}
                isAdmin={isAdmin}
            />
            
            {/* Formulario modal */}
            <RepuestoForm
                show={showForm}
                repuesto={editingRepuesto}
                onSave={handleSaveRepuesto}
                onClose={handleCloseForm}
            />
        </Container>
    );
}
