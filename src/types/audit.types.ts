/**
 * audit.types.ts
 * 
 * Tipos para el sistema de auditoría y tracking de cambios.
 * 
 * **Phase 4 - T4.6:** Audit Log
 * - Registro de todas las acciones
 * - Timeline de modificaciones
 * - Revert functionality
 * - Export audit log
 * 
 * @module Types/Audit
 */

/**
 * Tipos de acciones auditables.
 */
export enum AuditAction {
    // Reparaciones
    REPARACION_CREATED = 'reparacion:created',
    REPARACION_UPDATED = 'reparacion:updated',
    REPARACION_DELETED = 'reparacion:deleted',
    
    // Estados
    ESTADO_CHANGED = 'estado:changed',
    ESTADO_REVERTED = 'estado:reverted',
    
    // Repuestos
    REPUESTO_ADDED = 'repuesto:added',
    REPUESTO_UPDATED = 'repuesto:updated',
    REPUESTO_DELETED = 'repuesto:deleted',
    REPUESTO_STATUS_CHANGED = 'repuesto:status_changed',
    
    // Archivos
    FILE_UPLOADED = 'file:uploaded',
    FILE_DELETED = 'file:deleted',
    FILE_UPDATED = 'file:updated',
    
    // Presupuestos
    PRESUPUESTO_CREATED = 'presupuesto:created',
    PRESUPUESTO_SENT = 'presupuesto:sent',
    PRESUPUESTO_APPROVED = 'presupuesto:approved',
    PRESUPUESTO_REJECTED = 'presupuesto:rejected',
    
    // Notificaciones
    NOTIFICATION_SENT = 'notification:sent',
    
    // Sistema
    USER_LOGIN = 'user:login',
    USER_LOGOUT = 'user:logout',
    EXPORT_GENERATED = 'export:generated',
    SEARCH_PERFORMED = 'search:performed'
}

/**
 * Categorías de acciones para filtrado.
 */
export enum AuditCategory {
    REPARACION = 'reparacion',
    ESTADO = 'estado',
    REPUESTO = 'repuesto',
    ARCHIVO = 'archivo',
    PRESUPUESTO = 'presupuesto',
    NOTIFICACION = 'notificacion',
    SISTEMA = 'sistema'
}

/**
 * Nivel de severidad/importancia del log.
 */
export enum AuditLevel {
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error',
    CRITICAL = 'critical'
}

/**
 * Información del cambio realizado.
 */
export interface AuditChange {
    /** Campo que cambió */
    field: string;
    
    /** Valor anterior */
    oldValue: unknown;
    
    /** Valor nuevo */
    newValue: unknown;
    
    /** Tipo de dato */
    type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'date';
}

/**
 * Registro individual de auditoría.
 */
export interface AuditLog {
    /** ID único del log */
    id: string;
    
    /** Timestamp de la acción */
    timestamp: number;
    
    /** Acción realizada */
    action: AuditAction;
    
    /** Categoría */
    category: AuditCategory;
    
    /** Nivel de severidad */
    level: AuditLevel;
    
    /** ID del usuario que realizó la acción */
    userId: string;
    
    /** Nombre del usuario */
    userName: string;
    
    /** Rol del usuario */
    userRole: string;
    
    /** ID de la entidad afectada (ej: reparacionId) */
    entityId?: string;
    
    /** Tipo de entidad */
    entityType?: 'reparacion' | 'repuesto' | 'archivo' | 'presupuesto';
    
    /** Descripción de la acción */
    description: string;
    
    /** Detalles de los cambios */
    changes?: AuditChange[];
    
    /** Metadata adicional */
    metadata?: Record<string, unknown>;
    
    /** IP del usuario (opcional) */
    ipAddress?: string;
    
    /** User agent (opcional) */
    userAgent?: string;
    
    /** Puede ser revertido */
    revertible: boolean;
    
    /** ID del log que revierte esta acción (si fue revertida) */
    revertedBy?: string;
}

/**
 * Filtros para búsqueda de logs.
 */
export interface AuditLogFilter {
    /** Rango de fechas */
    dateFrom?: number;
    dateTo?: number;
    
    /** Usuario específico */
    userId?: string;
    
    /** Categorías a incluir */
    categories?: AuditCategory[];
    
    /** Acciones específicas */
    actions?: AuditAction[];
    
    /** Niveles de severidad */
    levels?: AuditLevel[];
    
    /** ID de entidad específica */
    entityId?: string;
    
    /** Tipo de entidad */
    entityType?: 'reparacion' | 'repuesto' | 'archivo' | 'presupuesto';
    
    /** Solo acciones revertibles */
    revertibleOnly?: boolean;
    
    /** Búsqueda de texto */
    searchText?: string;
}

/**
 * Estadísticas del audit log.
 */
export interface AuditStats {
    /** Total de logs */
    totalLogs: number;
    
    /** Logs por categoría */
    byCategory: Record<AuditCategory, number>;
    
    /** Logs por nivel */
    byLevel: Record<AuditLevel, number>;
    
    /** Logs por usuario (top 5) */
    topUsers: Array<{
        userId: string;
        userName: string;
        count: number;
    }>;
    
    /** Acciones más frecuentes (top 10) */
    topActions: Array<{
        action: AuditAction;
        count: number;
    }>;
    
    /** Período analizado */
    period: {
        from: number;
        to: number;
    };
}

/**
 * Request para crear un log.
 */
export interface CreateAuditLogRequest {
    action: AuditAction;
    entityId?: string;
    entityType?: 'reparacion' | 'repuesto' | 'archivo' | 'presupuesto';
    description: string;
    changes?: AuditChange[];
    metadata?: Record<string, unknown>;
    level?: AuditLevel;
    revertible?: boolean;
}

/**
 * Response de búsqueda de logs.
 */
export interface GetAuditLogsResponse {
    success: boolean;
    logs: AuditLog[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

/**
 * Request para revertir una acción.
 */
export interface RevertAuditLogRequest {
    logId: string;
    reason: string;
}

/**
 * Response de revert.
 */
export interface RevertAuditLogResponse {
    success: boolean;
    message: string;
    revertLog?: AuditLog;
    error?: string;
}

/**
 * Request para exportar audit log.
 */
export interface ExportAuditLogRequest {
    filter?: AuditLogFilter;
    format: 'pdf' | 'excel' | 'csv';
    includeChanges?: boolean;
    includeMetadata?: boolean;
}

/**
 * Timeline item para visualización.
 */
export interface AuditTimelineItem {
    date: string; // YYYY-MM-DD
    logs: AuditLog[];
}

/**
 * Configuración del audit log.
 */
export interface AuditLogConfig {
    /** Habilitar audit log */
    enabled: boolean;
    
    /** Retención en días (0 = indefinido) */
    retentionDays: number;
    
    /** Categorías a auditar */
    categories: AuditCategory[];
    
    /** Niveles mínimos a registrar */
    minLevel: AuditLevel;
    
    /** Auto-cleanup de logs antiguos */
    autoCleanup: boolean;
    
    /** Incluir IP y user agent */
    includeSystemInfo: boolean;
}
