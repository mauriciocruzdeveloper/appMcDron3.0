import React, { useState } from 'react';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { selectReparacionesArray } from '../redux-tool-kit/reparacion/reparacion.selectors';
import { ChevronDown, ChevronUp } from 'react-bootstrap-icons';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { useNavigate } from 'react-router-dom';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function Estadisticas(): JSX.Element {
    const [filtroAno, setFiltroAno] = useState<number>(new Date().getFullYear());
    const [mesExpandido, setMesExpandido] = useState<number | null>(null);
    const reparaciones = useAppSelector(selectReparacionesArray);
    const navigate = useNavigate();

    // Filtrar reparaciones completadas del año seleccionado
    const reparacionesCompletadas = reparaciones.filter(rep => {
        const fecha = new Date(rep.data.FeFinRep || rep.data.FeConRep);
        const tieneIngresos = rep.data.PresuDiRep > 0 || rep.data.PresuFiRep > 0;
        return tieneIngresos && fecha.getFullYear() === filtroAno;
    });

    // Calcular estadísticas por mes
    const estadisticasPorMes = Array.from({ length: 12 }, (_, i) => {
        const mes = i + 1;
        const reparacionesDelMes = reparacionesCompletadas.filter(rep => {
            const fecha = new Date(rep.data.FeFinRep || rep.data.FeConRep);
            return fecha.getMonth() + 1 === mes;
        });
        
        const ingresos = reparacionesDelMes.reduce((total, rep) => {
            // Si tiene PresuDiRep, ese es el monto. Si no, PresuFiRep.
            if (rep.data.PresuDiRep > 0) {
                return total + rep.data.PresuDiRep;
            } else if (rep.data.PresuFiRep > 0) {
                return total + rep.data.PresuFiRep;
            }
            return total;
        }, 0);
        
        return {
            mes,
            nombreMes: new Date(2024, i, 1).toLocaleDateString('es-ES', { month: 'long' }),
            cantidad: reparacionesDelMes.length,
            ingresos,
            reparaciones: reparacionesDelMes
        };
    });

    const totalAnual = estadisticasPorMes.reduce((total, mes) => total + mes.ingresos, 0);
    const totalReparaciones = estadisticasPorMes.reduce((total, mes) => total + mes.cantidad, 0);

    const formatPrice = (precio: number): string => {
        return precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
    };

    // Calcular estadísticas por año para el gráfico
    const estadisticasPorAno = reparaciones.reduce((acc, rep) => {
        const fecha = new Date(rep.data.FeFinRep || rep.data.FeConRep || rep.data.FechaCreacion);
        const ano = fecha.getFullYear();
        if (!acc[ano]) {
            acc[ano] = 0;
        }
        acc[ano]++;
        return acc;
    }, {} as Record<number, number>);

    const chartData = {
        labels: Object.keys(estadisticasPorAno),
        datasets: [
            {
                label: 'Cantidad de Reparaciones',
                data: Object.values(estadisticasPorAno),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Reparaciones por Año',
            },
        },
    };

    return (
        <div className='p-4'>
            <h2 className="mb-4">Estadísticas de Ingresos</h2>
            
            <div className='card mb-3'>
                <div className='card-body'>
                    <div className='form-group'>
                        <label>Año:</label>
                        <select
                            className='form-select'
                            value={filtroAno}
                            onChange={(e) => setFiltroAno(Number(e.target.value))}
                        >
                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-md-6">
                    <div className="card bg-success text-white">
                        <div className="card-body text-center">
                            <h5>Total Anual {filtroAno}</h5>
                            <h3>{formatPrice(totalAnual)}</h3>
                            <small>{totalReparaciones} reparaciones</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card bg-info text-white">
                        <div className="card-body text-center">
                            <h5>Promedio Mensual</h5>
                            <h3>{formatPrice(totalAnual / 12)}</h3>
                            <small>{(totalReparaciones / 12).toFixed(1)} reparaciones/mes</small>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card mb-4">
                <div className="card-header">
                    <h5>Reparaciones por Año</h5>
                </div>
                <div className="card-body">
                    <Bar options={chartOptions} data={chartData} />
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h5>Ingresos por Mes - {filtroAno}</h5>
                </div>
                <div className="card-body">
                    {estadisticasPorMes.map(mes => (
                        <div key={mes.mes}>
                            <div 
                                className="d-flex justify-content-between align-items-center border-bottom py-2 cursor-pointer"
                                onClick={() => setMesExpandido(mesExpandido === mes.mes ? null : mes.mes)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="d-flex align-items-center">
                                    {mesExpandido === mes.mes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    <strong className="ms-2">{mes.nombreMes}</strong>
                                    <small className="text-muted ms-2">({mes.cantidad} reparaciones)</small>
                                </div>
                                <div className="text-end">
                                    <span className={`badge ${mes.ingresos > 0 ? 'bg-success' : 'bg-secondary'}`}>
                                        {formatPrice(mes.ingresos)}
                                    </span>
                                </div>
                            </div>
                            {mesExpandido === mes.mes && mes.reparaciones.length > 0 && (
                                <div className="ps-4 py-2 bg-light">
                                    {mes.reparaciones.map(rep => {
                                        const ingreso = rep.data.PresuDiRep > 0 ? rep.data.PresuDiRep : (rep.data.PresuFiRep || 0);
                                        const fecha = new Date(rep.data.FeFinRep || rep.data.FeConRep || rep.data.FechaCreacion);
                                        return (
                                            <div key={rep.id} className="d-flex justify-content-between py-1 border-bottom"
                                                 onClick={() => navigate(`inicio/reparaciones/${rep.id}`)} style={{ cursor: 'pointer' }}>
                                                <div>
                                                    <small><strong>{rep.data.NombreUsu} {rep.data.ApellidoUsu}</strong></small>
                                                    <br />
                                                    <small className="text-muted">Reparación #{rep.id.substring(0, 6)}</small>
                                                    <br />
                                                    <small className="text-muted">{rep.data.ModeloDroneNameRep}</small>
                                                    <br />
                                                    <small className="text-muted">{fecha.toLocaleDateString('es-ES')}</small>
                                                </div>
                                                <div className="text-end">
                                                    <small className="text-success">{formatPrice(ingreso)}</small>
                                                    {rep.data.PresuDiRep > 0 && <br />}
                                                    {rep.data.PresuDiRep > 0 && <small className="text-muted">Diagnóstico</small>}
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
