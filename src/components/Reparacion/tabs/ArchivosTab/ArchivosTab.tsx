/**
 * ArchivosTab.tsx
 * 
 * Tab de gestión de archivos adjuntos (fotos, videos, documentos).
 * Permite visualizar, subir y eliminar archivos de la reparación.
 * 
 * @module Reparacion/tabs/ArchivosTab
 */

import React, { useState } from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { useReparacion } from '../../ReparacionContext';
import { ImageGallery } from './ImageGallery';
import { FileUploader } from './FileUploader';
import { FileList } from './FileList';
import { SeccionCard } from '../../components/shared/SeccionCard.component';

/**
 * Tipos de archivos soportados
 */
type FileCategory = 'fotos' | 'videos' | 'documentos';

/**
 * Tab de Archivos - Gestión de fotos, videos y documentos.
 * 
 * Secciones:
 * 1. Galería de imágenes (fotos antes/después)
 * 2. Lista de videos
 * 3. Lista de documentos
 * 4. Uploader de archivos
 * 
 * @example
 * ```tsx
 * <ArchivosTab />
 * ```
 */
export function ArchivosTab(): React.ReactElement {
    const { reparacion, isLoading, onUploadFile, onDeleteFile } = useReparacion();
    
    const [activeCategory, setActiveCategory] = useState<FileCategory>('fotos');
    
    if (isLoading) {
        return (
            <Container fluid className="py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3 text-muted">Cargando archivos...</p>
            </Container>
        );
    }
    
    return (
        <Container fluid className="py-3">
            <Row>
                {/* Columna principal: Visualización de archivos */}
                <Col lg={8}>
                    <SeccionCard
                        title="Archivos de la Reparación"
                        subtitle={`Reparación #${reparacion.id || 'Nueva'}`}
                        icon="folder"
                    >
                        {/* Navegación por categorías */}
                        <Nav variant="tabs" className="mb-3">
                            <Nav.Item>
                                <Nav.Link
                                    active={activeCategory === 'fotos'}
                                    onClick={() => setActiveCategory('fotos')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <i className="bi bi-images me-2"></i>
                                    Fotos
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link
                                    active={activeCategory === 'videos'}
                                    onClick={() => setActiveCategory('videos')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <i className="bi bi-camera-video me-2"></i>
                                    Videos
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link
                                    active={activeCategory === 'documentos'}
                                    onClick={() => setActiveCategory('documentos')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <i className="bi bi-file-earmark-text me-2"></i>
                                    Documentos
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                        
                        {/* Contenido según categoría activa */}
                        {activeCategory === 'fotos' && (
                            <ImageGallery 
                                reparacionId={reparacion.id || ''}
                                onDeleteFile={onDeleteFile}
                            />
                        )}
                        
                        {activeCategory === 'videos' && (
                            <FileList
                                category="videos"
                                reparacionId={reparacion.id || ''}
                                onDeleteFile={onDeleteFile}
                            />
                        )}
                        
                        {activeCategory === 'documentos' && (
                            <FileList
                                category="documentos"
                                reparacionId={reparacion.id || ''}
                                onDeleteFile={onDeleteFile}
                            />
                        )}
                    </SeccionCard>
                </Col>
                
                {/* Columna lateral: Upload de archivos */}
                <Col lg={4}>
                    <FileUploader
                        reparacionId={reparacion.id || ''}
                        category={activeCategory}
                        onUploadFile={onUploadFile}
                    />
                    
                    {/* Información de uso */}
                    <SeccionCard
                        title="Información"
                        icon="info-circle"
                        className="mt-3"
                    >
                        <div className="small text-muted">
                            <div className="mb-2">
                                <strong>Formatos aceptados:</strong>
                            </div>
                            <ul className="mb-3">
                                <li><strong>Fotos:</strong> JPG, PNG, GIF (max 5MB)</li>
                                <li><strong>Videos:</strong> MP4, MOV, AVI (max 50MB)</li>
                                <li><strong>Documentos:</strong> PDF, DOC, XLS (max 10MB)</li>
                            </ul>
                            
                            <div className="mb-2">
                                <strong>Categorización de fotos:</strong>
                            </div>
                            <ul>
                                <li><strong>Antes:</strong> Estado inicial del drone</li>
                                <li><strong>Después:</strong> Estado tras reparación</li>
                                <li><strong>Proceso:</strong> Fotos durante reparación</li>
                            </ul>
                        </div>
                    </SeccionCard>
                </Col>
            </Row>
        </Container>
    );
}
