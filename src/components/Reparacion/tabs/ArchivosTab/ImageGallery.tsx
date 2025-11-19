/**
 * ImageGallery.tsx
 * 
 * Galería de imágenes para la reparación.
 * Muestra fotos categorizadas: antes, después y generales.
 * 
 * **Phase 3 - T3.5:** Conectado a datos reales desde DataReparacion.
 * 
 * @module Reparacion/tabs/ArchivosTab
 */

import React, { useState } from 'react';
import { Row, Col, Card, Badge, Modal, Alert } from 'react-bootstrap';

interface ImageGalleryProps {
    /** Array de URLs de fotos generales */
    fotos: string[];
    
    /** URL de la foto "antes" */
    fotoAntes?: string;
    
    /** URL de la foto "después" */
    fotoDespues?: string;
}

/**
 * Galería de imágenes con preview modal.
 */
export function ImageGallery({ fotos, fotoAntes, fotoDespues }: ImageGalleryProps): React.ReactElement {
    const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
    
    const handleImageClick = (url: string) => {
        setSelectedUrl(url);
    };
    
    const totalImages = fotos.length + (fotoAntes ? 1 : 0) + (fotoDespues ? 1 : 0);
    
    if (totalImages === 0) {
        return (
            <Alert variant="info" className="text-center">
                <i className="bi bi-images fs-1 mb-3 d-block"></i>
                <h5>No hay fotos adjuntas</h5>
                <p className="mb-0">Sube fotos del drone antes y después de la reparación usando el panel lateral.</p>
            </Alert>
        );
    }
    
    return (
        <>
            {/* Sección: Foto Antes */}
            {fotoAntes && (
                <div className="mb-4">
                    <h6 className="mb-3">
                        <Badge bg="danger" className="me-2">Antes</Badge>
                        Estado inicial del drone
                    </h6>
                    <Row>
                        <Col md={6} lg={4}>
                            <Card 
                                className="shadow-sm hover-shadow" 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleImageClick(fotoAntes)}
                            >
                                <Card.Img 
                                    variant="top" 
                                    src={fotoAntes} 
                                    style={{ height: '200px', objectFit: 'cover' }}
                                    alt="Foto antes de la reparación"
                                />
                                <Card.Body className="p-2 text-center">
                                    <small className="text-muted">Click para ampliar</small>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </div>
            )}
            
            {/* Sección: Foto Después */}
            {fotoDespues && (
                <div className="mb-4">
                    <h6 className="mb-3">
                        <Badge bg="success" className="me-2">Después</Badge>
                        Estado tras reparación
                    </h6>
                    <Row>
                        <Col md={6} lg={4}>
                            <Card 
                                className="shadow-sm hover-shadow" 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleImageClick(fotoDespues)}
                            >
                                <Card.Img 
                                    variant="top" 
                                    src={fotoDespues} 
                                    style={{ height: '200px', objectFit: 'cover' }}
                                    alt="Foto después de la reparación"
                                />
                                <Card.Body className="p-2 text-center">
                                    <small className="text-muted">Click para ampliar</small>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </div>
            )}
            
            {/* Sección: Fotos Generales */}
            {fotos.length > 0 && (
                <div className="mb-4">
                    <h6 className="mb-3">
                        <Badge bg="primary" className="me-2">Generales</Badge>
                        Otras fotos del proceso ({fotos.length})
                    </h6>
                    <Row xs={2} md={3} lg={4} className="g-3">
                        {fotos.map((url, index) => (
                            <Col key={index}>
                                <Card 
                                    className="shadow-sm hover-shadow" 
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleImageClick(url)}
                                >
                                    <Card.Img 
                                        variant="top" 
                                        src={url} 
                                        style={{ height: '150px', objectFit: 'cover' }}
                                        alt={`Foto ${index + 1}`}
                                    />
                                    <Card.Body className="p-2 text-center">
                                        <small className="text-muted">Foto #{index + 1}</small>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            )}
            
            {/* Modal para preview de imagen */}
            <Modal 
                show={!!selectedUrl} 
                onHide={() => setSelectedUrl(null)}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Preview de Imagen</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center p-0">
                    {selectedUrl && (
                        <img 
                            src={selectedUrl} 
                            alt="Preview" 
                            style={{ width: '100%', height: 'auto' }}
                        />
                    )}
                </Modal.Body>
            </Modal>
        </>
    );
}
