/**
 * ReparacionFooter.component.tsx
 * 
 * Footer del módulo de reparación.
 * Contiene botones principales de acción (Guardar, Cancelar).
 * 
 * @module Reparacion/components/Footer
 */

import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useReparacion, useReparacionPermissions } from '../../ReparacionContext';

/**
 * Footer con botones de acción principales.
 * Se muestra fijo en la parte inferior de la pantalla.
 */
export function ReparacionFooter(): React.ReactElement {
    const { onSave, onCancel, isDirty, isSaving } = useReparacion();
    const { canSave } = useReparacionPermissions();
    
    return (
        <div className="reparacion-footer bg-white border-top py-3 position-fixed bottom-0 start-0 end-0" style={{ zIndex: 1000 }}>
            <Container fluid>
                <Row className="align-items-center">
                    <Col>
                        {isDirty && (
                            <small className="text-warning">
                                <i className="bi bi-exclamation-triangle me-2"></i>
                                Tienes cambios sin guardar
                            </small>
                        )}
                    </Col>
                    
                    <Col xs="auto">
                        <Button
                            variant="secondary"
                            onClick={() => onCancel()}
                            disabled={isSaving}
                            className="me-2"
                        >
                            Cancelar
                        </Button>
                        
                        <Button
                            variant="primary"
                            onClick={onSave}
                            disabled={!canSave() || isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-save me-2"></i>
                                    Guardar Cambios
                                </>
                            )}
                        </Button>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
