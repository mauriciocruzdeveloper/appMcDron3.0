/**
 * FileList.tsx
 * 
 * Lista de archivos (videos o documentos).
 * Muestra información del archivo con acciones de descarga/eliminación.
 * 
 * @module Reparacion/tabs/ArchivosTab
 */

import React from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import { useReparacion } from '../../ReparacionContext';

interface FileListProps {
    /** Tipo de archivo a listar */
    tipo: 'video' | 'documento';
    
    /** Callback para eliminar archivo */
    onDeleteFile?: (fileId: string, tipo: string) => Promise<void>;
}

/**
 * Interfaz para un archivo
 */
interface FileData {
    id: string;
    nombre: string;
    url: string;
    tamaño: number;
    fecha: string;
    extension: string;
}

/**
 * Formatea el tamaño del archivo en KB o MB
 */
function formatFileSize(bytes: number): string {
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
export function FileList({ tipo, onDeleteFile }: FileListProps): React.ReactElement {
    const { isAdmin } = useReparacion();
    
    /**
     * En una implementación real, estos archivos vendrían de Redux o API
     * Por ahora usamos datos de ejemplo
     */
    const files: FileData[] = [
        // Placeholder - en implementación real vendría de la base de datos
    ];
    
    const handleDelete = async (file: FileData) => {
        if (!onDeleteFile) return;
        
        const confirmed = window.confirm(`¿Estás seguro de eliminar ${file.nombre}?`);
        if (!confirmed) return;
        
        try {
            await onDeleteFile(file.id, tipo);
        } catch (error) {
            console.error('Error al eliminar archivo:', error);
        }
    };
    
    const handleDownload = (file: FileData) => {
        // En implementación real, esto descargaría el archivo
        window.open(file.url, '_blank');
    };
    
    if (files.length === 0) {
        return (
            <div className="text-center py-5 text-muted">
                <i className={`bi ${tipo === 'video' ? 'bi-camera-video' : 'bi-file-earmark-text'} fs-1 mb-3 d-block`}></i>
                <h5>No hay {tipo === 'video' ? 'videos' : 'documentos'} adjuntos</h5>
                <p>Sube {tipo === 'video' ? 'videos' : 'documentos'} relacionados con la reparación</p>
            </div>
        );
    }
    
    return (
        <Table hover responsive>
            <thead>
                <tr>
                    <th style={{ width: '40px' }}></th>
                    <th>Nombre</th>
                    <th style={{ width: '100px' }}>Tipo</th>
                    <th style={{ width: '100px' }}>Tamaño</th>
                    <th style={{ width: '120px' }}>Fecha</th>
                    <th style={{ width: '150px' }} className="text-end">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {files.map((file) => (
                    <tr key={file.id}>
                        <td className="text-center">
                            <i className={`bi ${getFileIcon(file.extension)} fs-5 text-muted`}></i>
                        </td>
                        <td>
                            <div className="d-flex align-items-center">
                                <span className="text-truncate" style={{ maxWidth: '300px' }}>
                                    {file.nombre}
                                </span>
                            </div>
                        </td>
                        <td>
                            <Badge bg={getBadgeColor(file.extension)}>
                                {file.extension.toUpperCase()}
                            </Badge>
                        </td>
                        <td className="text-muted small">
                            {formatFileSize(file.tamaño)}
                        </td>
                        <td className="text-muted small">
                            {new Date(file.fecha).toLocaleDateString('es-AR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            })}
                        </td>
                        <td className="text-end">
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleDownload(file)}
                                className="me-2"
                                title="Descargar"
                            >
                                <i className="bi bi-download"></i>
                            </Button>
                            {isAdmin && (
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleDelete(file)}
                                    title="Eliminar"
                                >
                                    <i className="bi bi-trash"></i>
                                </Button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
}
