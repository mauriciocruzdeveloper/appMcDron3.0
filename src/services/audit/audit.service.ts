/**
 * audit.service.ts
 * 
 * Servicio para gestión del audit log y tracking de cambios.
 * 
 * **Phase 4 - T4.6:** Audit Log
 * - Registro automático de acciones
 * - Búsqueda y filtrado
 * - Timeline de cambios
 * - Revert functionality
 * - Export de logs
 * 
 * @module Services/Audit
 */

import {
    AuditLog,
    AuditAction,
    AuditCategory,
    AuditLevel,
    AuditLogFilter,
    AuditStats,
    AuditTimelineItem,
    CreateAuditLogRequest,
    GetAuditLogsResponse,
    RevertAuditLogRequest,
    RevertAuditLogResponse,
    ExportAuditLogRequest,
    AuditLogConfig
} from '../../types/audit.types';

/**
 * Servicio singleton para gestión de audit logs.
 */
export class AuditService {
    private static instance: AuditService;
    private readonly STORAGE_KEY = 'mcdron_audit_logs';
    private readonly CONFIG_KEY = 'mcdron_audit_config';
    
    private config: AuditLogConfig = {
        enabled: true,
        retentionDays: 90,
        categories: Object.values(AuditCategory),
        minLevel: AuditLevel.INFO,
        autoCleanup: true,
        includeSystemInfo: false
    };
    
    private constructor() {
        this.loadConfig();
        if (this.config.autoCleanup) {
            this.cleanupOldLogs();
        }
    }
    
    /**
     * Obtener instancia singleton.
     */
    public static getInstance(): AuditService {
        if (!AuditService.instance) {
            AuditService.instance = new AuditService();
        }
        return AuditService.instance;
    }
    
    /**
     * Crear un nuevo log de auditoría.
     */
    public async createLog(request: CreateAuditLogRequest): Promise<AuditLog> {
        if (!this.config.enabled) {
            throw new Error('Audit log está deshabilitado');
        }
        
        // Obtener categoría y nivel
        const category = this.getCategory(request.action);
        const level = request.level || AuditLevel.INFO;
        
        // Verificar si la categoría está habilitada
        if (!this.config.categories.includes(category)) {
            throw new Error(`Categoría ${category} no está habilitada`);
        }
        
        // Verificar nivel mínimo
        if (!this.shouldLog(level)) {
            throw new Error(`Nivel ${level} es inferior al mínimo configurado`);
        }
        
        // TODO: En producción, obtener del contexto de autenticación
        const currentUser = this.getCurrentUser();
        
        const log: AuditLog = {
            id: this.generateId(),
            timestamp: Date.now(),
            action: request.action,
            category,
            level,
            userId: currentUser.id,
            userName: currentUser.name,
            userRole: currentUser.role,
            entityId: request.entityId,
            entityType: request.entityType,
            description: request.description,
            changes: request.changes,
            metadata: request.metadata,
            revertible: request.revertible || false
        };
        
        // Agregar info del sistema si está habilitado
        if (this.config.includeSystemInfo) {
            log.userAgent = navigator.userAgent;
            // IP address requiere backend
        }
        
        // Guardar en localStorage
        this.saveLogs([log, ...this.getStoredLogs()]);
        
        return log;
    }
    
    /**
     * Obtener logs con filtros.
     */
    public async getLogs(
        filter?: AuditLogFilter,
        page = 1,
        pageSize = 50
    ): Promise<GetAuditLogsResponse> {
        let logs = this.getStoredLogs();
        
        // Aplicar filtros
        if (filter) {
            logs = this.applyFilters(logs, filter);
        }
        
        // Ordenar por timestamp descendente
        logs.sort((a, b) => b.timestamp - a.timestamp);
        
        // Paginación
        const total = logs.length;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const paginatedLogs = logs.slice(start, end);
        
        return {
            success: true,
            logs: paginatedLogs,
            total,
            page,
            pageSize,
            hasMore: end < total
        };
    }
    
    /**
     * Obtener logs de una entidad específica.
     */
    public async getEntityLogs(
        entityId: string,
        entityType: 'reparacion' | 'repuesto' | 'archivo' | 'presupuesto'
    ): Promise<AuditLog[]> {
        const logs = this.getStoredLogs();
        return logs.filter(
            log => log.entityId === entityId && log.entityType === entityType
        ).sort((a, b) => b.timestamp - a.timestamp);
    }
    
    /**
     * Obtener timeline de cambios.
     */
    public async getTimeline(
        filter?: AuditLogFilter
    ): Promise<AuditTimelineItem[]> {
        const response = await this.getLogs(filter, 1, 1000);
        const logs = response.logs;
        
        // Agrupar por fecha
        const grouped = new Map<string, AuditLog[]>();
        
        logs.forEach(log => {
            const date = new Date(log.timestamp).toISOString().split('T')[0];
            if (!grouped.has(date)) {
                grouped.set(date, []);
            }
            grouped.get(date)!.push(log);
        });
        
        // Convertir a array de timeline items
        return Array.from(grouped.entries())
            .map(([date, logs]) => ({ date, logs }))
            .sort((a, b) => b.date.localeCompare(a.date));
    }
    
    /**
     * Obtener estadísticas del audit log.
     */
    public async getStats(filter?: AuditLogFilter): Promise<AuditStats> {
        const response = await this.getLogs(filter, 1, 10000);
        const logs = response.logs;
        
        // Contar por categoría
        const byCategory: Record<AuditCategory, number> = {} as Record<AuditCategory, number>;
        Object.values(AuditCategory).forEach(cat => {
            byCategory[cat] = logs.filter(l => l.category === cat).length;
        });
        
        // Contar por nivel
        const byLevel: Record<AuditLevel, number> = {} as Record<AuditLevel, number>;
        Object.values(AuditLevel).forEach(level => {
            byLevel[level] = logs.filter(l => l.level === level).length;
        });
        
        // Top usuarios
        const userCounts = new Map<string, { userId: string; userName: string; count: number }>();
        logs.forEach(log => {
            const existing = userCounts.get(log.userId) || {
                userId: log.userId,
                userName: log.userName,
                count: 0
            };
            existing.count++;
            userCounts.set(log.userId, existing);
        });
        const topUsers = Array.from(userCounts.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        
        // Top acciones
        const actionCounts = new Map<AuditAction, number>();
        logs.forEach(log => {
            actionCounts.set(log.action, (actionCounts.get(log.action) || 0) + 1);
        });
        const topActions = Array.from(actionCounts.entries())
            .map(([action, count]) => ({ action, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        
        // Período
        const timestamps = logs.map(l => l.timestamp);
        const period = {
            from: Math.min(...timestamps),
            to: Math.max(...timestamps)
        };
        
        return {
            totalLogs: logs.length,
            byCategory,
            byLevel,
            topUsers,
            topActions,
            period
        };
    }
    
    /**
     * Revertir una acción.
     */
    public async revertLog(request: RevertAuditLogRequest): Promise<RevertAuditLogResponse> {
        const logs = this.getStoredLogs();
        const log = logs.find(l => l.id === request.logId);
        
        if (!log) {
            return {
                success: false,
                message: 'Log no encontrado',
                error: 'LOG_NOT_FOUND'
            };
        }
        
        if (!log.revertible) {
            return {
                success: false,
                message: 'Esta acción no puede ser revertida',
                error: 'NOT_REVERTIBLE'
            };
        }
        
        if (log.revertedBy) {
            return {
                success: false,
                message: 'Esta acción ya fue revertida',
                error: 'ALREADY_REVERTED'
            };
        }
        
        // Crear log de revert
        const revertLog = await this.createLog({
            action: AuditAction.ESTADO_REVERTED,
            entityId: log.entityId,
            entityType: log.entityType,
            description: `Revertido: ${log.description}. Razón: ${request.reason}`,
            changes: log.changes?.map(change => ({
                field: change.field,
                oldValue: change.newValue,
                newValue: change.oldValue,
                type: change.type
            })),
            metadata: {
                originalLogId: log.id,
                reason: request.reason
            },
            level: AuditLevel.WARNING,
            revertible: false
        });
        
        // Marcar log original como revertido
        log.revertedBy = revertLog.id;
        this.saveLogs(logs);
        
        return {
            success: true,
            message: 'Acción revertida exitosamente',
            revertLog
        };
    }
    
    /**
     * Exportar audit log.
     */
    public async exportLogs(request: ExportAuditLogRequest): Promise<Blob> {
        const response = await this.getLogs(request.filter, 1, 10000);
        const logs = response.logs;
        
        if (request.format === 'csv') {
            return this.exportToCsv(logs, request.includeChanges || false);
        } else if (request.format === 'excel') {
            return this.exportToExcel(logs, request.includeChanges || false);
        } else {
            return this.exportToPdf(logs, request.includeChanges || false);
        }
    }
    
    /**
     * Limpiar logs antiguos según retención.
     */
    public cleanupOldLogs(): number {
        if (this.config.retentionDays === 0) {
            return 0; // Retención indefinida
        }
        
        const cutoffDate = Date.now() - (this.config.retentionDays * 24 * 60 * 60 * 1000);
        const logs = this.getStoredLogs();
        const filtered = logs.filter(log => log.timestamp >= cutoffDate);
        const removed = logs.length - filtered.length;
        
        if (removed > 0) {
            this.saveLogs(filtered);
        }
        
        return removed;
    }
    
    /**
     * Actualizar configuración.
     */
    public updateConfig(config: Partial<AuditLogConfig>): void {
        this.config = { ...this.config, ...config };
        localStorage.setItem(this.CONFIG_KEY, JSON.stringify(this.config));
    }
    
    /**
     * Obtener configuración actual.
     */
    public getConfig(): AuditLogConfig {
        return { ...this.config };
    }
    
    // ================ MÉTODOS PRIVADOS ================
    
    private generateId(): string {
        return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    private getCurrentUser() {
        // TODO: En producción, obtener del contexto de autenticación
        return {
            id: '1',
            name: 'Usuario Demo',
            role: 'admin'
        };
    }
    
    private getCategory(action: AuditAction): AuditCategory {
        if (action.startsWith('reparacion:')) return AuditCategory.REPARACION;
        if (action.startsWith('estado:')) return AuditCategory.ESTADO;
        if (action.startsWith('repuesto:')) return AuditCategory.REPUESTO;
        if (action.startsWith('file:')) return AuditCategory.ARCHIVO;
        if (action.startsWith('presupuesto:')) return AuditCategory.PRESUPUESTO;
        if (action.startsWith('notification:')) return AuditCategory.NOTIFICACION;
        return AuditCategory.SISTEMA;
    }
    
    private shouldLog(level: AuditLevel): boolean {
        const levels = [AuditLevel.INFO, AuditLevel.WARNING, AuditLevel.ERROR, AuditLevel.CRITICAL];
        const minIndex = levels.indexOf(this.config.minLevel);
        const logIndex = levels.indexOf(level);
        return logIndex >= minIndex;
    }
    
    private getStoredLogs(): AuditLog[] {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }
    
    private saveLogs(logs: AuditLog[]): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
    }
    
    private loadConfig(): void {
        try {
            const data = localStorage.getItem(this.CONFIG_KEY);
            if (data) {
                this.config = { ...this.config, ...JSON.parse(data) };
            }
        } catch {
            // Usar config por defecto
        }
    }
    
    private applyFilters(logs: AuditLog[], filter: AuditLogFilter): AuditLog[] {
        let filtered = [...logs];
        
        if (filter.dateFrom) {
            filtered = filtered.filter(l => l.timestamp >= filter.dateFrom!);
        }
        
        if (filter.dateTo) {
            filtered = filtered.filter(l => l.timestamp <= filter.dateTo!);
        }
        
        if (filter.userId) {
            filtered = filtered.filter(l => l.userId === filter.userId);
        }
        
        if (filter.categories && filter.categories.length > 0) {
            filtered = filtered.filter(l => filter.categories!.includes(l.category));
        }
        
        if (filter.actions && filter.actions.length > 0) {
            filtered = filtered.filter(l => filter.actions!.includes(l.action));
        }
        
        if (filter.levels && filter.levels.length > 0) {
            filtered = filtered.filter(l => filter.levels!.includes(l.level));
        }
        
        if (filter.entityId) {
            filtered = filtered.filter(l => l.entityId === filter.entityId);
        }
        
        if (filter.entityType) {
            filtered = filtered.filter(l => l.entityType === filter.entityType);
        }
        
        if (filter.revertibleOnly) {
            filtered = filtered.filter(l => l.revertible && !l.revertedBy);
        }
        
        if (filter.searchText) {
            const search = filter.searchText.toLowerCase();
            filtered = filtered.filter(l => 
                l.description.toLowerCase().includes(search) ||
                l.userName.toLowerCase().includes(search) ||
                l.action.toLowerCase().includes(search)
            );
        }
        
        return filtered;
    }
    
    private exportToCsv(logs: AuditLog[], includeChanges: boolean): Blob {
        const headers = ['Timestamp', 'Usuario', 'Acción', 'Categoría', 'Nivel', 'Descripción'];
        if (includeChanges) {
            headers.push('Cambios');
        }
        
        const rows = logs.map(log => {
            const row = [
                new Date(log.timestamp).toLocaleString('es-AR'),
                log.userName,
                log.action,
                log.category,
                log.level,
                log.description
            ];
            
            if (includeChanges && log.changes) {
                row.push(JSON.stringify(log.changes));
            }
            
            return row.join(',');
        });
        
        const csv = [headers.join(','), ...rows].join('\n');
        return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    }
    
    private exportToExcel(logs: AuditLog[], includeChanges: boolean): Blob {
        // Placeholder - requiere librería xlsx
        return this.exportToCsv(logs, includeChanges);
    }
    
    private exportToPdf(logs: AuditLog[], includeChanges: boolean): Blob {
        // Placeholder - requiere librería jsPDF
        return this.exportToCsv(logs, includeChanges);
    }
}

// Exportar instancia singleton
export const auditService = AuditService.getInstance();
