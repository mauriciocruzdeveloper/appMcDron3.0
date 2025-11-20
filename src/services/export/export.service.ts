/**
 * export.service.ts
 * 
 * Servicio para exportar reparaciones a diferentes formatos.
 * 
 * **Phase 4 - T4.3:** Exportación de Reportes
 * - Exportación a PDF con jsPDF
 * - Exportación a Excel con xlsx
 * - Exportación a CSV
 * - Templates personalizables
 * 
 * @module Services/Export
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { ReparacionType } from '../../types/reparacion';
import {
    ExportFormat,
    ExportOptions,
    ExportReparacionRequest,
    ExportReparacionesListRequest,
    ExportResponse,
    PDFTemplateData
} from './export.types';

/**
 * Servicio singleton para exportación de reportes.
 */
export class ExportService {
    private static instance: ExportService;
    
    /** Información de la empresa */
    private readonly companyInfo = {
        name: 'McDron Service',
        address: 'Buenos Aires, Argentina',
        phone: '+54 11 1234-5678',
        email: 'contacto@mcdron.com',
        website: 'www.mcdron.com'
    };
    
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}
    
    /**
     * Obtiene la instancia única del servicio.
     */
    public static getInstance(): ExportService {
        if (!ExportService.instance) {
            ExportService.instance = new ExportService();
        }
        return ExportService.instance;
    }
    
    /**
     * Exporta una reparación individual.
     */
    public async exportReparacion(request: ExportReparacionRequest): Promise<ExportResponse> {
        try {
            switch (request.options.format) {
                case 'pdf':
                    return this.exportReparacionToPDF(request);
                case 'excel':
                    return this.exportReparacionToExcel(request);
                default:
                    throw new Error(`Formato no soportado: ${request.options.format}`);
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido'
            };
        }
    }
    
    /**
     * Exporta una lista de reparaciones.
     */
    public async exportReparacionesList(request: ExportReparacionesListRequest): Promise<ExportResponse> {
        try {
            switch (request.options.format) {
                case 'pdf':
                    return this.exportListToPDF(request);
                case 'excel':
                    return this.exportListToExcel(request);
                case 'csv':
                    return this.exportListToCSV(request);
                default:
                    throw new Error(`Formato no soportado: ${request.options.format}`);
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido'
            };
        }
    }
    
    /**
     * Exporta detalle de reparación a PDF.
     */
    private exportReparacionToPDF(request: ExportReparacionRequest): ExportResponse {
        const { reparacion, options } = request;
        const doc = new jsPDF(options.pageOrientation || 'portrait');
        
        // Header
        if (options.includeLogo) {
            // TODO: Agregar logo cuando esté disponible
        }
        
        doc.setFontSize(20);
        doc.text('Detalle de Reparación', 20, 20);
        
        doc.setFontSize(10);
        doc.text(`ID: ${reparacion.id}`, 20, 30);
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`, 20, 36);
        
        // Información del Cliente
        let y = 50;
        doc.setFontSize(14);
        doc.text('Información del Cliente', 20, y);
        y += 10;
        
        doc.setFontSize(10);
        doc.text(`Cliente: ${reparacion.data.UsuarioRep || 'N/A'}`, 20, y);
        y += 6;
        if (reparacion.data.NombreUsu || reparacion.data.ApellidoUsu) {
            doc.text(`Nombre: ${reparacion.data.NombreUsu || ''} ${reparacion.data.ApellidoUsu || ''}`, 20, y);
            y += 6;
        }
        if (reparacion.data.EmailUsu) {
            doc.text(`Email: ${reparacion.data.EmailUsu}`, 20, y);
            y += 6;
        }
        if (reparacion.data.TelefonoUsu) {
            doc.text(`Teléfono: ${reparacion.data.TelefonoUsu}`, 20, y);
            y += 6;
        }
        
        // Información del Drone
        y += 8;
        doc.setFontSize(14);
        doc.text('Información del Drone', 20, y);
        y += 10;
        
        doc.setFontSize(10);
        doc.text(`Modelo: ${reparacion.data.ModeloDroneNameRep || 'N/A'}`, 20, y);
        y += 6;
        if (reparacion.data.NumeroSerieRep) {
            doc.text(`Nº Serie: ${reparacion.data.NumeroSerieRep}`, 20, y);
            y += 6;
        }
        if (reparacion.data.DescripcionUsuRep) {
            doc.text(`Descripción: ${reparacion.data.DescripcionUsuRep}`, 20, y);
            y += 6;
        }
        
        // Estado y Fechas
        y += 8;
        doc.setFontSize(14);
        doc.text('Estado de la Reparación', 20, y);
        y += 10;
        
        doc.setFontSize(10);
        doc.text(`Estado: ${reparacion.data.EstadoRep || 'N/A'}`, 20, y);
        y += 6;
        if (reparacion.data.FeRecRep) {
            doc.text(`Fecha Recepción: ${new Date(reparacion.data.FeRecRep).toLocaleDateString('es-AR')}`, 20, y);
            y += 6;
        }
        if (reparacion.data.FeFinRep) {
            doc.text(`Fecha Finalización: ${new Date(reparacion.data.FeFinRep).toLocaleDateString('es-AR')}`, 20, y);
            y += 6;
        }
        if (reparacion.data.FeEntRep) {
            doc.text(`Fecha Entrega: ${new Date(reparacion.data.FeEntRep).toLocaleDateString('es-AR')}`, 20, y);
            y += 6;
        }
        
        // Diagnóstico
        if (reparacion.data.DiagnosticoRep) {
            y += 8;
            doc.setFontSize(14);
            doc.text('Diagnóstico', 20, y);
            y += 10;
            
            doc.setFontSize(10);
            const diagnosticoLines = doc.splitTextToSize(reparacion.data.DiagnosticoRep, 170);
            doc.text(diagnosticoLines, 20, y);
            y += diagnosticoLines.length * 6;
        }
        
        // Presupuesto
        if (reparacion.data.PresuFiRep) {
            y += 8;
            doc.setFontSize(14);
            doc.text('Presupuesto', 20, y);
            y += 10;
            
            doc.setFontSize(10);
            if (reparacion.data.PresuMoRep) {
                doc.text(`Mano de Obra: $${reparacion.data.PresuMoRep.toLocaleString('es-AR')}`, 20, y);
                y += 6;
            }
            if (reparacion.data.PresuReRep) {
                doc.text(`Repuestos: $${reparacion.data.PresuReRep.toLocaleString('es-AR')}`, 20, y);
                y += 6;
            }
            doc.setFontSize(12);
            doc.text(`TOTAL: $${reparacion.data.PresuFiRep.toLocaleString('es-AR')}`, 20, y);
        }
        
        // Footer
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(
                `${this.companyInfo.name} - ${this.companyInfo.phone} - ${this.companyInfo.email}`,
                20,
                doc.internal.pageSize.height - 10
            );
        }
        
        // Generar blob
        const filename = options.filename || `reparacion_${reparacion.id}.pdf`;
        const blob = doc.output('blob');
        const blobUrl = URL.createObjectURL(blob);
        
        // Descargar automáticamente
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        link.click();
        
        return {
            success: true,
            blobUrl,
            filename
        };
    }
    
    /**
     * Exporta detalle de reparación a Excel.
     */
    private exportReparacionToExcel(request: ExportReparacionRequest): ExportResponse {
        const { reparacion, options } = request;
        
        const data = [
            ['DETALLE DE REPARACIÓN'],
            [],
            ['ID', reparacion.id],
            ['Fecha', new Date().toLocaleDateString('es-AR')],
            [],
            ['CLIENTE'],
            ['Usuario', reparacion.data.UsuarioRep || 'N/A'],
            ['Nombre', `${reparacion.data.NombreUsu || ''} ${reparacion.data.ApellidoUsu || ''}`],
            ['Email', reparacion.data.EmailUsu || 'N/A'],
            ['Teléfono', reparacion.data.TelefonoUsu || 'N/A'],
            [],
            ['DRONE'],
            ['Modelo', reparacion.data.ModeloDroneNameRep || 'N/A'],
            ['Nº Serie', reparacion.data.NumeroSerieRep || 'N/A'],
            ['Descripción', reparacion.data.DescripcionUsuRep || 'N/A'],
            [],
            ['ESTADO'],
            ['Estado Actual', reparacion.data.EstadoRep || 'N/A'],
            ['Fecha Recepción', reparacion.data.FeRecRep ? new Date(reparacion.data.FeRecRep).toLocaleDateString('es-AR') : 'N/A'],
            ['Fecha Finalización', reparacion.data.FeFinRep ? new Date(reparacion.data.FeFinRep).toLocaleDateString('es-AR') : 'N/A'],
            ['Fecha Entrega', reparacion.data.FeEntRep ? new Date(reparacion.data.FeEntRep).toLocaleDateString('es-AR') : 'N/A'],
            [],
            ['PRESUPUESTO'],
            ['Mano de Obra', reparacion.data.PresuMoRep || 0],
            ['Repuestos', reparacion.data.PresuReRep || 0],
            ['TOTAL', reparacion.data.PresuFiRep || 0]
        ];
        
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Reparación');
        
        const filename = options.filename || `reparacion_${reparacion.id}.xlsx`;
        XLSX.writeFile(wb, filename);
        
        return {
            success: true,
            filename
        };
    }
    
    /**
     * Exporta lista de reparaciones a PDF.
     */
    private exportListToPDF(request: ExportReparacionesListRequest): ExportResponse {
        const { reparaciones, options } = request;
        const doc = new jsPDF(options.pageOrientation || 'landscape');
        
        doc.setFontSize(16);
        doc.text('Listado de Reparaciones', 20, 20);
        
        doc.setFontSize(10);
        doc.text(`Total: ${reparaciones.length} reparaciones`, 20, 28);
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`, 20, 34);
        
        // Tabla
        const tableData = reparaciones.map(rep => [
            rep.id,
            rep.data.UsuarioRep || 'N/A',
            rep.data.ModeloDroneNameRep || 'N/A',
            rep.data.EstadoRep || 'N/A',
            rep.data.FeRecRep ? new Date(rep.data.FeRecRep).toLocaleDateString('es-AR') : 'N/A',
            rep.data.PresuFiRep ? `$${rep.data.PresuFiRep.toLocaleString('es-AR')}` : '$0'
        ]);
        
        autoTable(doc, {
            startY: 45,
            head: [['ID', 'Cliente', 'Modelo', 'Estado', 'Fecha', 'Presupuesto']],
            body: tableData,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [13, 110, 253] }
        });
        
        const filename = options.filename || `reparaciones_${new Date().getTime()}.pdf`;
        const blob = doc.output('blob');
        const blobUrl = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        link.click();
        
        return {
            success: true,
            blobUrl,
            filename
        };
    }
    
    /**
     * Exporta lista de reparaciones a Excel.
     */
    private exportListToExcel(request: ExportReparacionesListRequest): ExportResponse {
        const { reparaciones, options } = request;
        
        const data = reparaciones.map(rep => ({
            'ID': rep.id,
            'Cliente': rep.data.UsuarioRep || 'N/A',
            'Nombre': `${rep.data.NombreUsu || ''} ${rep.data.ApellidoUsu || ''}`,
            'Email': rep.data.EmailUsu || 'N/A',
            'Teléfono': rep.data.TelefonoUsu || 'N/A',
            'Modelo Drone': rep.data.ModeloDroneNameRep || 'N/A',
            'Nº Serie': rep.data.NumeroSerieRep || 'N/A',
            'Estado': rep.data.EstadoRep || 'N/A',
            'Fecha Recepción': rep.data.FeRecRep ? new Date(rep.data.FeRecRep).toLocaleDateString('es-AR') : 'N/A',
            'Fecha Entrega': rep.data.FeEntRep ? new Date(rep.data.FeEntRep).toLocaleDateString('es-AR') : 'N/A',
            'Presupuesto': rep.data.PresuFiRep || 0,
            'Diagnóstico': rep.data.DiagnosticoRep || 'N/A'
        }));
        
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Reparaciones');
        
        // Ajustar ancho de columnas
        const colWidths = [
            { wch: 15 }, // ID
            { wch: 20 }, // Cliente
            { wch: 25 }, // Nombre
            { wch: 30 }, // Email
            { wch: 15 }, // Teléfono
            { wch: 25 }, // Modelo
            { wch: 20 }, // Nº Serie
            { wch: 15 }, // Estado
            { wch: 15 }, // Fecha Rec
            { wch: 15 }, // Fecha Ent
            { wch: 12 }, // Presupuesto
            { wch: 50 }  // Diagnóstico
        ];
        ws['!cols'] = colWidths;
        
        const filename = options.filename || `reparaciones_${new Date().getTime()}.xlsx`;
        XLSX.writeFile(wb, filename);
        
        return {
            success: true,
            filename
        };
    }
    
    /**
     * Exporta lista de reparaciones a CSV.
     */
    private exportListToCSV(request: ExportReparacionesListRequest): ExportResponse {
        const { reparaciones, options } = request;
        
        const data = reparaciones.map(rep => ({
            'ID': rep.id,
            'Cliente': rep.data.UsuarioRep || 'N/A',
            'Modelo': rep.data.ModeloDroneNameRep || 'N/A',
            'Estado': rep.data.EstadoRep || 'N/A',
            'Fecha Recepción': rep.data.FeRecRep ? new Date(rep.data.FeRecRep).toLocaleDateString('es-AR') : 'N/A',
            'Presupuesto': rep.data.PresuFiRep || 0
        }));
        
        const ws = XLSX.utils.json_to_sheet(data);
        const csv = XLSX.utils.sheet_to_csv(ws);
        
        const filename = options.filename || `reparaciones_${new Date().getTime()}.csv`;
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const blobUrl = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        link.click();
        
        return {
            success: true,
            blobUrl,
            filename
        };
    }
}

// Exportar instancia singleton
export const exportService = ExportService.getInstance();
