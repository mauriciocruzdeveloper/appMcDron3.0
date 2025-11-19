/**
 * RepuestoForm.tsx
 * 
 * Formulario modal para agregar o editar un repuesto.
 * Incluye validación y manejo de estados.
 * 
 * @module Reparacion/tabs/RepuestosTab
 */

import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { Repuesto } from './RepuestosTab';

interface RepuestoFormProps {
    /** Si el modal está visible */
    show: boolean;
    
    /** Repuesto a editar (null para nuevo) */
    repuesto: Repuesto | null;
    
    /** Callback al guardar */
    onSave: (repuesto: Repuesto) => Promise<void>;
    
    /** Callback al cerrar */
    onClose: () => void;
}

/**
 * Formulario para agregar/editar repuestos.
 */
export function RepuestoForm({ show, repuesto, onSave, onClose }: RepuestoFormProps): React.ReactElement {
    const [formData, setFormData] = useState<Partial<Repuesto>>({
        nombre: '',
        descripcion: '',
        precio: 0,
        estado: 'Pendiente',
        proveedor: '',
        notas: ''
    });
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    /**
     * Carga los datos del repuesto cuando se está editando
     */
    useEffect(() => {
        if (repuesto) {
            setFormData(repuesto);
        } else {
            setFormData({
                nombre: '',
                descripcion: '',
                precio: 0,
                estado: 'Pendiente',
                proveedor: '',
                notas: ''
            });
        }
        setErrors({});
        setError(null);
    }, [repuesto, show]);
    
    /**
     * Valida el formulario
     */
    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        
        if (!formData.nombre?.trim()) {
            newErrors.nombre = 'El nombre es obligatorio';
        }
        
        if (formData.precio === undefined || formData.precio < 0) {
            newErrors.precio = 'El precio debe ser mayor o igual a 0';
        }
        
        if (!formData.estado) {
            newErrors.estado = 'Selecciona un estado';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    /**
     * Maneja el cambio de un campo
     */
    const handleChange = (field: keyof Repuesto, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Limpia el error del campo
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };
    
    /**
     * Maneja el cambio de estado y actualiza las fechas correspondientes
     */
    const handleEstadoChange = (nuevoEstado: string) => {
        const now = new Date().toISOString();
        const updates: Partial<Repuesto> = {
            estado: nuevoEstado as Repuesto['estado']
        };
        
        // Actualiza las fechas según el estado
        if (nuevoEstado === 'Recibido' && !formData.fechaRecepcion) {
            updates.fechaRecepcion = now;
        } else if (nuevoEstado === 'Instalado') {
            if (!formData.fechaRecepcion) {
                updates.fechaRecepcion = now;
            }
            if (!formData.fechaInstalacion) {
                updates.fechaInstalacion = now;
            }
        }
        
        setFormData(prev => ({ ...prev, ...updates }));
    };
    
    /**
     * Maneja el envío del formulario
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validate()) return;
        
        setSaving(true);
        setError(null);
        
        try {
            await onSave(formData as Repuesto);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar repuesto');
        } finally {
            setSaving(false);
        }
    };
    
    const isEditing = !!repuesto;
    
    return (
        <Modal show={show} onHide={onClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="bi bi-box-seam me-2"></i>
                    {isEditing ? 'Editar Repuesto' : 'Nuevo Repuesto'}
                </Modal.Title>
            </Modal.Header>
            
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && (
                        <Alert variant="danger" dismissible onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}
                    
                    <Row>
                        <Col md={8}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Nombre del repuesto <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Ej: Hélice DJI Mavic 3"
                                    value={formData.nombre || ''}
                                    onChange={(e) => handleChange('nombre', e.target.value)}
                                    isInvalid={!!errors.nombre}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.nombre}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Estado <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Select
                                    value={formData.estado || 'Pendiente'}
                                    onChange={(e) => handleEstadoChange(e.target.value)}
                                    isInvalid={!!errors.estado}
                                >
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Recibido">Recibido</option>
                                    <option value="Instalado">Instalado</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {errors.estado}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            placeholder="Detalles adicionales del repuesto..."
                            value={formData.descripcion || ''}
                            onChange={(e) => handleChange('descripcion', e.target.value)}
                        />
                    </Form.Group>
                    
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Precio (ARS) <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.precio || ''}
                                    onChange={(e) => handleChange('precio', parseFloat(e.target.value) || 0)}
                                    isInvalid={!!errors.precio}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.precio}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Proveedor</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Nombre del proveedor"
                                    value={formData.proveedor || ''}
                                    onChange={(e) => handleChange('proveedor', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    {/* Fechas automáticas según estado */}
                    {formData.fechaRecepcion && (
                        <Alert variant="info" className="small mb-3">
                            <i className="bi bi-info-circle me-2"></i>
                            Recibido el: {new Date(formData.fechaRecepcion).toLocaleDateString('es-AR')}
                        </Alert>
                    )}
                    
                    {formData.fechaInstalacion && (
                        <Alert variant="success" className="small mb-3">
                            <i className="bi bi-check-circle me-2"></i>
                            Instalado el: {new Date(formData.fechaInstalacion).toLocaleDateString('es-AR')}
                        </Alert>
                    )}
                    
                    <Form.Group className="mb-3">
                        <Form.Label>Notas adicionales</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            placeholder="Observaciones, número de serie, etc..."
                            value={formData.notas || ''}
                            onChange={(e) => handleChange('notas', e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose} disabled={saving}>
                        Cancelar
                    </Button>
                    <Button variant="primary" type="submit" disabled={saving}>
                        {saving ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Guardando...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-check-circle me-2"></i>
                                {isEditing ? 'Actualizar' : 'Agregar'}
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
