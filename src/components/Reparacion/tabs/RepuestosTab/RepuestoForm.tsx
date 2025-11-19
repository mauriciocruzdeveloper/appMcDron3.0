/**
 * RepuestoForm.tsx
 * 
 * Formulario modal para seleccionar repuestos del inventario.
 * 
 * **Phase 3 - T3.5:** Simplificado para seleccionar repuestos existentes
 * del inventario Redux en lugar de crear nuevos.
 * 
 * @module Reparacion/tabs/RepuestosTab
 */

import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { useAppSelector } from '../../../../redux-tool-kit/redux.hooks';
import { selectRepuestosArray } from '../../../../redux-tool-kit/repuesto/repuesto.selectors';

interface RepuestoFormProps {
    /** Si el modal está visible */
    show: boolean;
    
    /** ID del repuesto a editar (null para nuevo) */
    repuestoId: string | null;
    
    /** Callback al guardar - recibe el ID del repuesto seleccionado */
    onSave: (repuestoId: string) => Promise<void>;
    
    /** Callback al cerrar */
    onClose: () => void;
}

/**
 * Formulario para seleccionar repuestos del inventario.
 * TODO: En futuras iteraciones, permitir crear repuestos nuevos.
 */
export function RepuestoForm({ show, onSave, onClose }: RepuestoFormProps): React.ReactElement {
    const [selectedId, setSelectedId] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Obtiene todos los repuestos disponibles en el inventario
    const repuestosDisponibles = useAppSelector(selectRepuestosArray);
    
    /**
     * Maneja el envío del formulario
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedId) {
            setError('Debes seleccionar un repuesto');
            return;
        }
        
        setSaving(true);
        setError(null);
        
        try {
            await onSave(selectedId);
            setSelectedId('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al agregar repuesto');
            setSaving(false);
        }
    };
    
    const handleClose = () => {
        setSelectedId('');
        setError(null);
        onClose();
    };
    
    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="bi bi-box-seam me-2"></i>
                    Agregar Repuesto del Inventario
                </Modal.Title>
            </Modal.Header>
            
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && (
                        <Alert variant="danger" dismissible onClose={() => setError(null)}>
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            {error}
                        </Alert>
                    )}
                    
                    <Form.Group className="mb-3">
                        <Form.Label>Seleccionar Repuesto *</Form.Label>
                        <Form.Select
                            value={selectedId}
                            onChange={(e) => setSelectedId(e.target.value)}
                            disabled={saving}
                            required
                        >
                            <option value="">-- Seleccionar del inventario --</option>
                            {repuestosDisponibles.map(repuesto => (
                                <option key={repuesto.id} value={repuesto.id}>
                                    {repuesto.data.NombreRepu} - ${repuesto.data.PrecioRepu.toLocaleString('es-AR')} 
                                    {` (Stock: ${repuesto.data.StockRepu})`}
                                </option>
                            ))}
                        </Form.Select>
                        <Form.Text className="text-muted">
                            Selecciona un repuesto existente del inventario para agregarlo a esta reparación.
                        </Form.Text>
                    </Form.Group>
                    
                    {selectedId && (() => {
                        const repuesto = repuestosDisponibles.find(r => r.id === selectedId);
                        if (!repuesto) return null;
                        
                        return (
                            <Alert variant="info">
                                <h6>Detalles del Repuesto:</h6>
                                <ul className="mb-0">
                                    <li><strong>Nombre:</strong> {repuesto.data.NombreRepu}</li>
                                    <li><strong>Precio:</strong> ${repuesto.data.PrecioRepu.toLocaleString('es-AR')}</li>
                                    <li><strong>Stock:</strong> {repuesto.data.StockRepu} unidades</li>
                                    <li><strong>Proveedor:</strong> {repuesto.data.ProveedorRepu || 'No especificado'}</li>
                                </ul>
                            </Alert>
                        );
                    })()}
                    
                    {repuestosDisponibles.length === 0 && (
                        <Alert variant="warning">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            No hay repuestos disponibles en el inventario. Agrega repuestos desde el módulo de inventario primero.
                        </Alert>
                    )}
                </Modal.Body>
                
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={saving}>
                        Cancelar
                    </Button>
                    <Button 
                        variant="primary" 
                        type="submit" 
                        disabled={saving || !selectedId}
                    >
                        {saving ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" />
                                Agregando...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-check-circle me-2"></i>
                                Agregar Repuesto
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
