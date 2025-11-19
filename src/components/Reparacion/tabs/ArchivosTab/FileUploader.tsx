/**
 * FileUploader.tsx
 * 
 * Componente para subir archivos con drag & drop.
 * Soporta validación de tipo y tamaño de archivo.
 * 
 * @module Reparacion/tabs/ArchivosTab
 */

import React, { useState, useRef } from 'react';
import { Card, Form, Button, ProgressBar, Alert } from 'react-bootstrap';

interface FileUploaderProps {
    /** Categoría de archivo a subir */
    categoria: 'fotos' | 'videos' | 'documentos';
    
    /** Callback para subir archivo */
    onUpload: (file: File, metadata: FileMetadata) => Promise<void>;
    
    /** Si está deshabilitado (no admin) */
    disabled?: boolean;
}

/**
 * Metadata del archivo a subir
 */
interface FileMetadata {
    categoria: 'antes' | 'despues' | 'proceso';
    descripcion?: string;
}

/**
 * Configuración de tipos de archivo permitidos por categoría
 */
const FILE_CONFIG = {
    fotos: {
        accept: '.jpg,.jpeg,.png,.gif',
        maxSize: 5 * 1024 * 1024, // 5MB
        types: ['image/jpeg', 'image/png', 'image/gif']
    },
    videos: {
        accept: '.mp4,.mov,.avi',
        maxSize: 50 * 1024 * 1024, // 50MB
        types: ['video/mp4', 'video/quicktime', 'video/x-msvideo']
    },
    documentos: {
        accept: '.pdf,.doc,.docx,.xls,.xlsx',
        maxSize: 10 * 1024 * 1024, // 10MB
        types: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
    }
};

/**
 * Componente para subir archivos con drag & drop.
 */
export function FileUploader({ categoria, onUpload, disabled = false }: FileUploaderProps): React.ReactElement {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [metadata, setMetadata] = useState<FileMetadata>({ categoria: 'proceso' });
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const config = FILE_CONFIG[categoria];
    
    const validateFile = (file: File): string | null => {
        if (!config.types.includes(file.type)) {
            return 'Tipo de archivo no permitido';
        }
        if (file.size > config.maxSize) {
            const maxSizeMB = config.maxSize / (1024 * 1024);
            return `El archivo excede el tamaño máximo de ${maxSizeMB}MB`;
        }
        return null;
    };
    
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) {
            setIsDragging(true);
        }
    };
    
    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };
    
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        
        if (disabled) return;
        
        const file = e.dataTransfer.files[0];
        if (!file) return;
        
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }
        
        setSelectedFile(file);
        setError(null);
    };
    
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }
        
        setSelectedFile(file);
        setError(null);
    };
    
    const handleUpload = async () => {
        if (!selectedFile) return;
        
        setUploading(true);
        setProgress(0);
        setError(null);
        
        try {
            // Simular progreso de subida
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);
            
            await onUpload(selectedFile, metadata);
            
            clearInterval(progressInterval);
            setProgress(100);
            
            // Limpiar estado
            setTimeout(() => {
                setSelectedFile(null);
                setMetadata({ categoria: 'proceso' });
                setProgress(0);
                setUploading(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }, 1000);
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al subir archivo');
            setUploading(false);
        }
    };
    
    const handleCancel = () => {
        setSelectedFile(null);
        setMetadata({ categoria: 'proceso' });
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    return (
        <Card>
            <Card.Body>
                <h5 className="mb-3">
                    <i className="bi bi-cloud-upload me-2"></i>
                    Subir archivo
                </h5>
                
                {error && (
                    <Alert variant="danger" dismissible onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}
                
                {/* Zona de drag & drop */}
                <div
                    className={`border rounded p-4 text-center mb-3 ${
                        isDragging ? 'border-primary bg-light' : 'border-secondary'
                    } ${disabled ? 'opacity-50' : ''}`}
                    style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !disabled && fileInputRef.current?.click()}
                >
                    <i className={`bi ${isDragging ? 'bi-cloud-download' : 'bi-cloud-arrow-up'} fs-1 text-muted mb-2 d-block`}></i>
                    <p className="mb-1">
                        {isDragging ? 'Suelta el archivo aquí' : 'Arrastra un archivo o haz clic'}
                    </p>
                    <small className="text-muted">
                        Formatos: {config.accept.replace(/\./g, '').toUpperCase()} 
                        {' | '}Máximo: {config.maxSize / (1024 * 1024)}MB
                    </small>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={config.accept}
                        onChange={handleFileSelect}
                        disabled={disabled}
                        style={{ display: 'none' }}
                    />
                </div>
                
                {/* Archivo seleccionado */}
                {selectedFile && (
                    <div className="mb-3">
                        <Alert variant="info" className="mb-2">
                            <i className="bi bi-file-earmark me-2"></i>
                            {selectedFile.name}
                            <small className="ms-2 text-muted">
                                ({(selectedFile.size / 1024).toFixed(1)} KB)
                            </small>
                        </Alert>
                        
                        {/* Metadata para fotos */}
                        {categoria === 'fotos' && (
                            <>
                                <Form.Group className="mb-2">
                                    <Form.Label className="small">Categoría</Form.Label>
                                    <Form.Select
                                        size="sm"
                                        value={metadata.categoria}
                                        onChange={(e) => setMetadata({ ...metadata, categoria: e.target.value as 'antes' | 'despues' | 'proceso' })}
                                        disabled={uploading}
                                    >
                                        <option value="antes">Antes de reparar</option>
                                        <option value="despues">Después de reparar</option>
                                        <option value="proceso">Durante el proceso</option>
                                    </Form.Select>
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label className="small">Descripción (opcional)</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        size="sm"
                                        placeholder="Breve descripción de la foto..."
                                        value={metadata.descripcion || ''}
                                        onChange={(e) => setMetadata({ ...metadata, descripcion: e.target.value })}
                                        disabled={uploading}
                                    />
                                </Form.Group>
                            </>
                        )}
                        
                        {/* Progress bar */}
                        {uploading && (
                            <ProgressBar 
                                now={progress} 
                                label={`${progress}%`}
                                className="mb-3"
                                animated
                                striped
                            />
                        )}
                        
                        {/* Botones de acción */}
                        <div className="d-flex gap-2">
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleUpload}
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Subiendo...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-upload me-2"></i>
                                        Subir
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={handleCancel}
                                disabled={uploading}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                )}
                
                {disabled && (
                    <Alert variant="warning" className="mb-0 mt-3">
                        <i className="bi bi-lock me-2"></i>
                        Solo administradores pueden subir archivos
                    </Alert>
                )}
            </Card.Body>
        </Card>
    );
}
