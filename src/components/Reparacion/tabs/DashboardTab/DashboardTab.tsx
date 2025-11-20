/**
 * DashboardTab.tsx
 * 
 * Tab de Dashboard con métricas y gráficos.
 * 
 * **Phase 4 - T4.2:** Dashboard de Métricas
 * - 4 KPI cards
 * - Gráfico de estados (donut)
 * - Gráfico de tendencias (line)
 * - Gráfico de ingresos (bar)
 * - Filtros temporales
 * 
 * @module Reparacion/tabs/DashboardTab
 */

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Badge } from 'react-bootstrap';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import { useReparacionList } from '../../../hooks/useReparacionList';
import { dashboardService } from '../../../services/dashboard/dashboard.service';
import { DashboardData, TimeFilter, TimePeriod } from '../../../services/dashboard/dashboard.types';

// Registrar componentes de Chart.js
ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

/**
 * Tab de Dashboard - Métricas y visualizaciones.
 */
export function DashboardTab(): React.ReactElement {
    const { reparaciones, isLoading } = useReparacionList();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [timeFilter, setTimeFilter] = useState<TimeFilter>({ period: 'month' });
    const [loadingDashboard, setLoadingDashboard] = useState(false);
    
    // Cargar datos del dashboard
    useEffect(() => {
        loadDashboardData();
    }, [reparaciones, timeFilter]);
    
    const loadDashboardData = async () => {
        if (reparaciones.length === 0) return;
        
        setLoadingDashboard(true);
        const response = await dashboardService.getDashboardData(reparaciones, {
            filter: timeFilter
        });
        
        if (response.success) {
            setDashboardData(response.data);
        }
        setLoadingDashboard(false);
    };
    
    const handlePeriodChange = (period: TimePeriod) => {
        setTimeFilter({ period });
    };
    
    if (isLoading || loadingDashboard) {
        return (
            <Container fluid className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Cargando dashboard...</p>
            </Container>
        );
    }
    
    if (!dashboardData) {
        return (
            <Container fluid className="py-5 text-center">
                <i className="bi bi-bar-chart fs-1 text-muted mb-3 d-block"></i>
                <h5>No hay datos para mostrar</h5>
                <p className="text-muted">Crea algunas reparaciones para ver las métricas.</p>
            </Container>
        );
    }
    
    const { kpis, estados, tendencias, ingresos, modelosTop } = dashboardData;
    
    // Datos para gráfico de estados (Donut)
    const estadosChartData = {
        labels: estados.data.map((d: { label: string }) => d.label),
        datasets: [{
            data: estados.data.map((d: { value: number }) => d.value),
            backgroundColor: estados.data.map((d: { color?: string }) => d.color),
            borderWidth: 2,
            borderColor: '#fff'
        }]
    };
    
    // Datos para gráfico de tendencias (Line)
    const tendenciasChartData = {
        labels: tendencias.creadas.map((d: { label: string }) => d.label),
        datasets: [
            {
                label: 'Creadas',
                data: tendencias.creadas.map((d: { value: number }) => d.value),
                borderColor: '#0d6efd',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                tension: 0.4
            },
            {
                label: 'Finalizadas',
                data: tendencias.finalizadas.map((d: { value: number }) => d.value),
                borderColor: '#198754',
                backgroundColor: 'rgba(25, 135, 84, 0.1)',
                tension: 0.4
            }
        ]
    };
    
    // Datos para gráfico de ingresos (Bar)
    const ingresosChartData = {
        labels: ingresos.data.map((d: { label: string }) => d.label),
        datasets: [{
            label: 'Ingresos ($)',
            data: ingresos.data.map((d: { value: number }) => d.value),
            backgroundColor: '#198754',
            borderColor: '#146c43',
            borderWidth: 1
        }]
    };
    
    // Datos para gráfico de modelos top (Horizontal Bar)
    const modelosTopChartData = {
        labels: modelosTop.data.map((d: { label: string }) => d.label),
        datasets: [{
            label: 'Reparaciones',
            data: modelosTop.data.map((d: { value: number }) => d.value),
            backgroundColor: '#0d6efd',
            borderColor: '#0a58ca',
            borderWidth: 1
        }]
    };
    
    return (
        <Container fluid className="py-3">
            {/* Filtros temporales */}
            <Row className="mb-4">
                <Col>
                    <Card className="shadow-sm">
                        <Card.Body className="d-flex align-items-center justify-content-between">
                            <div>
                                <h5 className="mb-1">Dashboard de Métricas</h5>
                                <small className="text-muted">
                                    Última actualización: {new Date(dashboardData.lastUpdated).toLocaleString('es-AR')}
                                </small>
                            </div>
                            <div className="d-flex gap-2">
                                <Button
                                    size="sm"
                                    variant={timeFilter.period === 'today' ? 'primary' : 'outline-primary'}
                                    onClick={() => handlePeriodChange('today')}
                                >
                                    Hoy
                                </Button>
                                <Button
                                    size="sm"
                                    variant={timeFilter.period === 'week' ? 'primary' : 'outline-primary'}
                                    onClick={() => handlePeriodChange('week')}
                                >
                                    7 días
                                </Button>
                                <Button
                                    size="sm"
                                    variant={timeFilter.period === 'month' ? 'primary' : 'outline-primary'}
                                    onClick={() => handlePeriodChange('month')}
                                >
                                    30 días
                                </Button>
                                <Button
                                    size="sm"
                                    variant={timeFilter.period === 'quarter' ? 'primary' : 'outline-primary'}
                                    onClick={() => handlePeriodChange('quarter')}
                                >
                                    3 meses
                                </Button>
                                <Button
                                    size="sm"
                                    variant={timeFilter.period === 'year' ? 'primary' : 'outline-primary'}
                                    onClick={() => handlePeriodChange('year')}
                                >
                                    Año
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            {/* KPI Cards */}
            <Row className="mb-4">
                <Col lg={3} md={6} className="mb-3">
                    <Card className="shadow-sm h-100 border-start border-primary border-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted text-uppercase mb-1">Total Reparaciones</h6>
                                    <h2 className="mb-0">{kpis.totalReparaciones}</h2>
                                </div>
                                <i className="bi bi-wrench fs-1 text-primary opacity-25"></i>
                            </div>
                            <div className="mt-3">
                                <Badge bg="secondary" className="me-1">Pendientes: {kpis.pendientes}</Badge>
                                <Badge bg="warning" className="me-1">En progreso: {kpis.enProgreso}</Badge>
                                <Badge bg="success">Finalizadas: {kpis.finalizadas}</Badge>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                
                <Col lg={3} md={6} className="mb-3">
                    <Card className="shadow-sm h-100 border-start border-warning border-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted text-uppercase mb-1">Tiempo Promedio</h6>
                                    <h2 className="mb-0">{kpis.tiempoPromedioReparacion} <small className="fs-6">días</small></h2>
                                </div>
                                <i className="bi bi-clock-history fs-1 text-warning opacity-25"></i>
                            </div>
                            <small className="text-muted">Desde recepción hasta entrega</small>
                        </Card.Body>
                    </Card>
                </Col>
                
                <Col lg={3} md={6} className="mb-3">
                    <Card className="shadow-sm h-100 border-start border-success border-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted text-uppercase mb-1">Ingresos Total</h6>
                                    <h2 className="mb-0">${kpis.ingresosTotal.toLocaleString('es-AR')}</h2>
                                </div>
                                <i className="bi bi-currency-dollar fs-1 text-success opacity-25"></i>
                            </div>
                            <small className="text-danger">
                                <i className="bi bi-exclamation-circle me-1"></i>
                                Pendientes: ${kpis.ingresosPendientes.toLocaleString('es-AR')}
                            </small>
                        </Card.Body>
                    </Card>
                </Col>
                
                <Col lg={3} md={6} className="mb-3">
                    <Card className="shadow-sm h-100 border-start border-info border-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted text-uppercase mb-1">Satisfacción</h6>
                                    <h2 className="mb-0">{kpis.tasaSatisfaccion}%</h2>
                                </div>
                                <i className="bi bi-star-fill fs-1 text-info opacity-25"></i>
                            </div>
                            <small className="text-muted">Promedio de valoraciones</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            {/* Gráficos */}
            <Row>
                {/* Gráfico de Estados (Donut) */}
                <Col lg={4} className="mb-4">
                    <Card className="shadow-sm h-100">
                        <Card.Body>
                            <h6 className="mb-3">
                                <i className="bi bi-pie-chart-fill me-2 text-primary"></i>
                                Distribución por Estado
                            </h6>
                            <div style={{ height: '300px', position: 'relative' }}>
                                <Doughnut
                                    data={estadosChartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'bottom'
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                
                {/* Gráfico de Tendencias (Line) */}
                <Col lg={8} className="mb-4">
                    <Card className="shadow-sm h-100">
                        <Card.Body>
                            <h6 className="mb-3">
                                <i className="bi bi-graph-up me-2 text-primary"></i>
                                Tendencia de Reparaciones
                            </h6>
                            <div style={{ height: '300px', position: 'relative' }}>
                                <Line
                                    data={tendenciasChartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'top'
                                            }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                ticks: {
                                                    stepSize: 1
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                
                {/* Gráfico de Ingresos (Bar) */}
                <Col lg={6} className="mb-4">
                    <Card className="shadow-sm h-100">
                        <Card.Body>
                            <h6 className="mb-3">
                                <i className="bi bi-cash-stack me-2 text-success"></i>
                                Ingresos por Período
                            </h6>
                            <div style={{ height: '250px', position: 'relative' }}>
                                <Bar
                                    data={ingresosChartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                display: false
                                            }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                
                {/* Gráfico de Modelos Top (Horizontal Bar) */}
                <Col lg={6} className="mb-4">
                    <Card className="shadow-sm h-100">
                        <Card.Body>
                            <h6 className="mb-3">
                                <i className="bi bi-award me-2 text-warning"></i>
                                Modelos Más Reparados
                            </h6>
                            <div style={{ height: '250px', position: 'relative' }}>
                                <Bar
                                    data={modelosTopChartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        indexAxis: 'y',
                                        plugins: {
                                            legend: {
                                                display: false
                                            }
                                        },
                                        scales: {
                                            x: {
                                                beginAtZero: true,
                                                ticks: {
                                                    stepSize: 1
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
