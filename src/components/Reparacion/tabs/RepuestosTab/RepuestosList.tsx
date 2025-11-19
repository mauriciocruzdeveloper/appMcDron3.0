/**
 * RepuestosList.tsx
 * 
 * Lista/tabla de repuestos con acciones de edición y eliminación.
 * Muestra información completa de cada repuesto y su estado.
 * 
 * @module Reparacion/tabs/RepuestosTab
 */

import React from 'react';
import { Table, Badge, Button, Card } from 'react-bootstrap';
import { Repuesto } from './RepuestosTab';

interface RepuestosListProps {
    /** Lista de repuestos */
    repuestos: Repuesto[];
    
    /** Callback para editar repuesto */
    onEdit: (repuesto: Repuesto) => void;
    
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
 * Formatea una fecha en formato corto
 */
function formatFecha(fecha?: string): string {
    if (!fecha) return '-';
    
    return new Date(fecha).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Lista de repuestos en formato tabla.
 */
export function RepuestosList({ repuestos, onEdit, onDelete, isAdmin }: RepuestosListProps): React.ReactElement {
    
    if (repuestos.length === 0) {
        return (
            <Card>
                <Card.Body>
                    <div className="text-center py-5 text-muted">
                        <i className="bi bi-box-seam fs-1 mb-3 d-block"></i>
                        <h5>No hay repuestos registrados</h5>
                        <p>Agrega repuestos necesarios para esta reparación</p>
                    </div>
                </Card.Body>
            </Card>
        );
    }
    
    return (
        <Card>
            <Card.Body className="p-0">
                <Table hover responsive className="mb-0">
                    <thead className="bg-light">
                        <tr>
                            <th style={{ width: '30%' }}>Repuesto</th>
                            <th style={{ width: '15%' }}>Estado</th>
                            <th style={{ width: '12%' }} className="text-end">Precio</th>
                            <th style={{ width: '12%' }}>Solicitado</th>
                            <th style={{ width: '12%' }}>Recibido</th>
                            <th style={{ width: '12%' }}>Instalado</th>
                            {isAdmin && <th style={{ width: '120px' }} className="text-center">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {repuestos.map((repuesto) => {
                            const badge = getEstadoBadge(repuesto.estado);
                            
                            return (
                                <tr key={repuesto.id}>
                                    <td>
                                        <div className="fw-bold">{repuesto.nombre}</div>
                                        {repuesto.descripcion && (
                                            <small className="text-muted">{repuesto.descripcion}</small>
                                        )}
                                        {repuesto.proveedor && (
                                            <div>
                                                <small className="text-muted">
                                                    <i className="bi bi-building me-1"></i>
                                                    {repuesto.proveedor}
                                                </small>
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <Badge bg={badge.bg}>
                                            <i className={`bi ${badge.icon} me-1`}></i>
                                            {repuesto.estado}
                                        </Badge>
                                    </td>
                                    <td className="text-end fw-bold">
                                        ${repuesto.precio.toLocaleString('es-AR', { 
                                            minimumFractionDigits: 2 
                                        })}
                                    </td>
                                    <td className="small text-muted">
                                        {formatFecha(repuesto.fechaSolicitud)}
                                    </td>
                                    <td className="small text-muted">
                                        {formatFecha(repuesto.fechaRecepcion)}
                                    </td>
                                    <td className="small text-muted">
                                        {formatFecha(repuesto.fechaInstalacion)}
                                    </td>
                                    {isAdmin && (
                                        <td className="text-center">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => onEdit(repuesto)}
                                                className="me-1"
                                                title="Editar"
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => onDelete(repuesto.id)}
                                                title="Eliminar"
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
                                ${repuestos.reduce((sum, r) => sum + r.precio, 0).toLocaleString('es-AR', {
                                    minimumFractionDigits: 2
                                })}
                            </td>
                            <td colSpan={isAdmin ? 4 : 3}></td>
                        </tr>
                    </tfoot>
                </Table>
            </Card.Body>
        </Card>
    );
}
