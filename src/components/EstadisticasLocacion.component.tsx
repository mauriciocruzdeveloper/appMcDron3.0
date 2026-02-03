import React, { useState, useMemo } from 'react';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { selectReparacionesArray } from '../redux-tool-kit/reparacion/reparacion.selectors';
import { selectColeccionUsuarios } from '../redux-tool-kit/usuario/usuario.selectors';
import { ChevronDown, ChevronUp } from 'react-bootstrap-icons';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { useNavigate } from 'react-router-dom';

ChartJS.register(
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

interface EstadisticaLocacion {
    locacion: string;
    cantidad: number;
    reparaciones: any[];
}

interface EstadisticaMes {
    mes: number;
    nombreMes: string;
    locaciones: Record<string, number>;
}

const COLORES_LINEAS = [
    'rgb(255, 99, 132)',
    'rgb(54, 162, 235)',
    'rgb(255, 206, 86)',
    'rgb(75, 192, 192)',
    'rgb(153, 102, 255)',
    'rgb(255, 159, 64)',
    'rgb(199, 199, 199)',
    'rgb(83, 102, 255)',
    'rgb(255, 99, 255)',
    'rgb(99, 255, 132)',
];

export default function EstadisticasLocacion(): JSX.Element {
    const [filtroAno, setFiltroAno] = useState<number>(new Date().getFullYear());
    const [locacionExpandida, setLocacionExpandida] = useState<string | null>(null);
    const [vistaAgrupacion, setVistaAgrupacion] = useState<'anual' | 'mensual'>('anual');
    const [tipoLocacion, setTipoLocacion] = useState<'ciudad' | 'provincia'>('ciudad');
    const reparaciones = useAppSelector(selectReparacionesArray);
    const usuarios = useAppSelector(selectColeccionUsuarios);
    const navigate = useNavigate();

    // Calcular años disponibles desde las reparaciones
    const anosDisponibles = useMemo(() => {
        const anos = new Set<number>();
        reparaciones.forEach(rep => {
            const fechaValue = rep.data.FeFinRep || rep.data.FeConRep;
            if (!fechaValue) return;
            const fecha = new Date(fechaValue);
            const ano = fecha.getFullYear();
            if (ano >= 2000 && ano <= new Date().getFullYear()) { // Validar años razonables
                anos.add(ano);
            }
        });
        return Array.from(anos).sort((a, b) => b - a); // Ordenar descendente
    }, [reparaciones]);

    // Filtrar reparaciones del año seleccionado
    const reparacionesFiltradas = useMemo(() => {
        return reparaciones.filter(rep => {
            const fechaValue = rep.data.FeFinRep || rep.data.FeConRep;
            if (!fechaValue) return false;
            const fecha = new Date(fechaValue);
            return fecha.getFullYear() === filtroAno;
        });
    }, [reparaciones, filtroAno]);

    // Calcular estadísticas por locación (agrupado por año)
    const estadisticasPorLocacion = useMemo(() => {
        const locaciones: Record<string, any[]> = {};
        
        reparacionesFiltradas.forEach(rep => {
            const usuario = usuarios[rep.data.UsuarioRep];
            const locacion = tipoLocacion === 'ciudad' 
                ? (usuario?.data?.CiudadUsu || 'Sin especificar')
                : (usuario?.data?.ProvinciaUsu || 'Sin especificar');
            if (!locaciones[locacion]) {
                locaciones[locacion] = [];
            }
            locaciones[locacion].push(rep);
        });

        return Object.entries(locaciones)
            .map(([locacion, reps]) => ({
                locacion,
                cantidad: reps.length,
                reparaciones: reps
            }))
            .sort((a, b) => b.cantidad - a.cantidad);
    }, [reparacionesFiltradas, usuarios, tipoLocacion]);

    // Calcular estadísticas mensuales por locación
    const estadisticasMensuales = useMemo(() => {
        const meses: EstadisticaMes[] = Array.from({ length: 12 }, (_, i) => ({
            mes: i + 1,
            nombreMes: new Date(2024, i, 1).toLocaleDateString('es-ES', { month: 'long' }),
            locaciones: {}
        }));

        reparacionesFiltradas.forEach(rep => {
            const fechaValue = rep.data.FeFinRep || rep.data.FeConRep;
            if (!fechaValue) return;
            const fecha = new Date(fechaValue);
            const mes = fecha.getMonth();
            const usuario = usuarios[rep.data.UsuarioRep];
            const locacion = tipoLocacion === 'ciudad' 
                ? (usuario?.data?.CiudadUsu || 'Sin especificar')
                : (usuario?.data?.ProvinciaUsu || 'Sin especificar');
            
            if (!meses[mes].locaciones[locacion]) {
                meses[mes].locaciones[locacion] = 0;
            }
            meses[mes].locaciones[locacion]++;
        });

        return meses;
    }, [reparacionesFiltradas, usuarios, tipoLocacion]);

    // Obtener todas las locaciones únicas para el gráfico mensual
    const locacionesUnicas = useMemo(() => {
        const locaciones = new Set<string>();
        estadisticasMensuales.forEach(mes => {
            Object.keys(mes.locaciones).forEach(loc => locaciones.add(loc));
        });
        return Array.from(locaciones).sort();
    }, [estadisticasMensuales]);

    // Calcular datos para gráfico anual (evolución por año)
    const datosGraficoAnual = useMemo(() => {
        const anos: number[] = [];
        const locacionesPorAno: Record<string, Record<number, number>> = {};

        // Recopilar datos de todos los años disponibles
        reparaciones.forEach(rep => {
            const fechaValue = rep.data.FeFinRep || rep.data.FeConRep;
            if (!fechaValue) return;
            const fecha = new Date(fechaValue);
            const ano = fecha.getFullYear();
            const usuario = usuarios[rep.data.UsuarioRep];
            const locacion = tipoLocacion === 'ciudad' 
                ? (usuario?.data?.CiudadUsu || 'Sin especificar')
                : (usuario?.data?.ProvinciaUsu || 'Sin especificar');

            if (!anos.includes(ano)) {
                anos.push(ano);
            }

            if (!locacionesPorAno[locacion]) {
                locacionesPorAno[locacion] = {};
            }
            if (!locacionesPorAno[locacion][ano]) {
                locacionesPorAno[locacion][ano] = 0;
            }
            locacionesPorAno[locacion][ano]++;
        });

        anos.sort((a, b) => a - b);

        // Obtener top 10 locaciones por volumen total
        const top10Locaciones = Object.entries(locacionesPorAno)
            .map(([loc, anos]) => ({
                locacion: loc,
                total: Object.values(anos).reduce((sum, val) => sum + val, 0)
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10)
            .map(item => item.locacion);

        const datasets = top10Locaciones.map((locacion, index) => ({
            label: locacion,
            data: anos.map(ano => locacionesPorAno[locacion]?.[ano] || 0),
            borderColor: COLORES_LINEAS[index % COLORES_LINEAS.length],
            backgroundColor: COLORES_LINEAS[index % COLORES_LINEAS.length],
            tension: 0.3,
        }));

        return {
            labels: anos,
            datasets
        };
    }, [reparaciones, usuarios, tipoLocacion]);

    // Calcular datos para gráfico mensual (solo año seleccionado)
    const datosGraficoMensual = useMemo(() => {
        // Usar solo top 10 locaciones del año actual
        const top10LocacionesAnual = estadisticasPorLocacion.slice(0, 10).map(e => e.locacion);

        const datasets = top10LocacionesAnual.map((locacion, index) => ({
            label: locacion,
            data: estadisticasMensuales.map(mes => mes.locaciones[locacion] || 0),
            borderColor: COLORES_LINEAS[index % COLORES_LINEAS.length],
            backgroundColor: COLORES_LINEAS[index % COLORES_LINEAS.length],
            tension: 0.3,
        }));

        return {
            labels: estadisticasMensuales.map(m => m.nombreMes),
            datasets
        };
    }, [estadisticasMensuales, estadisticasPorLocacion]);

    // Calcular datos para gráfico de porcentajes anual
    const datosGraficoPorcentajesAnual = useMemo(() => {
        const anos: number[] = [];
        const locacionesPorAno: Record<string, Record<number, number>> = {};
        const totalesPorAno: Record<number, number> = {};

        // Recopilar datos y totales
        reparaciones.forEach(rep => {
            const fechaValue = rep.data.FeFinRep || rep.data.FeConRep;
            if (!fechaValue) return;
            const fecha = new Date(fechaValue);
            const ano = fecha.getFullYear();
            const usuario = usuarios[rep.data.UsuarioRep];
            const locacion = tipoLocacion === 'ciudad' 
                ? (usuario?.data?.CiudadUsu || 'Sin especificar')
                : (usuario?.data?.ProvinciaUsu || 'Sin especificar');

            if (!anos.includes(ano)) anos.push(ano);
            if (!totalesPorAno[ano]) totalesPorAno[ano] = 0;
            totalesPorAno[ano]++;

            if (!locacionesPorAno[locacion]) locacionesPorAno[locacion] = {};
            if (!locacionesPorAno[locacion][ano]) locacionesPorAno[locacion][ano] = 0;
            locacionesPorAno[locacion][ano]++;
        });

        anos.sort((a, b) => a - b);

        const top10Locaciones = Object.entries(locacionesPorAno)
            .map(([loc, anos]) => ({
                locacion: loc,
                total: Object.values(anos).reduce((sum, val) => sum + val, 0)
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10)
            .map(item => item.locacion);

        const datasets = top10Locaciones.map((locacion, index) => ({
            label: locacion,
            data: anos.map(ano => {
                const cantidad = locacionesPorAno[locacion]?.[ano] || 0;
                const total = totalesPorAno[ano] || 1;
                return ((cantidad / total) * 100);
            }),
            borderColor: COLORES_LINEAS[index % COLORES_LINEAS.length],
            backgroundColor: COLORES_LINEAS[index % COLORES_LINEAS.length],
            tension: 0.3,
        }));

        return { labels: anos, datasets };
    }, [reparaciones, usuarios, tipoLocacion]);

    // Calcular datos para gráfico de porcentajes mensual
    const datosGraficoPorcentajesMensual = useMemo(() => {
        const top10LocacionesAnual = estadisticasPorLocacion.slice(0, 10).map(e => e.locacion);

        const datasets = top10LocacionesAnual.map((locacion, index) => ({
            label: locacion,
            data: estadisticasMensuales.map(mes => {
                const cantidad = mes.locaciones[locacion] || 0;
                const total = Object.values(mes.locaciones).reduce((sum, val) => sum + val, 0) || 1;
                return ((cantidad / total) * 100);
            }),
            borderColor: COLORES_LINEAS[index % COLORES_LINEAS.length],
            backgroundColor: COLORES_LINEAS[index % COLORES_LINEAS.length],
            tension: 0.3,
        }));

        return {
            labels: estadisticasMensuales.map(m => m.nombreMes),
            datasets
        };
    }, [estadisticasMensuales, estadisticasPorLocacion]);

    const opcionesGrafico = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    boxWidth: 12,
                    padding: 8,
                    font: {
                        size: 11
                    }
                }
            },
            title: {
                display: true,
                text: vistaAgrupacion === 'anual' 
                    ? `Evolución de Reparaciones por ${tipoLocacion === 'ciudad' ? 'Ciudad' : 'Provincia'} (Todos los Años)`
                    : `Evolución Mensual de Reparaciones por ${tipoLocacion === 'ciudad' ? 'Ciudad' : 'Provincia'} - ${filtroAno}`,
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        return `${context.dataset.label}: ${context.parsed.y} reparaciones`;
                    }
                }
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
    };

    const opcionesGraficoPorcentajes = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    boxWidth: 12,
                    padding: 8,
                    font: {
                        size: 11
                    }
                }
            },
            title: {
                display: true,
                text: vistaAgrupacion === 'anual' 
                    ? `Distribución Porcentual por ${tipoLocacion === 'ciudad' ? 'Ciudad' : 'Provincia'} (Todos los Años)`
                    : `Distribución Porcentual por ${tipoLocacion === 'ciudad' ? 'Ciudad' : 'Provincia'} - ${filtroAno}`,
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    callback: function(value: any) {
                        return value + '%';
                    }
                }
            }
        }
    };

    const totalReparaciones = reparacionesFiltradas.length;

    return (
        <div className='p-4'>
            <h2 className="mb-4">Estadísticas por Locación</h2>
            
            <div className='card mb-3'>
                <div className='card-body'>
                    <div className='row'>
                        <div className='col-md-6'>
                            <div className='form-group'>
                                <label>Año:</label>
                                <select
                                    className='form-select'
                                    value={filtroAno}
                                    onChange={(e) => setFiltroAno(Number(e.target.value))}
                                >
                                    {anosDisponibles.length > 0 ? (
                                        anosDisponibles.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))
                                    ) : (
                                        <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                                    )}
                                </select>
                            </div>
                        </div>
                        <div className='col-md-4'>
                            <div className='form-group'>
                                <label>Tipo de Locación:</label>
                                <select
                                    className='form-select'
                                    value={tipoLocacion}
                                    onChange={(e) => setTipoLocacion(e.target.value as 'ciudad' | 'provincia')}
                                >
                                    <option value="ciudad">Por Ciudad</option>
                                    <option value="provincia">Por Provincia</option>
                                </select>
                            </div>
                        </div>
                        <div className='col-md-4'>
                            <div className='form-group'>
                                <label>Agrupación:</label>
                                <select
                                    className='form-select'
                                    value={vistaAgrupacion}
                                    onChange={(e) => setVistaAgrupacion(e.target.value as 'anual' | 'mensual')}
                                >
                                    <option value="anual">Por Año (Histórico)</option>
                                    <option value="mensual">Por Mes (Año Seleccionado)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="card bg-primary text-white">
                        <div className="card-body text-center">
                            <h5>Total {filtroAno}</h5>
                            <h3>{totalReparaciones}</h3>
                            <small>reparaciones</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card bg-info text-white">
                        <div className="card-body text-center">
                            <h5>{tipoLocacion === 'ciudad' ? 'Ciudades' : 'Provincias'} Diferentes</h5>
                            <h3>{estadisticasPorLocacion.length}</h3>
                            <small>{tipoLocacion === 'ciudad' ? 'ciudades' : 'provincias'}</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card bg-success text-white">
                        <div className="card-body text-center">
                            <h5>Promedio por {tipoLocacion === 'ciudad' ? 'Ciudad' : 'Provincia'}</h5>
                            <h3>{estadisticasPorLocacion.length > 0 ? (totalReparaciones / estadisticasPorLocacion.length).toFixed(1) : 0}</h3>
                            <small>reparaciones/{tipoLocacion === 'ciudad' ? 'ciudad' : 'provincia'}</small>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card mb-4">
                <div className="card-header">
                    <h5>
                        {vistaAgrupacion === 'anual' 
                            ? `Evolución Histórica por ${tipoLocacion === 'ciudad' ? 'Ciudad' : 'Provincia'}` 
                            : `Evolución Mensual ${filtroAno} por ${tipoLocacion === 'ciudad' ? 'Ciudad' : 'Provincia'}`}
                    </h5>
                </div>
                <div className="card-body" style={{ minHeight: '300px', height: '400px' }}>
                    <Line 
                        options={opcionesGrafico} 
                        data={vistaAgrupacion === 'anual' ? datosGraficoAnual : datosGraficoMensual as any} 
                    />
                </div>
            </div>

            <div className="card mb-4">
                <div className="card-header">
                    <h5>
                        {vistaAgrupacion === 'anual' 
                            ? `Distribución Porcentual por ${tipoLocacion === 'ciudad' ? 'Ciudad' : 'Provincia'}` 
                            : `Distribución Porcentual Mensual ${filtroAno} por ${tipoLocacion === 'ciudad' ? 'Ciudad' : 'Provincia'}`}
                    </h5>
                </div>
                <div className="card-body" style={{ minHeight: '300px', height: '400px' }}>
                    <Line 
                        options={opcionesGraficoPorcentajes} 
                        data={vistaAgrupacion === 'anual' ? datosGraficoPorcentajesAnual : datosGraficoPorcentajesMensual as any} 
                    />
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h5>Reparaciones por {tipoLocacion === 'ciudad' ? 'Ciudad' : 'Provincia'} - {filtroAno}</h5>
                </div>
                <div className="card-body">
                    {estadisticasPorLocacion.map((locacion, index) => (
                        <div key={locacion.locacion}>
                            <div 
                                className="d-flex justify-content-between align-items-center border-bottom py-2 cursor-pointer"
                                onClick={() => setLocacionExpandida(
                                    locacionExpandida === locacion.locacion ? null : locacion.locacion
                                )}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="d-flex align-items-center">
                                    {locacionExpandida === locacion.locacion ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    <strong className="ms-2">{locacion.locacion}</strong>
                                    <span 
                                        className="ms-2 badge"
                                        style={{ 
                                            backgroundColor: COLORES_LINEAS[index % COLORES_LINEAS.length],
                                            color: 'white'
                                        }}
                                    >
                                        {locacion.cantidad} {locacion.cantidad === 1 ? 'reparación' : 'reparaciones'}
                                    </span>
                                </div>
                                <div className="text-end">
                                    <span className="badge bg-secondary">
                                        {totalReparaciones > 0 ? ((locacion.cantidad / totalReparaciones) * 100).toFixed(1) : 0}%
                                    </span>
                                </div>
                            </div>
                            {locacionExpandida === locacion.locacion && locacion.reparaciones.length > 0 && (
                                <div className="ps-4 py-2 bg-light">
                                    {locacion.reparaciones.map(rep => {
                                        const fecha = new Date(rep.data.FeFinRep || rep.data.FeConRep || rep.data.FechaCreacion);
                                        const usuario = usuarios[rep.data.UsuarioRep];
                                        return (
                                            <div 
                                                key={rep.id} 
                                                className="d-flex justify-content-between py-1 border-bottom"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/inicio/reparaciones/${rep.id}`);
                                                }} 
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div>
                                                    <small><strong>{rep.data.NombreUsu}{rep.data.ApellidoUsu ? ` ${rep.data.ApellidoUsu}` : ''}</strong></small>
                                                    <br />
                                                    <small className="text-muted">Reparación #{rep.id.substring(0, 6)}</small>
                                                    <br />
                                                    <small className="text-muted">{rep.data.ModeloDroneNameRep}</small>
                                                    <br />
                                                    <small className="text-muted">{fecha.toLocaleDateString('es-ES')}</small>
                                                    {usuario?.data?.ProvinciaUsu && (
                                                        <>
                                                            <br />
                                                            <small className="text-muted">Provincia: {usuario.data.ProvinciaUsu}</small>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="text-end">
                                                    <span className={`badge ${
                                                        rep.data.EstadoRep === 'Finalizado' || 
                                                        rep.data.EstadoRep === 'Entregado' || 
                                                        rep.data.EstadoRep === 'Cobrado' 
                                                            ? 'bg-success' 
                                                            : 'bg-warning'
                                                    }`}>
                                                        {rep.data.EstadoRep}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
