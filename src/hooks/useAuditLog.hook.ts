/**
 * useAuditLog.hook.ts
 * 
 * Hook para gestionar audit logs desde componentes React.
 * 
 * **Phase 4 - T4.6:** Audit Log
 * - Facilita el uso del AuditService
 * - Manejo de estado reactivo
 * - Métodos helper
 * 
 * @module Hooks/AuditLog
 */

import { useState, useEffect, useCallback } from 'react';
import { auditService } from '../services/audit/audit.service';
import {
    AuditLog,
    AuditAction,
    AuditLogFilter,
    AuditStats,
    AuditTimelineItem,
    CreateAuditLogRequest,
    AuditLogConfig,
    AuditChange
} from '../types/audit.types';

/**
 * Resultado del hook useAuditLog.
 */
interface UseAuditLogResult {
    /** Logs actuales */
    logs: AuditLog[];
    
    /** Está cargando */
    isLoading: boolean;
    
    /** Error si existe */
    error: string | null;
    
    /** Total de logs */
    total: number;
    
    /** Página actual */
    page: number;
    
    /** Hay más páginas */
    hasMore: boolean;
    
    /** Crear un nuevo log */
    createLog: (request: CreateAuditLogRequest) => Promise<AuditLog>;
    
    /** Obtener logs de una entidad */
    getEntityLogs: (entityId: string, entityType: 'reparacion' | 'repuesto' | 'archivo' | 'presupuesto') => Promise<AuditLog[]>;
    
    /** Recargar logs */
    reload: () => Promise<void>;
    
    /** Cambiar página */
    setPage: (page: number) => void;
    
    /** Aplicar filtros */
    setFilter: (filter: AuditLogFilter) => void;
    
    /** Limpiar filtros */
    clearFilter: () => void;
}

/**
 * Hook para gestionar audit logs.
 * 
 * @example
 * ```tsx
 * function AuditLogViewer() {
 *   const { logs, isLoading, createLog, reload } = useAuditLog();
 *   
 *   const handleAction = async () => {
 *     await createLog({
 *       action: AuditAction.REPARACION_UPDATED,
 *       entityId: '123',
 *       entityType: 'reparacion',
 *       description: 'Actualizada información del cliente'
 *     });
 *     reload();
 *   };
 *   
 *   return (
 *     <div>
 *       {logs.map(log => (
 *         <div key={log.id}>{log.description}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuditLog(
    initialFilter?: AuditLogFilter,
    initialPage = 1,
    pageSize = 50
): UseAuditLogResult {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(initialPage);
    const [hasMore, setHasMore] = useState(false);
    const [filter, setFilter] = useState<AuditLogFilter | undefined>(initialFilter);
    
    // Cargar logs
    const loadLogs = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await auditService.getLogs(filter, page, pageSize);
            setLogs(response.logs);
            setTotal(response.total);
            setHasMore(response.hasMore);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar logs');
        } finally {
            setIsLoading(false);
        }
    }, [filter, page, pageSize]);
    
    // Cargar logs al montar y cuando cambien dependencias
    useEffect(() => {
        loadLogs();
    }, [loadLogs]);
    
    // Crear log
    const createLog = useCallback(async (request: CreateAuditLogRequest): Promise<AuditLog> => {
        try {
            const log = await auditService.createLog(request);
            return log;
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error al crear log');
        }
    }, []);
    
    // Obtener logs de entidad
    const getEntityLogs = useCallback(async (
        entityId: string,
        entityType: 'reparacion' | 'repuesto' | 'archivo' | 'presupuesto'
    ): Promise<AuditLog[]> => {
        try {
            return await auditService.getEntityLogs(entityId, entityType);
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error al obtener logs de entidad');
        }
    }, []);
    
    // Recargar
    const reload = useCallback(async () => {
        await loadLogs();
    }, [loadLogs]);
    
    // Cambiar filtro
    const setFilterFn = useCallback((newFilter: AuditLogFilter) => {
        setFilter(newFilter);
        setPage(1); // Reset a primera página
    }, []);
    
    // Limpiar filtro
    const clearFilter = useCallback(() => {
        setFilter(undefined);
        setPage(1);
    }, []);
    
    return {
        logs,
        isLoading,
        error,
        total,
        page,
        hasMore,
        createLog,
        getEntityLogs,
        reload,
        setPage,
        setFilter: setFilterFn,
        clearFilter
    };
}

/**
 * Hook para obtener timeline de cambios.
 */
export function useAuditTimeline(filter?: AuditLogFilter): {
    timeline: AuditTimelineItem[];
    isLoading: boolean;
    error: string | null;
    reload: () => Promise<void>;
} {
    const [timeline, setTimeline] = useState<AuditTimelineItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const loadTimeline = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await auditService.getTimeline(filter);
            setTimeline(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar timeline');
        } finally {
            setIsLoading(false);
        }
    }, [filter]);
    
    useEffect(() => {
        loadTimeline();
    }, [loadTimeline]);
    
    return {
        timeline,
        isLoading,
        error,
        reload: loadTimeline
    };
}

/**
 * Hook para obtener estadísticas.
 */
export function useAuditStats(filter?: AuditLogFilter): {
    stats: AuditStats | null;
    isLoading: boolean;
    error: string | null;
    reload: () => Promise<void>;
} {
    const [stats, setStats] = useState<AuditStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const loadStats = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await auditService.getStats(filter);
            setStats(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
        } finally {
            setIsLoading(false);
        }
    }, [filter]);
    
    useEffect(() => {
        loadStats();
    }, [loadStats]);
    
    return {
        stats,
        isLoading,
        error,
        reload: loadStats
    };
}

/**
 * Hook para gestionar configuración del audit log.
 */
export function useAuditConfig(): {
    config: AuditLogConfig;
    updateConfig: (newConfig: Partial<AuditLogConfig>) => void;
} {
    const [config, setConfig] = useState<AuditLogConfig>(auditService.getConfig());
    
    const updateConfig = useCallback((newConfig: Partial<AuditLogConfig>) => {
        auditService.updateConfig(newConfig);
        setConfig(auditService.getConfig());
    }, []);
    
    return {
        config,
        updateConfig
    };
}

/**
 * Hook helper para registrar una acción rápidamente.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const logAction = useLogAction();
 *   
 *   const handleSave = async () => {
 *     // ... guardar datos ...
 *     await logAction(
 *       AuditAction.REPARACION_UPDATED,
 *       'Datos actualizados correctamente',
 *       'reparacion-123'
 *     );
 *   };
 * }
 * ```
 */
export function useLogAction(): (
    action: AuditAction,
    description: string,
    entityId?: string,
    entityType?: 'reparacion' | 'repuesto' | 'archivo' | 'presupuesto',
    changes?: AuditChange[]
) => Promise<void> {
    return useCallback(async (
        action: AuditAction,
        description: string,
        entityId?: string,
        entityType?: 'reparacion' | 'repuesto' | 'archivo' | 'presupuesto',
        changes?: AuditChange[]
    ) => {
        try {
            await auditService.createLog({
                action,
                description,
                entityId,
                entityType,
                changes
            });
        } catch (err) {
            console.error('Error al registrar acción:', err);
        }
    }, []);
}
