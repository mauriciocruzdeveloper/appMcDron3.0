/**
 * ExportButton.tsx
 * 
 * Botón con menú dropdown para exportar reparaciones.
 * 
 * **Phase 4 - T4.3:** Exportación de Reportes
 * - PDF individual
 * - Excel/CSV lista
 * - Integración con export.service
 * 
 * @module Components/ExportButton
 */

import React, { useState } from 'react';
import { Dropdown, Spinner } from 'react-bootstrap';
import { ReparacionType } from '../../../types/reparacion';
import { exportService } from '../../../services/export/export.service';
import { ExportFormat } from '../../../services/export/export.types';

interface ExportButtonProps {
    /** Reparación individual (opcional) */
    reparacion?: ReparacionType;
    
    /** Lista de reparaciones (opcional) */
    reparaciones?: ReparacionType[];
    
    /** Variante de botón */
    variant?: string;
    
    /** Tamaño de botón */
    size?: 'sm' | 'lg';
    
    /** Texto del botón */
    label?: string;
}

/**
 * Botón de exportación con opciones de formato.
 */
export function ExportButton({ 
    reparacion, 
    reparaciones, 
    variant = 'outline-primary', 
    size, 
    label = 'Exportar' 
}: ExportButtonProps): React.ReactElement {
    const [isExporting, setIsExporting] = useState(false);
    
    const handleExport = async (format: ExportFormat) => {
        setIsExporting(true);
        
        try {
            if (reparacion) {
                // Exportar reparación individual
                const response = await exportService.exportReparacion({
                    reparacion,
                    reportType: 'reparacion_detalle',
                    options: {
                        format,
                        includeLogo: true,
                        pageOrientation: 'portrait'
                    }
                });
                
                if (response.success) {
                    console.log(`✅ Exportado: ${response.filename}`);
                } else {
                    console.error(`❌ Error: ${response.error}`);
                    alert(`Error al exportar: ${response.error}`);
                }
            } else if (reparaciones && reparaciones.length > 0) {
                // Exportar lista
                const response = await exportService.exportReparacionesList({
                    reparaciones,
                    options: {
                        format,
                        pageOrientation: format === 'pdf' ? 'landscape' : 'portrait'
                    }
                });
                
                if (response.success) {
                    console.log(`✅ Exportado: ${response.filename}`);
                } else {
                    console.error(`❌ Error: ${response.error}`);
                    alert(`Error al exportar: ${response.error}`);
                }
            } else {
                alert('No hay datos para exportar');
            }
        } catch (error) {
            console.error('Error en exportación:', error);
            alert('Error al exportar el archivo');
        } finally {
            setIsExporting(false);
        }
    };
    
    return (
        <Dropdown>
            <Dropdown.Toggle variant={variant} size={size} disabled={isExporting}>
                {isExporting ? (
                    <>
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                        />
                        Exportando...
                    </>
                ) : (
                    <>
                        <i className="bi bi-download me-2"></i>
                        {label}
                    </>
                )}
            </Dropdown.Toggle>

            <Dropdown.Menu>
                <Dropdown.Header>Formato de exportación</Dropdown.Header>
                
                <Dropdown.Item onClick={() => handleExport('pdf')}>
                    <i className="bi bi-file-earmark-pdf text-danger me-2"></i>
                    PDF
                </Dropdown.Item>
                
                <Dropdown.Item onClick={() => handleExport('excel')}>
                    <i className="bi bi-file-earmark-excel text-success me-2"></i>
                    Excel
                </Dropdown.Item>
                
                {reparaciones && (
                    <Dropdown.Item onClick={() => handleExport('csv')}>
                        <i className="bi bi-file-earmark-text text-primary me-2"></i>
                        CSV
                    </Dropdown.Item>
                )}
                
                <Dropdown.Divider />
                
                <Dropdown.Item disabled>
                    <small className="text-muted">
                        {reparacion ? '1 reparación' : `${reparaciones?.length || 0} reparaciones`}
                    </small>
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
}
