/**
 * FileList.tsx
 * 
 * Lista de archivos (videos o documentos).
 * Muestra información del archivo con acciones de descarga/eliminación.
 * 
 * **Phase 3 - T3.5:** Conectado a urlsDocumentos de DataReparacion.
 * 
 * @module Reparacion/tabs/ArchivosTab
 */

import React from 'react';
import { Table, Button, Badge } from 'react-bootstrap';

interface FileListProps {
    /** Array de URLs de documentos */
    documentos: string[];
    
    /** Si el usuario es admin */
    isAdmin: boolean;
    
    /** Callback para eliminar documento */
    onDeleteFile?: (url: string) => void;
}

/**
 * Extrae información de un archivo desde su URL
 */
function parseFileUrl(url: string): { nombre: string; extension: string } {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const extensionMatch = filename.match(/\.([^.]+)$/);
    
    return {
        nombre: filename,
        extension: extensionMatch ? extensionMatch[1] : 'file'
    };
}

/**
 * Obtiene el icono según la extensión del archivo
 */
function getFileIcon(extension: string): string {
    const icons: Record<string, string> = {
        // Videos
        'mp4': 'bi-camera-video-fill',
        'mov': 'bi-camera-video',
        'avi': 'bi-camera-video',
        
        // Documentos
        'pdf': 'bi-file-pdf-fill',
        'doc': 'bi-file-word-fill',
        'docx': 'bi-file-word-fill',
        'xls': 'bi-file-excel-fill',
        'xlsx': 'bi-file-excel-fill'
    };
    
    return icons[extension.toLowerCase()] || 'bi-file-earmark';
}

/**
 * Obtiene el color del badge según la extensión
 */
function getBadgeColor(extension: string): string {
    const colors: Record<string, string> = {
        'mp4': 'primary',
        'mov': 'primary',
        'avi': 'primary',
        'pdf': 'danger',
        'doc': 'info',
        'docx': 'info',
        'xls': 'success',
        'xlsx': 'success'
    };
    
    return colors[extension.toLowerCase()] || 'secondary';
}

/**
 * Lista de archivos con opciones de descarga y eliminación.
 */
export function FileList({ documentos, isAdmin, onDeleteFile }: FileListProps): React.ReactElement {
    
    const handleDelete = (url: string) => {
        if (!onDeleteFile) return;
        
        const fileInfo = parseFileUrl(url);
        const confirmed = window.confirm(`¿Estás seguro de eliminar ${fileInfo.nombre}?`);
        if (!confirmed) return;
        
        onDeleteFile(url);
    };
    
    const handleDownload = (url: string) => {
        window.open(url, '_blank');
    };
    
    // Validar que documentos existe y es un array
    if (!documentos || !Array.isArray(documentos) || documentos.length === 0) {
        return (
            <div className="text-center py-5 text-muted">
                <i className="bi bi-file-earmark-text fs-1 mb-3 d-block"></i>
                <h5>No hay documentos adjuntos</h5>
                <p>Sube documentos relacionados con la reparación (PDFs, informes, etc.)</p>
            </div>
        );
    }
    
    return (
        <Table hover responsive>
            <thead>
                <tr>
                    <th style={{ width: '40px' }}></th>
                    <th>Nombre del Archivo</th>
                    <th style={{ width: '100px' }}>Tipo</th>
                    <th style={{ width: '150px' }} className="text-end">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {documentos.map((url, index) => {
                    const fileInfo = parseFileUrl(url);
                    
                    return (
                        <tr key={index}>
                            <td className="text-center">
                                <i className={`bi ${getFileIcon(fileInfo.extension)} fs-5 text-muted`}></i>
                            </td>
                            <td>
                                <div className="d-flex align-items-center">
                                    <span className="text-truncate" style={{ maxWidth: '400px' }} title={fileInfo.nombre}>
                                        {fileInfo.nombre}
                                    </span>
                                </div>
                            </td>
                            <td>
                                <Badge bg={getBadgeColor(fileInfo.extension)}>
                                    {fileInfo.extension.toUpperCase()}
                                </Badge>
                            </td>
                            <td className="text-end">
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => handleDownload(url)}
                                    className="me-2"
                                    title="Descargar/Ver"
                                >
                                    <i className="bi bi-download"></i>
                                </Button>
                                {isAdmin && onDeleteFile && (
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleDelete(url)}
                                        title="Eliminar"
                                    >
                                        <i className="bi bi-trash"></i>
                                    </Button>
                                )}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </Table>
    );
}
