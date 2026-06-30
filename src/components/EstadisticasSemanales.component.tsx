import React, { useMemo, useState } from 'react';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { selectReparacionesArray } from '../redux-tool-kit/reparacion/reparacion.selectors';
// Íconos Bootstrap Icons usando CSS
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
import { ComboBox } from './common';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/**
 * Devuelve el número de semana ISO (lunes = inicio) y el año ISO de una fecha.
 */
function getISOWeek(date: Date): { week: number; isoYear: number } {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7; // domingo = 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return { week, isoYear: d.getUTCFullYear() };
}

/**
 * Devuelve la fecha del lunes de la semana ISO dada.
 */
function getMonday(isoYear: number, isoWeek: number): Date {
    const simple = new Date(isoYear, 0, 1 + (isoWeek - 1) * 7);
    const dow = simple.getDay();
    const monday = new Date(simple);
    monday.setDate(simple.getDate() - (dow <= 4 ? dow - 1 : dow - 8));
    return monday;
}

interface SemanaData {
    weekKey: string; // "YYYY-WNN"
    isoYear: number;
    week: number;
    lunes: Date;
    domingo: Date;
    cantidad: number;
    reparaciones: any[];
}

export default function EstadisticasSemanales(): JSX.Element {
    const [filtroAno, setFiltroAno] = useState<number>(new Date().getFullYear());
    const [semanaExpandida, setSemanaExpandida] = useState<string | null>(null);
    const reparaciones = useAppSelector(selectReparacionesArray);
    const navigate = useNavigate();

    // Años disponibles según FeRecRep o FeConRep como fallback
    const anosDisponibles = useMemo(() => {
        const anos = new Set<number>();
        reparaciones.forEach(rep => {
            const fecha = rep.data.FeRecRep ?? rep.data.FeConRep;
            if (!fecha) return;
            anos.add(new Date(fecha).getFullYear());
        });
        return Array.from(anos).sort((a, b) => b - a);
    }, [reparaciones]);

    // Reparaciones del año seleccionado (con fecha de recibo o contacto)
    const reparacionesDelAno = useMemo(() =>
        reparaciones.filter(rep => {
            const fecha = rep.data.FeRecRep ?? rep.data.FeConRep;
            if (!fecha) return false;
            return new Date(fecha).getFullYear() === filtroAno;
        }),
        [reparaciones, filtroAno]
    );

    // Agrupar por semana ISO
    const semanasPorClave = useMemo(() => {
        const map = new Map<string, SemanaData>();

        reparacionesDelAno.forEach(rep => {
            const fecha = new Date((rep.data.FeRecRep ?? rep.data.FeConRep)!);
            const { week, isoYear } = getISOWeek(fecha);
            const weekKey = `${isoYear}-W${String(week).padStart(2, '0')}`;

            if (!map.has(weekKey)) {
                const lunes = getMonday(isoYear, week);
                const domingo = new Date(lunes);
                domingo.setDate(lunes.getDate() + 6);
                map.set(weekKey, { weekKey, isoYear, week, lunes, domingo, cantidad: 0, reparaciones: [] });
            }
            const entry = map.get(weekKey)!;
            entry.cantidad++;
            entry.reparaciones.push(rep);
        });

        return map;
    }, [reparacionesDelAno]);

    // Ordenar semanas cronológicamente
    const semanas: SemanaData[] = useMemo(() =>
        Array.from(semanasPorClave.values()).sort((a, b) => a.weekKey.localeCompare(b.weekKey)),
        [semanasPorClave]
    );

    const totalDrones = reparacionesDelAno.length;
    const promedioSemanal = semanas.length > 0 ? (totalDrones / semanas.length).toFixed(1) : '0';

    const formatFecha = (d: Date) =>
        d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });

    const formatFechaConAnio = (d: Date) =>
        d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const formatFechaLarga = (ts: number) =>
        new Date(ts).toLocaleDateString('es-ES');

    // Datos para el gráfico de barras
    const chartData = {
        labels: semanas.map(s => s.weekKey),
        datasets: [
            {
                label: 'Drones recibidos',
                data: semanas.map(s => s.cantidad),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    // Mapa weekKey -> rango de fechas para el tooltip del gráfico
    const weekKeyToRange = useMemo(() => {
        const map: Record<string, string> = {};
        semanas.forEach(s => {
            map[s.weekKey] = `${formatFechaConAnio(s.lunes)} – ${formatFechaConAnio(s.domingo)}`;
        });
        return map;
    }, [semanas]);

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' as const },
            title: {
                display: true,
                text: `Drones recibidos por semana — ${filtroAno}`,
            },
            tooltip: {
                callbacks: {
                    title: (items: any[]) => {
                        const key = items[0]?.label as string;
                        return weekKeyToRange[key] ?? key;
                    },
                    label: (item: any) =>
                        ` ${item.raw} drone${item.raw !== 1 ? 's' : ''} recibido${item.raw !== 1 ? 's' : ''}`,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 1 },
            },
        },
    };

    return (
        <div className='p-4'>
            <h2 className="mb-4">Estadísticas de Recepción Semanal</h2>

            {/* Filtro de año */}
            <div className='card mb-3'>
                <div className='card-body'>
                    <div className='form-group'>
                        <label>Año:</label>
                        <ComboBox
                            options={anosDisponibles.map(year => ({ value: String(year), label: String(year) }))}
                            value={String(filtroAno)}
                            onChange={(option) => {
                                setFiltroAno(Number(option?.value));
                                setSemanaExpandida(null);
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Tarjetas resumen */}
            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="card bg-primary text-white">
                        <div className="card-body text-center">
                            <h5>Total {filtroAno}</h5>
                            <h3>{totalDrones}</h3>
                            <small>drones recibidos</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card bg-info text-white">
                        <div className="card-body text-center">
                            <h5>Promedio Semanal</h5>
                            <h3>{promedioSemanal}</h3>
                            <small>drones / semana</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card bg-secondary text-white">
                        <div className="card-body text-center">
                            <h5>Semanas con ingresos</h5>
                            <h3>{semanas.length}</h3>
                            <small>semanas</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gráfico */}
            {semanas.length > 0 && (
                <div className="card mb-4">
                    <div className="card-header">
                        <h5>Drones por semana — {filtroAno}</h5>
                    </div>
                    <div className="card-body">
                        <Bar options={chartOptions} data={chartData} />
                    </div>
                </div>
            )}

            {/* Listado de semanas */}
            <div className="card">
                <div className="card-header">
                    <h5>Detalle por semana — {filtroAno}</h5>
                </div>
                <div className="card-body">
                    {semanas.length === 0 && (
                        <p className="text-muted text-center">No hay drones recibidos con fecha de recibo en {filtroAno}.</p>
                    )}
                    {semanas.map(semana => (
                        <div key={semana.weekKey}>
                            <div
                                className="d-flex justify-content-between align-items-center border-bottom py-2"
                                onClick={() => setSemanaExpandida(semanaExpandida === semana.weekKey ? null : semana.weekKey)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="d-flex align-items-center">
                                    {semanaExpandida === semana.weekKey ? <i className="bi bi-chevron-up" style={{ fontSize: 16 }}></i> : <i className="bi bi-chevron-down" style={{ fontSize: 16 }}></i>}
                                    <span className="mc-tooltip-wrapper">
                                        <strong className="ms-2" style={{ textDecoration: 'underline dotted', cursor: 'help' }}>
                                            Semana {semana.week}
                                        </strong>
                                        <span className="mc-tooltip-content">
                                            {formatFechaConAnio(semana.lunes)} – {formatFechaConAnio(semana.domingo)}
                                        </span>
                                    </span>
                                    <small className="text-muted ms-2">
                                        {formatFecha(semana.lunes)} – {formatFecha(semana.domingo)}
                                    </small>
                                </div>
                                <span className="badge bg-primary">
                                    {semana.cantidad} drone{semana.cantidad !== 1 ? 's' : ''}
                                </span>
                            </div>
                            {semanaExpandida === semana.weekKey && (
                                <div className="ps-4 py-2 bg-light">
                                    {semana.reparaciones.map(rep => (
                                        <div
                                            key={rep.id}
                                            className="d-flex justify-content-between py-1 border-bottom"
                                            onClick={() => navigate(`/inicio/reparaciones/${rep.id}`)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div>
                                                <small>
                                                    <strong>
                                                        {rep.data.NombreUsu}
                                                        {rep.data.ApellidoUsu ? ` ${rep.data.ApellidoUsu}` : ''}
                                                    </strong>
                                                </small>
                                                <br />
                                                <small className="text-muted">Reparación #{rep.id.substring(0, 6)}</small>
                                                <br />
                                                <small className="text-muted">{rep.data.ModeloDroneNameRep}</small>
                                            </div>
                                            <div className="text-end">
                                                <small className="text-muted">
                                                    {formatFechaLarga((rep.data.FeRecRep ?? rep.data.FeConRep)!)}
                                                    {!rep.data.FeRecRep && <span className="text-warning ms-1">(consulta)</span>}
                                                </small>
                                                <br />
                                                <span className={`badge ${
                                                    rep.data.EstadoRep === 'Finalizado' || rep.data.EstadoRep === 'Cobrado'
                                                        ? 'bg-success'
                                                        : rep.data.EstadoRep === 'Enviado'
                                                        ? 'bg-info'
                                                        : 'bg-secondary'
                                                }`}>
                                                    {rep.data.EstadoRep}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
