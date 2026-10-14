import React, { useState } from 'react';
import { Repuesto } from '../types/repuesto';
import { ImageGallery } from './ImageGallery';
import { getThumbnailUrl } from '../utils/imageUtils';

interface RepuestoCardProps {
    repuesto: { id: string; data: Pick<Repuesto['data'], 'NombreRepu'> & Partial<Repuesto['data']> };
    modelosNombres: string[];
    estado: string;
    estadoColor?: string;
    cantidadPedida?: number;
    vecesUsado?: number;
    onClick?: () => void;
    className?: string;
    children?: React.ReactNode;
}

const coloresEstado: Record<string, string> = {
    Disponible: 'success',
    Agotado: 'danger',
    'En Pedido': 'warning',
    Comprometido: 'warning',
};

export default function RepuestoCard({
    repuesto,
    modelosNombres,
    estado,
    estadoColor = coloresEstado[estado] || 'secondary',
    cantidadPedida,
    vecesUsado,
    onClick,
    className = '',
    children,
}: RepuestoCardProps): React.ReactElement {
    const [mostrarFoto, setMostrarFoto] = useState(false);
    const { NombreRepu, ProveedorRepu, PrecioRepu, FotoRepu, Obsoleta, StockRepu, UnidadesComprometidas } = repuesto.data;

    return (
        <>
            <article className={`card mb-2 ${className}`} aria-label={`Repuesto ${NombreRepu}`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : undefined }}>
                <div className="card-body p-3">
                    <div className="d-flex align-items-start gap-2">
                        {FotoRepu && (
                            <button
                                type="button"
                                className="btn p-0 border-0 flex-shrink-0"
                                title={`Ver foto de ${NombreRepu}`}
                                aria-label={`Ver foto de ${NombreRepu}`}
                                onClick={event => {
                                    event.stopPropagation();
                                    setMostrarFoto(true);
                                }}
                            >
                                <img
                                    src={getThumbnailUrl(FotoRepu)}
                                    alt={NombreRepu}
                                    className="rounded border shadow-sm"
                                    style={{ width: 48, height: 48, objectFit: 'cover' }}
                                    onError={event => {
                                        if (event.currentTarget.getAttribute('src') !== FotoRepu) {
                                            event.currentTarget.src = FotoRepu;
                                        }
                                    }}
                                />
                            </button>
                        )}
                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                                <h5 className="mb-1" style={{ overflowWrap: 'anywhere' }}>
                                    {onClick ? (
                                        <a
                                            href={`/inicio/repuestos/${repuesto.id}`}
                                            className="text-decoration-none text-reset"
                                            onClick={event => {
                                                event.preventDefault();
                                                event.stopPropagation();
                                                onClick();
                                            }}
                                        >
                                            {NombreRepu}
                                        </a>
                                    ) : NombreRepu}
                                </h5>
                                {PrecioRepu !== undefined && (
                                    <span className="badge bg-bluemcdron">
                                        {PrecioRepu.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                                    </span>
                                )}
                            </div>
                            <div className="small text-muted" style={{ overflowWrap: 'anywhere' }}>{ProveedorRepu}</div>
                            <div className="d-flex flex-wrap gap-2 mt-2">
                                <span className={`badge bg-${estadoColor} ${estadoColor === 'warning' || estadoColor === 'info' ? 'text-dark' : ''}`}>
                                    {estado}
                                </span>
                                {Obsoleta && <span className="badge bg-warning text-dark">Obsoleto</span>}
                            </div>
                        </div>
                    </div>
                    <div className="small text-muted mt-2">
                        <span>Stock: {StockRepu ?? 'Sin confirmar'}</span>
                        {UnidadesComprometidas !== undefined && <span> | Comprometido: {UnidadesComprometidas}</span>}
                    </div>
                    <div className="small text-muted mt-1" style={{ overflowWrap: 'anywhere' }}>
                        Modelos de drones: {modelosNombres.length > 0 ? modelosNombres.join(', ') : 'Sin modelos asignados'}
                    </div>
                    <div className="d-flex flex-wrap gap-2 mt-2">
                        {cantidadPedida !== undefined && cantidadPedida > 0 && (
                            <span className="badge bg-warning text-dark text-wrap text-start">
                                {cantidadPedida} {cantidadPedida === 1 ? 'unidad pedida' : 'unidades pedidas'}
                            </span>
                        )}
                        {vecesUsado !== undefined && (
                            <span className={`badge text-wrap text-start ${vecesUsado > 0 ? 'bg-info text-dark' : 'bg-secondary'}`}>
                                {vecesUsado > 0
                                    ? `Usado ${vecesUsado} ${vecesUsado === 1 ? 'vez' : 'veces'} en reparaciones`
                                    : 'No usado en reparaciones'}
                            </span>
                        )}
                    </div>
                    {children !== undefined && children !== null && children !== false && (
                        <div className="repuesto-card-details mt-2" style={{ cursor: 'auto' }} onClick={event => event.stopPropagation()}>
                            {children}
                        </div>
                    )}
                </div>
            </article>
            {mostrarFoto && FotoRepu && (
                <div
                    className="modal fade show d-block"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Foto de ${NombreRepu}`}
                    tabIndex={-1}
                    style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}
                    onClick={() => setMostrarFoto(false)}
                >
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 440 }} onClick={event => event.stopPropagation()}>
                        <div className="modal-content bg-dark text-white border-0 shadow-lg">
                            <div className="modal-header border-bottom border-secondary py-2">
                                <h6 className="modal-title mb-0">{NombreRepu}</h6>
                                <button type="button" className="btn-close btn-close-white" aria-label="Cerrar foto" onClick={() => setMostrarFoto(false)} />
                            </div>
                            <div className="modal-body p-3 d-flex justify-content-center">
                                <ImageGallery images={[FotoRepu]} isAdmin={false} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}