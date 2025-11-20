/**
 * export.types.ts
 * 
 * Tipos TypeScript para el sistema de exportación de reportes.
 * 
 * **Phase 4 - T4.3:** Exportación de Reportes
 * - Exportación a PDF
 * - Exportación a Excel
 * - Templates personalizables
 * 
 * @module Services/Export
 */

import { ReparacionType } from '../../types/reparacion';

/**
 * Formato de exportación
 */
export type ExportFormat = 'pdf' | 'excel' | 'csv';

/**
 * Tipo de reporte a exportar
 */
export type ReportType = 'reparacion_detalle' | 'reparaciones_lista' | 'metricas' | 'presupuesto';

/**
 * Opciones de exportación para un reporte
 */
export interface ExportOptions {
    /** Formato del archivo */
    format: ExportFormat;
    
    /** Incluir imágenes (solo PDF) */
    includeImages?: boolean;
    
    /** Incluir logo de empresa */
    includeLogo?: boolean;
    
    /** Incluir firma digital */
    includeSignature?: boolean;
    
    /** Nombre de archivo personalizado */
    filename?: string;
    
    /** Orientación de página (PDF) */
    pageOrientation?: 'portrait' | 'landscape';
    
    /** Incluir solo campos específicos (Excel/CSV) */
    fields?: string[];
}

/**
 * Solicitud de exportación de detalle de reparación
 */
export interface ExportReparacionRequest {
    /** Reparación a exportar */
    reparacion: ReparacionType;
    
    /** Tipo de reporte */
    reportType: ReportType;
    
    /** Opciones de exportación */
    options: ExportOptions;
}

/**
 * Solicitud de exportación de lista de reparaciones
 */
export interface ExportReparacionesListRequest {
    /** Reparaciones a exportar */
    reparaciones: ReparacionType[];
    
    /** Opciones de exportación */
    options: ExportOptions;
    
    /** Filtros aplicados (para el título) */
    filters?: {
        estado?: string;
        fechaDesde?: string;
        fechaHasta?: string;
    };
}

/**
 * Respuesta de exportación
 */
export interface ExportResponse {
    /** Éxito de la operación */
    success: boolean;
    
    /** URL del blob generado (para descargar) */
    blobUrl?: string;
    
    /** Nombre del archivo */
    filename?: string;
    
    /** Mensaje de error (si aplica) */
    error?: string;
}

/**
 * Datos para template de PDF
 */
export interface PDFTemplateData {
    /** Título del documento */
    title: string;
    
    /** Subtítulo o descripción */
    subtitle?: string;
    
    /** Logo base64 */
    logoBase64?: string;
    
    /** Información de la empresa */
    companyInfo: {
        name: string;
        address: string;
        phone: string;
        email: string;
        website?: string;
    };
    
    /** Contenido del reporte (secciones) */
    sections: PDFSection[];
    
    /** Pie de página */
    footer?: string;
}

/**
 * Sección de contenido en PDF
 */
export interface PDFSection {
    /** Título de la sección */
    title: string;
    
    /** Tipo de contenido */
    type: 'text' | 'table' | 'image' | 'list';
    
    /** Contenido (varía según type) */
    content: string | string[] | Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Configuración de columnas para Excel
 */
export interface ExcelColumn {
    /** Nombre de la propiedad en el objeto */
    key: string;
    
    /** Título de la columna */
    header: string;
    
    /** Ancho de la columna */
    width?: number;
    
    /** Formato de celda */
    format?: 'text' | 'number' | 'currency' | 'date';
}
