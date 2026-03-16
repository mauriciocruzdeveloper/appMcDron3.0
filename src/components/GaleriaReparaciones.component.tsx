import React, { useState } from 'react';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { selectReparacionesArray } from '../redux-tool-kit/reparacion/reparacion.selectors';
import { useNavigate } from 'react-router-dom';
import { ImageGallery } from './ImageGallery';
import { ChevronDown, ChevronUp, ImageFill } from 'react-bootstrap-icons';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { guardarReparacionAsync } from '../redux-tool-kit/reparacion/reparacion.actions';
import { ReparacionType } from '../types/reparacion';
import { useModal } from './Modal/useModal';

export default function GaleriaReparaciones(): JSX.Element {
    const [reparacionExpandida, setReparacionExpandida] = useState<string | null>(null);
    const [filtroEstado, setFiltroEstado] = useState<string>('todas');
    const [filtroFotos, setFiltroFotos] = useState<'todas' | 'sin-seleccion' | 'con-seleccion'>('todas');
    const reparaciones = useAppSelector(selectReparacionesArray);
    const isAdmin = useAppSelector(state => state.app.usuario?.data.Role === 'admin') ?? false;
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { openModal } = useModal();

    // Filtrar reparaciones que tengan al menos una foto
    const reparacionesConFotos = reparaciones.filter(rep => 
        rep.data.urlsFotos && rep.data.urlsFotos.length > 0
    );

    // Aplicar filtro por estado
    let reparacionesFiltradas = filtroEstado === 'todas' 
        ? reparacionesConFotos 
        : reparacionesConFotos.filter(rep => rep.data.EstadoRep === filtroEstado);

    // Aplicar filtro por fotos ANTES/DESPUÉS
    if (filtroFotos === 'sin-seleccion') {
        reparacionesFiltradas = reparacionesFiltradas.filter(rep => 
            !rep.data.FotoAntes && !rep.data.FotoDespues
        );
    } else if (filtroFotos === 'con-seleccion') {
        reparacionesFiltradas = reparacionesFiltradas.filter(rep => 
            rep.data.FotoAntes || rep.data.FotoDespues
        );
    }

    // Ordenar por fecha de consulta (más reciente primero)
    const reparacionesOrdenadas = [...reparacionesFiltradas].sort((a, b) => {
        const fechaA = a.data.FeConRep || 0;
        const fechaB = b.data.FeConRep || 0;
        return fechaB - fechaA;
    });

    // Calcular estadísticas
    const totalFotos = reparacionesConFotos.reduce(
        (total, rep) => total + (rep.data.urlsFotos?.length || 0), 
        0
    );

    // Obtener estados únicos de las reparaciones con fotos
    const estadosDisponibles = Array.from(
        new Set(reparacionesConFotos.map(rep => rep.data.EstadoRep))
    ).sort();

    const formatFecha = (timestamp: number): string => {
        if (!timestamp) return 'Sin fecha';
        return new Date(timestamp).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleToggleReparacion = (reparacionId: string) => {
        setReparacionExpandida(reparacionExpandida === reparacionId ? null : reparacionId);
    };

    const handleVerReparacion = (reparacionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/inicio/reparaciones/${reparacionId}`);
    };

    const handleSelectFotoAntes = async (reparacion: ReparacionType, url: string) => {
        if (!isAdmin) return;
        
        const nuevaReparacion = {
            ...reparacion,
            data: {
                ...reparacion.data,
                FotoAntes: reparacion.data.FotoAntes === url ? undefined : url
            }
        };

        console.log('📸 [Galería] Seleccionando foto ANTES:', {
            reparacionId: reparacion.id,
            url,
            'FotoAntes anterior': reparacion.data.FotoAntes,
            'FotoAntes nueva': nuevaReparacion.data.FotoAntes,
            'acción': reparacion.data.FotoAntes === url ? 'DESELECCIONAR' : 'SELECCIONAR'
        });

        const response = await dispatch(guardarReparacionAsync(nuevaReparacion));
        
        if (response.meta.requestStatus === 'fulfilled') {
            console.log('✅ [Galería] Foto ANTES guardada correctamente');
        } else {
            console.error('❌ [Galería] Error al guardar foto ANTES');
            openModal({
                mensaje: "Error al guardar la selección de foto ANTES.",
                tipo: "danger",
                titulo: "Seleccionar Foto",
            });
        }
    };

    const handleSelectFotoDespues = async (reparacion: ReparacionType, url: string) => {
        if (!isAdmin) return;
        
        const nuevaReparacion = {
            ...reparacion,
            data: {
                ...reparacion.data,
                FotoDespues: reparacion.data.FotoDespues === url ? undefined : url
            }
        };

        console.log('📸 [Galería] Seleccionando foto DESPUÉS:', {
            reparacionId: reparacion.id,
            url,
            'FotoDespues anterior': reparacion.data.FotoDespues,
            'FotoDespues nueva': nuevaReparacion.data.FotoDespues,
            'acción': reparacion.data.FotoDespues === url ? 'DESELECCIONAR' : 'SELECCIONAR'
        });

        const response = await dispatch(guardarReparacionAsync(nuevaReparacion));
        
        if (response.meta.requestStatus === 'fulfilled') {
            console.log('✅ [Galería] Foto DESPUÉS guardada correctamente');
        } else {
            console.error('❌ [Galería] Error al guardar foto DESPUÉS');
            openModal({
                mensaje: "Error al guardar la selección de foto DESPUÉS.",
                tipo: "danger",
                titulo: "Seleccionar Foto",
            });
        }
    };

    return (
        <div className='p-4'>
            <h2 className="mb-4">
                <ImageFill className="me-2" />
                Galería de Reparaciones
            </h2>

            {/* Filtros y Estadísticas */}
            <div className="row mb-4">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-body">
                            <div className="row align-items-center">
                                <div className="col-md-4">
                                    <label className="form-label">Filtrar por Estado:</label>
                                    <select
                                        className="form-select"
                                        value={filtroEstado}
                                        onChange={(e) => setFiltroEstado(e.target.value)}
                                    >
                                        <option value="todas">Todas las reparaciones</option>
                                        {estadosDisponibles.map(estado => (
                                            <option key={estado} value={estado}>{estado}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Fotos Antes/Después:</label>
                                    <select
                                        className="form-select"
                                        value={filtroFotos}
                                        onChange={(e) => setFiltroFotos(e.target.value as 'todas' | 'sin-seleccion' | 'con-seleccion')}
                                    >
                                        <option value="todas">Todas</option>
                                        <option value="sin-seleccion">⚪ Sin fotos seleccionadas</option>
                                        <option value="con-seleccion">✅ Con fotos seleccionadas</option>
                                    </select>
                                </div>
                                <div className="col-md-4 text-end">
                                    <label className="form-label d-block">&nbsp;</label>
                                    <div>
                                        <span className="badge bg-primary me-2">
                                            {reparacionesFiltradas.length} Reparaciones
                                        </span>
                                        <span className="badge bg-info">
                                            {reparacionesFiltradas.reduce(
                                                (total, rep) => total + (rep.data.urlsFotos?.length || 0), 
                                                0
                                            )} Fotos
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card bg-gradient text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <div className="card-body text-center">
                            <h5>Total General</h5>
                            <h3>{reparacionesConFotos.length}</h3>
                            <small>reparaciones con {totalFotos} fotos</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lista de Reparaciones con Fotos */}
            {reparacionesOrdenadas.length === 0 ? (
                <div className="card">
                    <div className="card-body text-center text-muted py-5">
                        <ImageFill size={64} className="mb-3 opacity-50" />
                        <h5>No hay reparaciones con fotos</h5>
                        <p>Las reparaciones con fotos aparecerán aquí</p>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="card-body">
                        {reparacionesOrdenadas.map((reparacion) => {
                            const numFotos = reparacion.data.urlsFotos?.length || 0;
                            const estaExpandida = reparacionExpandida === reparacion.id;

                            return (
                                <div key={reparacion.id} className="border-bottom mb-3 pb-3">
                                    <div
                                        className="d-flex flex-column flex-md-row justify-content-between align-items-start cursor-pointer"
                                        onClick={() => handleToggleReparacion(reparacion.id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="flex-grow-1 w-100">
                                            <div className="d-flex align-items-center mb-2 flex-wrap">
                                                {estaExpandida ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                <h5 className="ms-2 mb-0">
                                                    Reparación {reparacion.data.IdPublicoRep || `#${reparacion.id.substring(0, 8)}`}
                                                </h5>
                                                <span className="badge bg-secondary ms-2">
                                                    {reparacion.data.EstadoRep}
                                                </span>
                                                <span className="badge bg-info ms-2">
                                                    <ImageFill className="me-1" size={12} />
                                                    {numFotos} {numFotos === 1 ? 'foto' : 'fotos'}
                                                </span>
                                            </div>
                                            <div className="text-muted small">
                                                <div>
                                                    <strong>Cliente:</strong> {reparacion.data.NombreUsu}{reparacion.data.ApellidoUsu ? ` ${reparacion.data.ApellidoUsu}` : ''}
                                                </div>
                                                <div>
                                                    <strong>Drone:</strong> {reparacion.data.ModeloDroneNameRep || 'No especificado'}
                                                </div>
                                                <div>
                                                    <strong>Fecha de consulta:</strong> {formatFecha(reparacion.data.FeConRep || 0)}
                                                </div>
                                                {reparacion.data.DescripcionUsuRep && (
                                                    <div className="mt-1">
                                                        <strong>Descripción:</strong> {reparacion.data.DescripcionUsuRep.substring(0, 100)}
                                                        {reparacion.data.DescripcionUsuRep.length > 100 && '...'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            className="btn btn-sm btn-primary mt-2 mt-md-0 ms-md-3 align-self-start"
                                            onClick={(e) => handleVerReparacion(reparacion.id, e)}
                                        >
                                            Ver Detalle
                                        </button>
                                    </div>

                                    {/* Galería de Fotos */}
                                    {estaExpandida && (
                                        <div className="mt-3 ps-4">
                                            {isAdmin && (
                                                <div className="alert alert-info mb-3">
                                                    <small>
                                                        <i className="bi bi-info-circle me-2"></i>
                                                        <strong>Modo Admin:</strong> Puedes seleccionar fotos ANTES/DESPUÉS desde aquí usando los botones amarillo y verde.
                                                    </small>
                                                </div>
                                            )}
                                            {(reparacion.data.FotoAntes || reparacion.data.FotoDespues) && (
                                                <div className="alert alert-success mb-3">
                                                    <small>
                                                        <i className="bi bi-check-circle me-2"></i>
                                                        <strong>Fotos marcadas:</strong>
                                                        {reparacion.data.FotoAntes && (
                                                            <span className="ms-2">
                                                                <span className="badge bg-warning text-dark me-1">
                                                                    <i className="bi bi-arrow-left-circle me-1"></i>
                                                                    ANTES
                                                                </span>
                                                            </span>
                                                        )}
                                                        {reparacion.data.FotoDespues && (
                                                            <span className="ms-2">
                                                                <span className="badge bg-success me-1">
                                                                    <i className="bi bi-arrow-right-circle me-1"></i>
                                                                    DESPUÉS
                                                                </span>
                                                            </span>
                                                        )}
                                                    </small>
                                                </div>
                                            )}
                                            <div className="bg-light p-3 rounded">
                                                <ImageGallery
                                                    images={reparacion.data.urlsFotos || []}
                                                    isAdmin={isAdmin}
                                                    photoBeforeUrl={reparacion.data.FotoAntes}
                                                    photoAfterUrl={reparacion.data.FotoDespues}
                                                    onSelectBefore={isAdmin ? (url) => handleSelectFotoAntes(reparacion, url) : undefined}
                                                    onSelectAfter={isAdmin ? (url) => handleSelectFotoDespues(reparacion, url) : undefined}
                                                    enableSelection={isAdmin}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
