/**
 * ImageGallery.tsx
 * 
 * Galería de imágenes para la reparación.
 * Muestra fotos categorizadas (antes, después, proceso).
 * 
 * @module Reparacion/tabs/ArchivosTab
 */

import React, { useState } from 'react';
import { Row, Col, Card, Badge, Button, Modal } from 'react-bootstrap';
import { useReparacion } from '../../ReparacionContext';

interface ImageGalleryProps {
    /** ID de la reparación */
    reparacionId: string;
    
    /** Callback para eliminar archivo */
    onDeleteFile?: (fileId: string, tipo: string) => Promise<void>;
}

/**
 * Interfaz para una imagen
 */
interface ImageData {
    id: string;
    url: string;
    categoria: 'antes' | 'despues' | 'proceso';
    descripcion?: string;
    fecha: string;
}

/**
 * Galería de imágenes con categorización y preview.
 */
export function ImageGallery({ onDeleteFile }: ImageGalleryProps): React.ReactElement {
    const { isAdmin } = useReparacion();
    const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
    const [showModal, setShowModal] = useState(false);
    
    /**
     * En una implementación real, estas imágenes vendrían de Redux o API
     * Por ahora usamos datos de ejemplo
     */
    const images: ImageData[] = [
        // Placeholder - en implementación real vendría de la base de datos
    ];
    
    const handleImageClick = (image: ImageData) => {
        setSelectedImage(image);
        setShowModal(true);
    };
    
    const handleDelete = async (imageId: string) => {
        if (!onDeleteFile) return;
        
        const confirmed = window.confirm('¿Estás seguro de eliminar esta imagen?');
        if (!confirmed) return;
        
        try {
            await onDeleteFile(imageId, 'foto');
            setShowModal(false);
        } catch (error) {
            console.error('Error al eliminar imagen:', error);
        }
    };
    
    /**
     * Agrupa imágenes por categoría
     */
    const imagesByCategory = {
        antes: images.filter(img => img.categoria === 'antes'),
        despues: images.filter(img => img.categoria === 'despues'),
        proceso: images.filter(img => img.categoria === 'proceso')
    };
    
    const getCategoryBadge = (categoria: string) => {
        const badges = {
            antes: { bg: 'danger', text: 'Antes' },
            despues: { bg: 'success', text: 'Después' },
            proceso: { bg: 'primary', text: 'Proceso' }
        };
        const badge = badges[categoria as keyof typeof badges];
        return <Badge bg={badge.bg}>{badge.text}</Badge>;
    };
    
    if (images.length === 0) {
        return (
            <div className="text-center py-5 text-muted">
                <i className="bi bi-images fs-1 mb-3 d-block"></i>
                <h5>No hay fotos adjuntas</h5>
                <p>Sube fotos del drone antes y después de la reparación</p>
            </div>
        );
    }
    
    return (
        <>
            {/* Sección: Fotos Antes */}
            {imagesByCategory.antes.length > 0 && (
                <div className="mb-4">
                    <h6 className="mb-3">
                        <Badge bg="danger" className="me-2">Antes</Badge>
                        Estado inicial del drone
                    </h6>
                    <Row xs={2} md={3} lg={4} className="g-3">
                        {imagesByCategory.antes.map((image) => (
                            <Col key={image.id}>
                                <Card 
                                    className="h-100 shadow-sm" 
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleImageClick(image)}
                                >
                                    <Card.Img 
                                        variant="top" 
                                        src={image.url} 
                                        style={{ height: '150px', objectFit: 'cover' }}
                                    />
                                    {image.descripcion && (
                                        <Card.Body className="p-2">
                                            <Card.Text className="small text-muted mb-0">
                                                {image.descripcion}
                                            </Card.Text>
                                        </Card.Body>
                                    )}
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            )}
            
            {/* Sección: Fotos Después */}
            {imagesByCategory.despues.length > 0 && (
                <div className="mb-4">
                    <h6 className="mb-3">
                        <Badge bg="success" className="me-2">Después</Badge>
                        Estado tras reparación
                    </h6>
                    <Row xs={2} md={3} lg={4} className="g-3">
                        {imagesByCategory.despues.map((image) => (
                            <Col key={image.id}>
                                <Card 
                                    className="h-100 shadow-sm" 
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleImageClick(image)}
                                >
                                    <Card.Img 
                                        variant="top" 
                                        src={image.url} 
                                        style={{ height: '150px', objectFit: 'cover' }}
                                    />
                                    {image.descripcion && (
                                        <Card.Body className="p-2">
                                            <Card.Text className="small text-muted mb-0">
                                                {image.descripcion}
                                            </Card.Text>
                                        </Card.Body>
                                    )}
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            )}
            
            {/* Sección: Fotos del Proceso */}
            {imagesByCategory.proceso.length > 0 && (
                <div className="mb-4">
                    <h6 className="mb-3">
                        <Badge bg="primary" className="me-2">Proceso</Badge>
                        Durante la reparación
                    </h6>
                    <Row xs={2} md={3} lg={4} className="g-3">
                        {imagesByCategory.proceso.map((image) => (
                            <Col key={image.id}>
                                <Card 
                                    className="h-100 shadow-sm" 
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleImageClick(image)}
                                >
                                    <Card.Img 
                                        variant="top" 
                                        src={image.url} 
                                        style={{ height: '150px', objectFit: 'cover' }}
                                    />
                                    {image.descripcion && (
                                        <Card.Body className="p-2">
                                            <Card.Text className="small text-muted mb-0">
                                                {image.descripcion}
                                            </Card.Text>
                                        </Card.Body>
                                    )}
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            )}
            
            {/* Modal de preview de imagen */}
            <Modal 
                show={showModal} 
                onHide={() => setShowModal(false)}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {selectedImage && getCategoryBadge(selectedImage.categoria)}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedImage && (
                        <>
                            <img 
                                src={selectedImage.url} 
                                alt="Preview"
                                className="img-fluid w-100 mb-3"
                            />
                            {selectedImage.descripcion && (
                                <p className="text-muted">{selectedImage.descripcion}</p>
                            )}
                            <small className="text-muted">
                                <i className="bi bi-calendar3 me-1"></i>
                                {new Date(selectedImage.fecha).toLocaleDateString('es-AR')}
                            </small>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {isAdmin && selectedImage && (
                        <Button 
                            variant="danger" 
                            onClick={() => handleDelete(selectedImage.id)}
                        >
                            <i className="bi bi-trash me-2"></i>
                            Eliminar
                        </Button>
                    )}
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
