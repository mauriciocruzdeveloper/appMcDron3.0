/**
 * dashboard.service.ts
 * 
 * Servicio para calcular métricas y generar datos para el dashboard.
 * 
 * **Phase 4 - T4.2:** Dashboard de Métricas
 * - Cálculo de KPIs en tiempo real
 * - Generación de datos para gráficos
 * - Filtrado temporal
 * 
 * @module Services/Dashboard
 */

import { ReparacionType } from '../../types/reparacion';
import {
    DashboardData,
    DashboardKPIs,
    EstadosChartData,
    TendenciasChartData,
    IngresosChartData,
    ModelosTopChartData,
    TimeFilter,
    DateRange,
    DashboardConfig,
    GetDashboardDataRequest,
    GetDashboardDataResponse,
    ChartDataPoint
} from './dashboard.types';

/**
 * Servicio singleton para gestión de dashboard y métricas.
 */
export class DashboardService {
    private static instance: DashboardService;
    
    /** Configuración por defecto */
    private defaultConfig: DashboardConfig = {
        showMonetaryValues: true,
        currency: 'ARS',
        topModelsLimit: 5,
        stateColors: {
            'Recepcionado': '#6c757d',
            'Diagnosticado': '#0dcaf0',
            'Presupuestado': '#ffc107',
            'En Reparación': '#fd7e14',
            'Reparado': '#198754',
            'Entregado': '#0d6efd'
        }
    };
    
    private constructor() {}
    
    /**
     * Obtiene la instancia única del servicio.
     */
    public static getInstance(): DashboardService {
        if (!DashboardService.instance) {
            DashboardService.instance = new DashboardService();
        }
        return DashboardService.instance;
    }
    
    /**
     * Obtiene todos los datos del dashboard para el período especificado.
     */
    public async getDashboardData(
        reparaciones: ReparacionType[],
        request: GetDashboardDataRequest
    ): Promise<GetDashboardDataResponse> {
        try {
            const config = { ...this.defaultConfig, ...request.config };
            
            // Filtrar reparaciones por período
            const filtered = this.filterByTimePeriod(reparaciones, request.filter);
            
            // Calcular KPIs
            const kpis = this.calculateKPIs(filtered);
            
            // Generar datos para gráficos
            const estados = this.generateEstadosChart(filtered, config);
            const tendencias = this.generateTendenciasChart(filtered, request.filter);
            const ingresos = this.generateIngresosChart(filtered, config);
            const modelosTop = this.generateModelosTopChart(filtered, config);
            
            const data: DashboardData = {
                kpis,
                estados,
                tendencias,
                ingresos,
                modelosTop,
                filter: request.filter,
                lastUpdated: new Date().toISOString()
            };
            
            return {
                data,
                success: true
            };
        } catch (error) {
            return {
                data: this.getEmptyDashboard(request.filter),
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido'
            };
        }
    }
    
    /**
     * Filtra reparaciones por período de tiempo.
     */
    private filterByTimePeriod(
        reparaciones: ReparacionType[],
        filter: TimeFilter
    ): ReparacionType[] {
        const range = this.getDateRange(filter);
        const start = new Date(range.startDate);
        const end = new Date(range.endDate);
        
        return reparaciones.filter(rep => {
            const timestamp = rep.data.FeRecRep || rep.data.FeConRep || 0;
            const fecha = new Date(timestamp);
            return fecha >= start && fecha <= end;
        });
    }
    
    /**
     * Convierte un TimeFilter a DateRange.
     */
    private getDateRange(filter: TimeFilter): DateRange {
        const now = new Date();
        let startDate: Date;
        let endDate: Date = now;
        
        switch (filter.period) {
            case 'today':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                break;
            
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                break;
            
            case 'month':
                startDate = new Date(now);
                startDate.setMonth(now.getMonth() - 1);
                break;
            
            case 'quarter':
                startDate = new Date(now);
                startDate.setMonth(now.getMonth() - 3);
                break;
            
            case 'year':
                startDate = new Date(now);
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            
            case 'custom':
                if (!filter.customRange) {
                    throw new Error('customRange requerido para period=custom');
                }
                return filter.customRange;
            
            default:
                startDate = new Date(now);
                startDate.setMonth(now.getMonth() - 1);
        }
        
        return {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        };
    }
    
    /**
     * Calcula los KPIs principales.
     */
    private calculateKPIs(reparaciones: ReparacionType[]): DashboardKPIs {
        const total = reparaciones.length;
        
        // Contar por estado
        const porEstado = reparaciones.reduce((acc, rep) => {
            const estado = rep.data.EstadoActual || 'Recepcionado';
            acc[estado] = (acc[estado] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        const pendientes = (porEstado['Recepcionado'] || 0) + (porEstado['Diagnosticado'] || 0);
        const enProgreso = (porEstado['En Reparación'] || 0) + (porEstado['Presupuestado'] || 0);
        const finalizadas = (porEstado['Reparado'] || 0) + (porEstado['Entregado'] || 0);
        
        // Calcular tiempo promedio
        const tiemposReparacion: number[] = [];
        reparaciones.forEach(rep => {
            if (rep.data.FechaRecepcion && rep.data.FechaEntrega) {
                const inicio = new Date(rep.data.FechaRecepcion).getTime();
                const fin = new Date(rep.data.FechaEntrega).getTime();
                const dias = (fin - inicio) / (1000 * 60 * 60 * 24);
                tiemposReparacion.push(dias);
            }
        });
        
        const tiempoPromedioReparacion = tiemposReparacion.length > 0
            ? tiemposReparacion.reduce((a, b) => a + b, 0) / tiemposReparacion.length
            : 0;
        
        // Calcular ingresos
        const ingresosTotal = reparaciones.reduce((sum, rep) => {
            return sum + (parseFloat(rep.data.CostoTotal?.toString() || '0') || 0);
        }, 0);
        
        const ingresosPendientes = reparaciones
            .filter(rep => rep.data.EstadoPago !== 'Pagado')
            .reduce((sum, rep) => {
                return sum + (parseFloat(rep.data.CostoTotal?.toString() || '0') || 0);
            }, 0);
        
        // Tasa de satisfacción (simulada - en producción vendría de encuestas)
        const tasaSatisfaccion = 92; // Placeholder
        
        return {
            totalReparaciones: total,
            pendientes,
            enProgreso,
            finalizadas,
            tiempoPromedioReparacion: Math.round(tiempoPromedioReparacion * 10) / 10,
            tasaSatisfaccion,
            ingresosTotal: Math.round(ingresosTotal * 100) / 100,
            ingresosPendientes: Math.round(ingresosPendientes * 100) / 100
        };
    }
    
    /**
     * Genera datos para gráfico de estados (donut/pie).
     */
    private generateEstadosChart(
        reparaciones: ReparacionType[],
        config: DashboardConfig
    ): EstadosChartData {
        const estados: Record<string, number> = {};
        
        reparaciones.forEach(rep => {
            const estado = rep.data.EstadoActual || 'Recepcionado';
            estados[estado] = (estados[estado] || 0) + 1;
        });
        
        const data: ChartDataPoint[] = Object.entries(estados).map(([estado, count]) => ({
            label: estado,
            value: count,
            color: config.stateColors?.[estado] || '#6c757d'
        }));
        
        // Ordenar por cantidad descendente
        data.sort((a, b) => b.value - a.value);
        
        return {
            data,
            total: reparaciones.length
        };
    }
    
    /**
     * Genera datos para gráfico de tendencias temporales (line).
     */
    private generateTendenciasChart(
        reparaciones: ReparacionType[],
        filter: TimeFilter
    ): TendenciasChartData {
        const range = this.getDateRange(filter);
        const points = this.getTimePoints(filter, range);
        
        const creadas: ChartDataPoint[] = points.map(label => ({
            label,
            value: reparaciones.filter(rep => {
                const fecha = rep.data.FechaRecepcion || rep.data.FechaCreacion || '';
                return this.dateMatchesLabel(fecha, label, filter);
            }).length
        }));
        
        const finalizadas: ChartDataPoint[] = points.map(label => ({
            label,
            value: reparaciones.filter(rep => {
                const fecha = rep.data.FechaEntrega || '';
                return fecha && this.dateMatchesLabel(fecha, label, filter);
            }).length
        }));
        
        return {
            creadas,
            finalizadas
        };
    }
    
    /**
     * Genera puntos temporales según el período.
     */
    private getTimePoints(filter: TimeFilter, range: DateRange): string[] {
        const start = new Date(range.startDate);
        const end = new Date(range.endDate);
        const points: string[] = [];
        
        if (filter.period === 'today' || filter.period === 'week') {
            // Día a día
            const current = new Date(start);
            while (current <= end) {
                points.push(current.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }));
                current.setDate(current.getDate() + 1);
            }
        } else if (filter.period === 'month' || filter.period === 'quarter') {
            // Semana a semana
            const current = new Date(start);
            let weekNum = 1;
            while (current <= end) {
                points.push(`Sem ${weekNum}`);
                current.setDate(current.getDate() + 7);
                weekNum++;
            }
        } else {
            // Mes a mes
            const current = new Date(start);
            while (current <= end) {
                points.push(current.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }));
                current.setMonth(current.getMonth() + 1);
            }
        }
        
        return points;
    }
    
    /**
     * Verifica si una fecha coincide con una etiqueta temporal.
     */
    private dateMatchesLabel(dateStr: string, label: string, filter: TimeFilter): boolean {
        if (!dateStr) return false;
        
        const date = new Date(dateStr);
        const formatted = filter.period === 'year'
            ? date.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' })
            : date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
        
        return formatted === label;
    }
    
    /**
     * Genera datos para gráfico de ingresos (bar).
     */
    private generateIngresosChart(
        reparaciones: ReparacionType[],
        config: DashboardConfig
    ): IngresosChartData {
        const ingresosPorMes: Record<string, number> = {};
        
        reparaciones.forEach(rep => {
            const fecha = rep.data.FechaRecepcion || rep.data.FechaCreacion || '';
            if (fecha) {
                const mes = new Date(fecha).toLocaleDateString('es-AR', { month: 'short', year: '2-digit' });
                const monto = parseFloat(rep.data.CostoTotal?.toString() || '0') || 0;
                ingresosPorMes[mes] = (ingresosPorMes[mes] || 0) + monto;
            }
        });
        
        const data: ChartDataPoint[] = Object.entries(ingresosPorMes).map(([mes, monto]) => ({
            label: mes,
            value: Math.round(monto * 100) / 100,
            color: '#198754'
        }));
        
        const total = data.reduce((sum, point) => sum + point.value, 0);
        
        return {
            data,
            total: Math.round(total * 100) / 100
        };
    }
    
    /**
     * Genera datos para gráfico de modelos top (horizontal bar).
     */
    private generateModelosTopChart(
        reparaciones: ReparacionType[],
        config: DashboardConfig
    ): ModelosTopChartData {
        const modelosCount: Record<string, number> = {};
        
        reparaciones.forEach(rep => {
            const modelo = rep.data.ModeloDrone || 'Sin especificar';
            modelosCount[modelo] = (modelosCount[modelo] || 0) + 1;
        });
        
        const data: ChartDataPoint[] = Object.entries(modelosCount)
            .map(([modelo, count]) => ({
                label: modelo,
                value: count,
                color: '#0d6efd'
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, config.topModelsLimit);
        
        return {
            data,
            total: reparaciones.length
        };
    }
    
    /**
     * Retorna un dashboard vacío (para casos de error o sin datos).
     */
    private getEmptyDashboard(filter: TimeFilter): DashboardData {
        return {
            kpis: {
                totalReparaciones: 0,
                pendientes: 0,
                enProgreso: 0,
                finalizadas: 0,
                tiempoPromedioReparacion: 0,
                tasaSatisfaccion: 0,
                ingresosTotal: 0,
                ingresosPendientes: 0
            },
            estados: { data: [], total: 0 },
            tendencias: { creadas: [], finalizadas: [] },
            ingresos: { data: [], total: 0 },
            modelosTop: { data: [], total: 0 },
            filter,
            lastUpdated: new Date().toISOString()
        };
    }
    
    /**
     * Exporta los KPIs a formato simple para compartir.
     */
    public exportKPIsText(kpis: DashboardKPIs): string {
        return `
📊 REPORTE DE MÉTRICAS - McDron Service

Total de reparaciones: ${kpis.totalReparaciones}
├─ Pendientes: ${kpis.pendientes}
├─ En progreso: ${kpis.enProgreso}
└─ Finalizadas: ${kpis.finalizadas}

⏱️ Tiempo promedio de reparación: ${kpis.tiempoPromedioReparacion} días

💰 Ingresos:
├─ Total: $${kpis.ingresosTotal.toLocaleString('es-AR')}
└─ Pendientes: $${kpis.ingresosPendientes.toLocaleString('es-AR')}

⭐ Satisfacción del cliente: ${kpis.tasaSatisfaccion}%

---
Generado: ${new Date().toLocaleString('es-AR')}
        `.trim();
    }
}

// Exportar instancia singleton
export const dashboardService = DashboardService.getInstance();
