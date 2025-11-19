/**
 * RepuestosList.tsx
 * 
 * Lista/tabla de repuestos con acciones de edición y eliminación.
 * Muestra información completa de cada repuesto y su estado.
 * 
 * **Phase 3 - T3.5:** Adaptado para trabajar con RepuestoEnReparacion
 * que contiene referencias a repuestos del inventario Redux.
 * 
 * @module Reparacion/tabs/RepuestosTab
 */

import React from 'react';
import { Table, Badge, Button, Card } from 'react-bootstrap';
import type { RepuestoEnReparacion } from './RepuestosTab';

interface RepuestosListProps {
    /** Lista de repuestos en reparación */
    repuestos: RepuestoEnReparacion[];
    
    /** Callback para editar repuesto */
    onEdit: (repuestoId: string) => void;
    
    /** Callback para eliminar repuesto */
    onDelete: (repuestoId: string) => void;
    
    /** Si el usuario es admin */
    isAdmin: boolean;
}

/**
 * Obtiene el color del badge según el estado
 */
function getEstadoBadge(estado: string): { bg: string; icon: string } {
    const badges = {
        'Pendiente': { bg: 'warning', icon: 'bi-clock-history' },
        'Recibido': { bg: 'info', icon: 'bi-box-seam' },
        'Instalado': { bg: 'success', icon: 'bi-check-circle-fill' }
    };
    
    return badges[estado as keyof typeof badges] || { bg: 'secondary', icon: 'bi-question-circle' };
}

/**
 * Lista de repuestos en formato tabla.
 * Muestra repuestos del inventario asociados a la reparación.
 */
export function RepuestosList({ repuestos, onDelete, isAdmin }: RepuestosListProps): React.ReactElement {
    
    return (
        <Card>
            <Card.Body className="p-0">
                <Table hover responsive className="mb-0">
                    <thead className="bg-light">
                        <tr>
                            <th style={{ width: '35%' }}>Repuesto</th>
                            <th style={{ width: '15%' }}>Estado</th>
                            <th style={{ width: '12%' }} className="text-end">Precio</th>
                            <th style={{ width: '12%' }}>Stock</th>
                            <th style={{ width: '14%' }}>Proveedor</th>
                            {isAdmin && <th style={{ width: '120px' }} className="text-center">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {repuestos.map((item) => {
                            const badge = getEstadoBadge(item.estado);
                            const repuesto = item.repuesto;
                            
                            // Si el repuesto no se encuentra en Redux, mostramos ID
                            if (!repuesto) {
                                return (
                                    <tr key={item.repuestoId}>
                                        <td colSpan={isAdmin ? 6 : 5} className="text-danger">
                                            <i className="bi bi-exclamation-triangle me-2"></i>
                                            Repuesto no encontrado (ID: {item.repuestoId})
                                        </td>
                                    </tr>
                                );
                            }
                            
                            return (
                                <tr key={item.repuestoId}>
                                    <td>
                                        <div className="fw-bold">{repuesto.data.NombreRepu}</div>
                                        <small className="text-muted">ID: {item.repuestoId}</small>
                                    </td>
                                    <td>
                                        <Badge bg={badge.bg}>
                                            <i className={`bi ${badge.icon} me-1`}></i>
                                            {item.estado}
                                        </Badge>
                                    </td>
                                    <td className="text-end fw-bold">
                                        ${repuesto.data.PrecioRepu.toLocaleString('es-AR', { 
                                            minimumFractionDigits: 2 
                                        })}
                                    </td>
                                    <td>
                                        <span className={repuesto.data.StockRepu > 0 ? 'text-success' : 'text-danger'}>
                                            {repuesto.data.StockRepu} unidades
                                        </span>
                                    </td>
                                    <td className="small text-muted">
                                        {repuesto.data.ProveedorRepu || '-'}
                                    </td>
                                    {isAdmin && (
                                        <td className="text-center">
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => onDelete(item.repuestoId)}
                                                title="Quitar de reparación"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </Button>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot className="bg-light">
                        <tr>
                            <td colSpan={2} className="fw-bold">TOTAL</td>
                            <td className="text-end fw-bold text-success">
                                ${repuestos.reduce((sum, item) => 
                                    sum + (item.repuesto?.data.PrecioRepu || 0), 0
                                ).toLocaleString('es-AR', {
                                    minimumFractionDigits: 2
                                })}
                            </td>
                            <td colSpan={isAdmin ? 3 : 2}></td>
                        </tr>
                    </tfoot>
                </Table>
            </Card.Body>
        </Card>
    );
}
