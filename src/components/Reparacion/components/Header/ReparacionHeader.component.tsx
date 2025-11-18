/**
 * ReparacionHeader.component.tsx
 * 
 * Header del módulo de reparación.
 * Muestra el estado actual y botones de transición de estado.
 * 
 * @module Reparacion/components/Header
 */

import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useReparacion } from '../../ReparacionContext';
import { useReparacionSummary } from '../../hooks/useReparacionData';
import { EstadoBadge } from '../shared/EstadoBadge.component';
import { EstadoReparacion } from '../../../../usecases/estadosReparacion';

/**
 * Header del módulo de reparación con título, estado y acciones.
 */
export function ReparacionHeader(): React.ReactElement {
    const navigate = useNavigate();
    const { onAdvanceState, getNextEstados, isAdmin, isSaving } = useReparacion();
    const { titulo, subtitulo, estado } = useReparacionSummary();
    
    const nextEstados = getNextEstados();
    
    const handleBack = () => {
        navigate(-1);
    };
    
    const handleChangeState = async (nuevoEstado: string) => {
        await onAdvanceState(nuevoEstado);
    };
    
    return (
        <div className="reparacion-header bg-white border-bottom py-3 mb-3">
            <Container fluid>
                <Row className="align-items-center">
                    <Col xs="auto">
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={handleBack}
                        >
                            <i className="bi bi-arrow-left me-2"></i>
                            Volver
                        </Button>
                    </Col>
                    
                    <Col>
                        <h4 className="mb-0">{titulo}</h4>
                        {subtitulo && <small className="text-muted">{subtitulo}</small>}
                    </Col>
                    
                    <Col xs="auto">
                        <EstadoBadge estado={estado as EstadoReparacion} />
                    </Col>
                    
                    {isAdmin && nextEstados.length > 0 && (
                        <Col xs="auto">
                            <div className="d-flex gap-2">
                                {nextEstados.map((estadoNombre) => (
                                    <Button
                                        key={estadoNombre}
                                        variant="success"
                                        size="sm"
                                        onClick={() => handleChangeState(estadoNombre)}
                                        disabled={isSaving}
                                    >
                                        Avanzar a {estadoNombre}
                                    </Button>
                                ))}
                            </div>
                        </Col>
                    )}
                </Row>
            </Container>
        </div>
    );
}
