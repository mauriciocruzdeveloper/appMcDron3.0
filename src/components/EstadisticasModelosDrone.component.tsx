import React, { useMemo, useState } from 'react';
import {
    BarChart,
    BoxSeam,
    Calendar3,
    ExclamationTriangle,
    Layers,
} from 'react-bootstrap-icons';
import { Bar } from 'react-chartjs-2';
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Title,
    Tooltip,
} from 'chart.js';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { selectRankingModelosDrone } from '../redux-tool-kit/reparacion/reparacion.selectors';
import {
    planificarCajasModelosDrone,
    PropuestaCajaModeloDrone,
    VIDA_MEDIA_REPARACION_DIAS,
} from '../usecases/estadisticasModelosDrone';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const FORMATO_PUNTAJE = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const obtenerEtiquetaCaja = (caja: PropuestaCajaModeloDrone): string => {
    if (caja.tipo === 'exclusiva') return 'Modelo exclusivo';
    return 'Modelos agrupados';
};

const obtenerClaseCaja = (caja: PropuestaCajaModeloDrone): string => {
    if (caja.tipo === 'exclusiva') return 'bg-primary';
    return 'bg-warning text-dark';
};

export default function EstadisticasModelosDrone(): JSX.Element {
    const ranking = useAppSelector(selectRankingModelosDrone);
    const [cantidadCajasInput, setCantidadCajasInput] = useState('25');
    const cantidadCajas = Number(cantidadCajasInput);
    const cantidadCajasValida = /^\d+$/.test(cantidadCajasInput)
        && Number.isInteger(cantidadCajas)
        && cantidadCajas >= 1;
    const propuestaCajas = useMemo(() => (
        cantidadCajasValida
            ? planificarCajasModelosDrone(ranking.modelos, cantidadCajas)
            : []
    ), [cantidadCajas, cantidadCajasValida, ranking.modelos]);

    const totalReparaciones = ranking.modelos.reduce(
        (total, modelo) => total + modelo.cantidadReparaciones,
        0,
    );
    const puntajeTotal = ranking.modelos.reduce(
        (total, modelo) => total + modelo.puntaje,
        0,
    );
    const cajasExclusivas = propuestaCajas.filter(
        caja => caja.tipo === 'exclusiva',
    ).length;
    const modelosGrafico = ranking.modelos.slice(0, 12);
    const chartData = {
        labels: modelosGrafico.map(modelo => `${modelo.fabricante} ${modelo.nombreModelo}`),
        datasets: [{
            label: 'Demanda ponderada',
            data: modelosGrafico.map(modelo => modelo.puntaje),
            backgroundColor: 'rgba(13, 110, 253, 0.72)',
            borderColor: 'rgb(13, 110, 253)',
            borderWidth: 1,
        }],
    };
    const chartOptions = {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: 'Modelos con mayor demanda reciente',
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Puntaje ponderado',
                },
            },
        },
    };

    return (
        <main className="container-fluid px-3 px-md-4 py-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-2 mb-4">
                <div>
                    <h2 className="mb-1">Estadísticas por modelo de drone</h2>
                    <p className="text-muted mb-0">
                        Prioridad de repuestos según reparaciones completadas y su antigüedad.
                    </p>
                </div>
                <span className="badge bg-light text-dark border align-self-start align-self-md-auto">
                    <Calendar3 className="me-2" />
                    Vida media: {VIDA_MEDIA_REPARACION_DIAS} días
                </span>
            </div>

            {ranking.reparacionesOmitidas > 0 && (
                <div className="alert alert-warning d-flex align-items-start" role="alert">
                    <ExclamationTriangle className="flex-shrink-0 mt-1 me-2" />
                    <div>
                        {ranking.reparacionesOmitidas} reparación
                        {ranking.reparacionesOmitidas !== 1 ? 'es completadas quedaron' : ' completada quedó'} fuera
                        del cálculo porque no se pudo resolver su drone y modelo de catálogo.
                    </div>
                </div>
            )}

            {ranking.modelos.length === 0 ? (
                <div className="border rounded p-5 text-center bg-light">
                    <BarChart size={36} className="text-muted mb-3" />
                    <h5>No hay reparaciones completadas para analizar</h5>
                    <p className="text-muted mb-0">
                        El ranking aparecerá cuando existan reparaciones con fecha de finalización y modelo asociado.
                    </p>
                </div>
            ) : (
                <>
                    <section className="row g-3 mb-4" aria-label="Resumen de demanda">
                        <div className="col-6 col-lg-3">
                            <div className="card h-100 border-0 bg-primary text-white">
                                <div className="card-body">
                                    <small>Modelos activos</small>
                                    <div className="fs-3 fw-bold">{ranking.modelos.length}</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-6 col-lg-3">
                            <div className="card h-100 border-0 bg-success text-white">
                                <div className="card-body">
                                    <small>Reparaciones</small>
                                    <div className="fs-3 fw-bold">{totalReparaciones}</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-6 col-lg-3">
                            <div className="card h-100 border-0 bg-dark text-white">
                                <div className="card-body">
                                    <small>Demanda ponderada</small>
                                    <div className="fs-3 fw-bold">{FORMATO_PUNTAJE.format(puntajeTotal)}</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-6 col-lg-3">
                            <div className="card h-100 border-0 bg-info text-dark">
                                <div className="card-body">
                                    <small>Cajas asignadas</small>
                                    <div className="fs-3 fw-bold">{propuestaCajas.length}</div>
                                    <div className="small">{cajasExclusivas} de modelo exclusivo</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="card mb-4">
                        <div className="card-header d-flex align-items-center">
                            <BarChart className="me-2" />
                            <h5 className="mb-0">Ranking de demanda</h5>
                        </div>
                        <div className="card-body" style={{ height: `${Math.max(320, modelosGrafico.length * 42)}px` }}>
                            <Bar data={chartData} options={chartOptions} />
                        </div>
                    </section>

                    <section className="card mb-4">
                        <div className="card-header">
                            <h5 className="mb-0">Detalle por modelo</h5>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Modelo</th>
                                        <th scope="col">Familia sugerida</th>
                                        <th scope="col" className="text-end">Reparaciones</th>
                                        <th scope="col" className="text-end">Última reparación</th>
                                        <th scope="col" className="text-end">Puntaje</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ranking.modelos.map((modelo, indice) => (
                                        <tr key={modelo.modeloId}>
                                            <td className="fw-bold text-muted">{indice + 1}</td>
                                            <td>
                                                <strong>{modelo.nombreModelo}</strong>
                                                <div className="small text-muted">{modelo.fabricante}</div>
                                            </td>
                                            <td>{modelo.familia}</td>
                                            <td className="text-end">{modelo.cantidadReparaciones}</td>
                                            <td className="text-end text-nowrap">
                                                {new Date(modelo.fechaUltimaReparacion).toLocaleDateString('es-AR')}
                                            </td>
                                            <td className="text-end fw-bold">
                                                {FORMATO_PUNTAJE.format(modelo.puntaje)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section aria-labelledby="titulo-plan-cajas">
                        <div className="card mb-3">
                            <div className="card-body">
                                <div className="row align-items-end g-3">
                                    <div className="col-12 col-md-5 col-lg-4">
                                        <label htmlFor="cantidad-cajas" className="form-label fw-bold">
                                            Cantidad de cajas disponibles
                                        </label>
                                        <input
                                            id="cantidad-cajas"
                                            type="number"
                                            inputMode="numeric"
                                            min="1"
                                            step="1"
                                            className={`form-control ${cantidadCajasValida ? '' : 'is-invalid'}`}
                                            value={cantidadCajasInput}
                                            onChange={event => setCantidadCajasInput(event.target.value)}
                                        />
                                        {!cantidadCajasValida && (
                                            <div className="invalid-feedback">
                                                Ingresá un número entero mayor o igual a uno.
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-12 col-md-7 col-lg-8">
                                        <div className="alert alert-light border mb-0 py-2">
                                            Una reparación de hoy aporta 1 punto; cada {VIDA_MEDIA_REPARACION_DIAS} días,
                                            su peso se reduce a la mitad. Se usan todas las cajas y solo se agrupan modelos
                                            cuando no alcanza una caja por modelo, respetando serie y generación.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex align-items-center mb-3">
                            <BoxSeam size={22} className="me-2 text-primary" />
                            <h4 id="titulo-plan-cajas" className="mb-0">Propuesta de organización</h4>
                        </div>

                        {cantidadCajasValida && (
                            <div className="row g-3">
                                {propuestaCajas.map(caja => (
                                    <div className="col-12 col-md-6 col-xl-4" key={caja.numero}>
                                        <article className="card h-100">
                                            <div className="card-header d-flex justify-content-between align-items-center">
                                                <strong>Caja {caja.numero}</strong>
                                                <span className={`badge ${obtenerClaseCaja(caja)}`}>
                                                    {obtenerEtiquetaCaja(caja)}
                                                </span>
                                            </div>
                                            <div className="card-body">
                                                {caja.familias.map(familia => (
                                                    <div className="small text-muted mb-1" key={familia}>
                                                        <Layers className="me-1" /> {familia}
                                                    </div>
                                                ))}
                                                <ul className="mb-3 ps-3">
                                                    {caja.modelos.map(modelo => (
                                                        <li key={modelo.modeloId}>
                                                            {modelo.fabricante} {modelo.nombreModelo}
                                                        </li>
                                                    ))}
                                                </ul>
                                                <div className="d-flex justify-content-between border-top pt-2 small">
                                                    <span>{caja.cantidadReparaciones} reparaciones</span>
                                                    <strong>{FORMATO_PUNTAJE.format(caja.puntaje)} puntos</strong>
                                                </div>
                                            </div>
                                        </article>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}
        </main>
    );
}