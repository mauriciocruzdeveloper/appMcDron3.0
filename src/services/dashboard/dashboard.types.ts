/**
 * dashboard.types.ts
 * 
 * Tipos TypeScript para el sistema de Dashboard y métricas.
 * 
 * **Phase 4 - T4.2:** Dashboard de Métricas
 * - KPIs principales
 * - Gráficos de estadísticas
 * - Filtros temporales
 * 
 * @module Services/Dashboard
 */

/**
 * Período de tiempo para filtrar métricas
 */
export type TimePeriod = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

/**
 * Rango de fechas personalizado
 */
export interface DateRange {
    /** Fecha de inicio (ISO 8601) */
    startDate: string;
    
    /** Fecha de fin (ISO 8601) */
    endDate: string;
}

/**
 * Filtro temporal para métricas
 */
export interface TimeFilter {
    /** Período predefinido */
    period: TimePeriod;
    
    /** Rango personalizado (solo si period='custom') */
    customRange?: DateRange;
}

/**
 * Métricas KPI principales
 */
export interface DashboardKPIs {
    /** Total de reparaciones */
    totalReparaciones: number;
    
    /** Reparaciones pendientes */
    pendientes: number;
    
    /** Reparaciones en progreso */
    enProgreso: number;
    
    /** Reparaciones finalizadas */
    finalizadas: number;
    
    /** Tiempo promedio de reparación (días) */
    tiempoPromedioReparacion: number;
    
    /** Tasa de satisfacción del cliente (0-100) */
    tasaSatisfaccion: number;
    
    /** Ingresos totales del período */
    ingresosTotal: number;
    
    /** Ingresos pendientes de cobro */
    ingresosPendientes: number;
}

/**
 * Punto de datos para gráficos
 */
export interface ChartDataPoint {
    /** Etiqueta (ej: fecha, categoría) */
    label: string;
    
    /** Valor numérico */
    value: number;
    
    /** Color (opcional) */
    color?: string;
}

/**
 * Datos para gráfico de estados
 */
export interface EstadosChartData {
    /** Reparaciones por estado */
    data: ChartDataPoint[];
    
    /** Total de reparaciones */
    total: number;
}

/**
 * Datos para gráfico de tendencias temporal
 */
export interface TendenciasChartData {
    /** Reparaciones creadas por día/semana/mes */
    creadas: ChartDataPoint[];
    
    /** Reparaciones finalizadas por día/semana/mes */
    finalizadas: ChartDataPoint[];
}

/**
 * Datos para gráfico de ingresos
 */
export interface IngresosChartData {
    /** Ingresos por período */
    data: ChartDataPoint[];
    
    /** Total acumulado */
    total: number;
}

/**
 * Datos para gráfico de modelos más reparados
 */
export interface ModelosTopChartData {
    /** Top modelos de drones */
    data: ChartDataPoint[];
    
    /** Total de reparaciones */
    total: number;
}

/**
 * Todos los datos del dashboard
 */
export interface DashboardData {
    /** KPIs principales */
    kpis: DashboardKPIs;
    
    /** Gráfico de estados */
    estados: EstadosChartData;
    
    /** Gráfico de tendencias */
    tendencias: TendenciasChartData;
    
    /** Gráfico de ingresos */
    ingresos: IngresosChartData;
    
    /** Gráfico de modelos top */
    modelosTop: ModelosTopChartData;
    
    /** Filtro aplicado */
    filter: TimeFilter;
    
    /** Timestamp de última actualización */
    lastUpdated: string;
}

/**
 * Opciones de configuración para el dashboard
 */
export interface DashboardConfig {
    /** Actualización automática (ms) */
    autoRefreshInterval?: number;
    
    /** Mostrar valores monetarios */
    showMonetaryValues: boolean;
    
    /** Formato de moneda */
    currency: 'ARS' | 'USD';
    
    /** Cantidad de items en top modelos */
    topModelsLimit: number;
    
    /** Colores personalizados para estados */
    stateColors?: Record<string, string>;
}

/**
 * Respuesta al solicitar datos del dashboard
 */
export interface GetDashboardDataRequest {
    /** Filtro temporal */
    filter: TimeFilter;
    
    /** Configuración */
    config?: Partial<DashboardConfig>;
}

export interface GetDashboardDataResponse {
    /** Datos del dashboard */
    data: DashboardData;
    
    /** Éxito de la operación */
    success: boolean;
    
    /** Mensaje de error (si aplica) */
    error?: string;
}
