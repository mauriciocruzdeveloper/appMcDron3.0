/**
 * Componente para migrar estados de "Entregado" a "Finalizado"
 * Se integra con el sistema de gestión de estados legacy
 */

import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { guardarReparacionAsync } from '../redux-tool-kit/reparacion/reparacion.actions';
import { obtenerEstadoSeguro } from '../utils/estadosHelper';
import { estados } from '../datos/estados';

interface ReparacionEntregada {
    id: string;
    cliente: string;
    modelo: string;
    fechaCreacion: string;
    estadoActual: string;
}

interface ResultadoMigracion {
    exitosas: number;
    fallidas: number;
    errores: string[];
    procesando: boolean;
}

export const MigradorEntregadoFinalizado: React.FC = () => {
    const dispatch = useAppDispatch();
    const reparaciones = useAppSelector(state => state.reparacion.coleccionReparaciones);
    
    const [reparacionesEntregadas, setReparacionesEntregadas] = useState<ReparacionEntregada[]>([]);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [resultado, setResultado] = useState<ResultadoMigracion>({
        exitosas: 0,
        fallidas: 0,
        errores: [],
        procesando: false
    });

    // Cargar reparaciones con estado "Entregado"
    useEffect(() => {
        if (reparaciones) {
            const entregadas = Object.entries(reparaciones)
                .filter(([, reparacion]) => {
                    const estadoActual = obtenerEstadoSeguro(reparacion.data?.EstadoRep);
                    return estadoActual?.nombre === 'Entregado';
                })
                .map(([id, reparacion]) => ({
                    id,
                    cliente: reparacion.data?.NombreUsu || 'Sin nombre',
                    modelo: reparacion.data?.ModeloDroneNameRep || 'Sin modelo',
                    fechaCreacion: reparacion.data?.FeConRep 
                        ? new Date(reparacion.data.FeConRep).toLocaleDateString()
                        : 'Sin fecha',
                    estadoActual: reparacion.data?.EstadoRep || 'Sin estado'
                }));
            
            setReparacionesEntregadas(entregadas);
        }
    }, [reparaciones]);

    const ejecutarMigracion = async () => {
        if (!reparaciones) {
            alert('No se han cargado las reparaciones');
            return;
        }

        setResultado(prev => ({ ...prev, procesando: true, errores: [], exitosas: 0, fallidas: 0 }));

        const estadoFinalizado = Object.values(estados).find(estado => estado.nombre === 'Finalizado');
        
        if (!estadoFinalizado) {
            setResultado(prev => ({
                ...prev,
                procesando: false,
                errores: ['Estado "Finalizado" no encontrado en la configuración']
            }));
            return;
        }

        let exitosas = 0;
        let fallidas = 0;
        const errores: string[] = [];

        for (const reparacionEntregada of reparacionesEntregadas) {
            try {
                const reparacion = reparaciones[reparacionEntregada.id];
                
                if (!reparacion) {
                    throw new Error(`Reparación ${reparacionEntregada.id} no encontrada`);
                }

                const reparacionActualizada = {
                    ...reparacion,
                    data: {
                        ...reparacion.data,
                        EstadoRep: 'Finalizado',
                        MigracionTimestamp: Date.now(),
                        EstadoAnteriorMigracion: 'Entregado',
                        MigradoPorScript: true
                    }
                };

                await dispatch(guardarReparacionAsync(reparacionActualizada)).unwrap();
                
                exitosas++;
                console.log(`✅ Reparación ${reparacionEntregada.id} migrada exitosamente`);

            } catch (error) {
                fallidas++;
                const errorMsg = `Error en reparación ${reparacionEntregada.id}: ${
                    error instanceof Error ? error.message : 'Error desconocido'
                }`;
                errores.push(errorMsg);
                console.error(`❌ ${errorMsg}`);
            }

            await new Promise(resolve => setTimeout(resolve, 100));
        }

        setResultado({ exitosas, fallidas, errores, procesando: false });
        setMostrarConfirmacion(false);
    };

    const resetearMigracion = () => {
        setMostrarConfirmacion(false);
        setResultado({ exitosas: 0, fallidas: 0, errores: [], procesando: false });
    };

    return (
        <div className="card mt-3">
            <div className="card-header">
                <h5 className="mb-0">🔄 Migrador: Entregado → Finalizado</h5>
            </div>

            <div className="card-body">
                <div className="alert alert-info">
                    <strong>Función:</strong> Este migrador cambia todas las reparaciones con estado 
                    Entregado al nuevo estado Finalizado del workflow actualizado.
                </div>

                {/* Estadísticas */}
                <div className="mb-3">
                    <h6>📊 Reparaciones encontradas:</h6>
                    <span className="badge bg-primary me-2">
                        Total con estado Entregado: {reparacionesEntregadas.length}
                    </span>
                    {resultado.exitosas > 0 && (
                        <span className="badge bg-success me-2">
                            Migradas: {resultado.exitosas}
                        </span>
                    )}
                    {resultado.fallidas > 0 && (
                        <span className="badge bg-danger">
                            Con errores: {resultado.fallidas}
                        </span>
                    )}
                </div>

                {/* Lista de reparaciones a migrar */}
                {reparacionesEntregadas.length > 0 && (
                    <div className="mb-3">
                        <h6>📋 Reparaciones que serán migradas:</h6>
                        <table className="table table-striped table-bordered table-hover table-sm">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Cliente</th>
                                    <th>Modelo</th>
                                    <th>Fecha</th>
                                    <th>Estado Actual</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reparacionesEntregadas.slice(0, 10).map(rep => (
                                    <tr key={rep.id}>
                                        <td>{rep.id}</td>
                                        <td>{rep.cliente}</td>
                                        <td>{rep.modelo}</td>
                                        <td>{rep.fechaCreacion}</td>
                                        <td>
                                            <span className="badge bg-warning text-dark">
                                                {rep.estadoActual}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {reparacionesEntregadas.length > 10 && (
                                    <tr>
                                        <td colSpan={5} className="text-center text-muted">
                                            ... y {reparacionesEntregadas.length - 10} más
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Errores */}
                {resultado.errores.length > 0 && (
                    <div className="alert alert-danger">
                        <strong>❌ Errores encontrados:</strong>
                        <ul className="mb-0 mt-2">
                            {resultado.errores.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Confirmación */}
                {mostrarConfirmacion && (
                    <div className="alert alert-warning">
                        <strong>⚠️ Confirmación requerida</strong>
                        <p className="mb-2">
                            Está a punto de migrar <strong>{reparacionesEntregadas.length}</strong> reparaciones 
                            del estado Entregado a Finalizado.
                        </p>
                        <p className="mb-3">
                            <strong>Esta acción no se puede deshacer fácilmente.</strong>
                        </p>
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-success"
                                onClick={ejecutarMigracion}
                                disabled={resultado.procesando}
                                type="button"
                            >
                                {resultado.procesando ? (
                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                            role="status"
                                            aria-hidden="true"
                                        />
                                        Migrando...
                                    </>
                                ) : (
                                    '✅ Confirmar Migración'
                                )}
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setMostrarConfirmacion(false)}
                                disabled={resultado.procesando}
                                type="button"
                            >
                                ❌ Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {/* Resultado exitoso */}
                {!mostrarConfirmacion && !resultado.procesando && resultado.exitosas > 0 && (
                    <div className="alert alert-success">
                        <strong>🎉 Migración completada!</strong>
                        <p className="mb-2">
                            Se migraron exitosamente <strong>{resultado.exitosas}</strong> reparaciones.
                        </p>
                        {resultado.fallidas > 0 && (
                            <p className="mb-0 text-warning">
                                <strong>{resultado.fallidas}</strong> reparaciones tuvieron errores.
                            </p>
                        )}
                    </div>
                )}

                {/* Botones de acción */}
                <div className="d-flex gap-2">
                    {reparacionesEntregadas.length > 0 && !mostrarConfirmacion && !resultado.procesando && (
                        <button
                            className="btn btn-primary"
                            onClick={() => setMostrarConfirmacion(true)}
                            type="button"
                        >
                            🚀 Iniciar Migración
                        </button>
                    )}
                    
                    {(resultado.exitosas > 0 || resultado.fallidas > 0) && (
                        <button
                            className="btn btn-outline-secondary"
                            onClick={resetearMigracion}
                            type="button"
                        >
                            🔄 Resetear
                        </button>
                    )}
                </div>

                {reparacionesEntregadas.length === 0 && (
                    <div className="alert alert-success">
                        <strong>✅ No hay reparaciones para migrar</strong>
                        <p className="mb-0">
                            No se encontraron reparaciones con estado Entregado.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MigradorEntregadoFinalizado;
