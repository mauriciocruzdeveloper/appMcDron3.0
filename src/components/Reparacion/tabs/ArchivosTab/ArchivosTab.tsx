/**
 * ArchivosTab.tsx
 * 
 * Tab de gestión de archivos adjuntos (fotos, videos, documentos).
 * Permite visualizar, subir y eliminar archivos de la reparación.
 * 
 * **Phase 3 - T3.5:** Conectado a datos reales:
 * - urlsFotos: string[] (URLs de fotos generales)
 * - urlsDocumentos: string[] (URLs de documentos)
 * - FotoAntes: string (URL de foto "antes" de reparación)
 * - FotoDespues: string (URL de foto "después" de reparación)
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
type FileCategory = 'fotos' | 'documentos';

/**
 * Tab de Archivos - Gestión de fotos y documentos.
 * 
 * Campos reales de DataReparacion:
 * - urlsFotos: array de URLs de fotos generales
 * - urlsDocumentos: array de URLs de documentos
 * - FotoAntes: URL de la foto "antes" (estado inicial)
 * - FotoDespues: URL de la foto "después" (estado final)
 * 
 * @example
 * ```tsx
 * <ArchivosTab />
 * ```
 */
export function ArchivosTab(): React.ReactElement {
    const { reparacion, isLoading, onChange } = useReparacion();
    
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
                                    Fotos ({(reparacion.data.urlsFotos || []).length})
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link
                                    active={activeCategory === 'documentos'}
                                    onClick={() => setActiveCategory('documentos')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <i className="bi bi-file-earmark-text me-2"></i>
                                    Documentos ({(reparacion.data.urlsDocumentos || []).length})
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                        
                        {/* Contenido según categoría activa */}
                        {activeCategory === 'fotos' && (
                            <ImageGallery 
                                fotos={reparacion.data.urlsFotos || []}
                                fotoAntes={reparacion.data.FotoAntes}
                                fotoDespues={reparacion.data.FotoDespues}
                            />
                        )}
                        
                        {activeCategory === 'documentos' && (
                            <FileList
                                files={reparacion.data.urlsDocumentos || []}
                                category="documentos"
                            />
                        )}
                    </SeccionCard>
                </Col>
                
                {/* Columna lateral: Upload de archivos */}
                <Col lg={4}>
                    <FileUploader
                        categoria={activeCategory}
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
                                <li><strong>Documentos:</strong> PDF, DOC, XLS (max 10MB)</li>
                            </ul>
                            
                            <div className="mb-2">
                                <strong>Categorización de fotos:</strong>
                            </div>
                            <ul className="mb-0">
                                <li><strong>Antes:</strong> Estado inicial del drone (FotoAntes)</li>
                                <li><strong>Después:</strong> Estado tras reparación (FotoDespues)</li>
                                <li><strong>Generales:</strong> Otras fotos del proceso (urlsFotos)</li>
                            </ul>
                        </div>
                    </SeccionCard>
                </Col>
            </Row>
        </Container>
    );
}
