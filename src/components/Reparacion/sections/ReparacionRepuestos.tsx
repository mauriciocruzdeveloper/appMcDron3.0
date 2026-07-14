import React, { useEffect } from "react";
import { useAppSelector } from "../../../redux-tool-kit/hooks/useAppSelector";
import { useAppDispatch } from "../../../redux-tool-kit/hooks/useAppDispatch";
import { useDebouncedField } from "../../../hooks/useDebouncedField";
import { useHistory } from "../../../hooks/useHistory";
import {
    selectReparacionById,
    selectSeccionesVisibles,
    selectPuedeAvanzarA,
    selectRepuestosDeReparacionActual,
} from "../../../redux-tool-kit/reparacion";
import {
    cambiarEstadoReparacionAsync,
    getIntervencionesPorReparacionAsync,
} from "../../../redux-tool-kit/reparacion/reparacion.actions";
import { ESTADOS_PEDIDO } from "../../../types/pedidoRepuesto";
import { esReparacionResuelta, EstadoReparacion } from "../../../usecases/estadosReparacion";
import TextareaAutosize from "react-textarea-autosize";

interface ReparacionRepuestosProps {
    reparacionId: string;
    isAdmin: boolean;
}

export const ReparacionRepuestos: React.FC<ReparacionRepuestosProps> = ({
    reparacionId,
    isAdmin,
}) => {
    const dispatch = useAppDispatch();
    const history = useHistory();

    const reparacion = useAppSelector(state => selectReparacionById(reparacionId)(state));
    const seccionVisible = useAppSelector(state =>
        selectSeccionesVisibles(reparacionId, isAdmin)(state).repuestos
    );
    const puedeAvanzarARepuestos = useAppSelector(state =>
        selectPuedeAvanzarA(reparacionId, 'Repuestos')(state)
    );
    const puedeAvanzarAAceptado = useAppSelector(state =>
        selectPuedeAvanzarA(reparacionId, 'Aceptado')(state)
    );
    const repuestos = useAppSelector(selectRepuestosDeReparacionActual);

    const obsRepuestos = useDebouncedField({
        reparacionId,
        campo: 'ObsRepuestos',
        valorInicial: reparacion?.data.ObsRepuestos || "",
    });

    const txtRepuestos = useDebouncedField({
        reparacionId,
        campo: 'TxtRepuestosRep',
        valorInicial: reparacion?.data.TxtRepuestosRep || "",
    });

    useEffect(() => {
        if (seccionVisible) {
            dispatch(getIntervencionesPorReparacionAsync(reparacionId));
        }
    }, [dispatch, reparacionId, seccionVisible]);

    if (!seccionVisible || !reparacion || !isAdmin) return null;

    const reparacionResuelta = esReparacionResuelta(reparacion.data.EstadoRep as EstadoReparacion);
    const repuestosFaltantes = reparacionResuelta ? [] : repuestos.filter(r => r.requierePedido);

    const avanzarARepuestos = () => {
        dispatch(cambiarEstadoReparacionAsync({ reparacionId, nuevoEstado: 'Repuestos', enviarEmail: false }));
    };

    const avanzarAAceptado = () => {
        dispatch(cambiarEstadoReparacionAsync({ reparacionId, nuevoEstado: 'Aceptado', enviarEmail: false }));
    };

    return (
        <div className="card mb-3" id="seccion-repuestos">
            <div className="card-body">
                <h5 className="card-title bluemcdron">REPUESTOS</h5>

                {/* Repuestos derivados de las intervenciones */}
                <div className="mb-3">
                    <label className="form-label fw-semibold">
                        Repuestos necesarios
                        {repuestos.length > 0 && (
                            <span className="ms-2 text-muted fw-normal small">
                                ({repuestos.length} repuesto{repuestos.length !== 1 ? 's' : ''} de las intervenciones asignadas)
                            </span>
                        )}
                    </label>

                    {repuestos.length > 0 && repuestosFaltantes.length > 0 && (
                        <div className="alert alert-danger py-2 mb-2" role="alert">
                            <strong>⚠️ {repuestosFaltantes.length} repuesto{repuestosFaltantes.length !== 1 ? 's' : ''} con faltante sin pedido activo:</strong>
                            <span className="ms-2 small">
                                {repuestosFaltantes.map(r => r.nombre).join(', ')}
                            </span>
                        </div>
                    )}

                    {repuestos.length === 0 ? (
                        <p className="text-muted small mb-0">
                            No hay intervenciones asignadas con repuestos de inventario.
                        </p>
                    ) : (
                        <div className="d-flex flex-column gap-2">
                            {repuestos.map(r => {
                                const mostrarFaltante = r.requierePedido && !reparacionResuelta;
                                const borderColor = reparacionResuelta || r.stockLibre > 0
                                    ? '#198754'
                                    : r.tienePedidoActivo
                                        ? '#ffc107'
                                        : '#dc3545';

                                return (
                                    <div
                                        key={r.repuestoId}
                                        className="border rounded p-2"
                                        style={{ borderLeftWidth: 4, borderLeftColor: borderColor, borderLeftStyle: 'solid' }}
                                    >
                                        <div className="d-flex justify-content-between align-items-start flex-wrap gap-1">
                                            <div>
                                                <span className="fw-semibold">{r.nombre}</span>
                                                <span className={`badge bg-${r.estadoColor} ms-2`}>
                                                    {r.estadoStock}
                                                </span>
                                                <div className="text-muted small mt-1">
                                                    Requerido por: {r.intervencionesNombre.join(', ')}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="small text-muted mt-1">
                                            Stock: {r.stockRepu} | Comprometido: {r.unidadesPedidas} | Libre: {r.stockLibre}
                                        </div>

                                        {mostrarFaltante ? (
                                            <div className="mt-2 d-flex flex-column gap-1">
                                                <span className="badge bg-danger">⚠️ Faltante crítico</span>
                                                <span className="text-muted small">
                                                    No hay cobertura para la demanda de esta reparación
                                                </span>
                                                {r.tienePedidoActivo && (
                                                    <>
                                                        <div className="small text-info mt-2">
                                                            <strong>Pedidos en camino que cubrirán el faltante:</strong>
                                                        </div>
                                                        {r.pedidos
                                                            .filter(p => p.estado === 'pending' || p.estado === 'in_transit')
                                                            .map(pedido => {
                                                                const estadoInfo = ESTADOS_PEDIDO.find(e => e.value === pedido.estado);
                                                                return (
                                                                    <div key={pedido.pedidoId} className="d-flex align-items-center gap-2 flex-wrap mt-1">
                                                                        <span className={`badge bg-${estadoInfo?.color || 'secondary'}`}>
                                                                            {estadoInfo?.label || pedido.estado}
                                                                        </span>
                                                                        <span className="small">{pedido.proveedorNombre}</span>
                                                                        {pedido.numeroPedido && (
                                                                            <span className="text-muted small">#{pedido.numeroPedido}</span>
                                                                        )}
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm btn-link p-0 ms-auto text-decoration-none"
                                                                            onClick={() => history.push(`/inicio/pedidos/${pedido.pedidoId}`)}
                                                                        >
                                                                            Ver pedido →
                                                                        </button>
                                                                    </div>
                                                                );
                                                            })}
                                                    </>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="mt-2 small text-success">
                                                {reparacionResuelta
                                                    ? '✓ Reparación finalizada, repuestos ya utilizados'
                                                    : '✓ Stock disponible para esta reparación'}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Observaciones libres */}
                <div className="mb-3">
                    <label className="form-label">
                        Observaciones de Repuestos
                        <small className="text-muted ms-2">
                            ({(obsRepuestos.value || "").length}/2000 caracteres)
                        </small>
                        {obsRepuestos.isSaving && <small className="text-muted ms-2">Guardando...</small>}
                    </label>
                    <TextareaAutosize
                        onChange={(e) => obsRepuestos.onChange(e.target.value)}
                        className="form-control"
                        id="ObsRepuestos"
                        value={obsRepuestos.value}
                        rows={3}
                        maxLength={2000}
                        placeholder="Ej: Motor delantero izquierdo DJI Mini 3 Pro, tornillos M2x6 (x4)"
                    />
                    <small className="form-text text-muted">
                        Especificar qué repuestos se necesitan para continuar con la reparación
                    </small>
                </div>

                <div className="mb-3">
                    <label className="form-label">
                        Seguimiento de Repuestos (Legacy)
                        <span className="badge bg-secondary ms-2">Opcional</span>
                        {txtRepuestos.isSaving && <small className="text-muted ms-2">Guardando...</small>}
                    </label>
                    <TextareaAutosize
                        onChange={(e) => txtRepuestos.onChange(e.target.value)}
                        className="form-control"
                        id="TxtRepuestosRep"
                        value={txtRepuestos.value}
                        rows={3}
                        placeholder="Información de transportista, seguimiento, etc."
                    />
                    <small className="form-text text-muted">
                        Información adicional: transportista, número de seguimiento, etc.
                    </small>
                </div>

                {/* Botones de estado */}
                {isAdmin && (
                    <div className="mt-3">
                        {reparacion.data.EstadoRep === 'Aceptado' && puedeAvanzarARepuestos && (
                            <button
                                type="button"
                                className="btn btn-warning me-2 mb-2"
                                onClick={avanzarARepuestos}
                            >
                                ⏸️ Pausar - Esperando Repuestos
                            </button>
                        )}

                        {reparacion.data.EstadoRep === 'Repuestos' && puedeAvanzarAAceptado && (
                            <button
                                type="button"
                                className="btn btn-success me-2 mb-2"
                                onClick={avanzarAAceptado}
                            >
                                ✅ Repuestos Llegaron - Continuar Reparación
                            </button>
                        )}

                        {reparacion.data.EstadoRep === 'Repuestos' && (
                            <div className="alert alert-warning mt-2" role="alert">
                                <strong>⚠️ Estado: Esperando Repuestos</strong>
                                <p className="mb-0 mt-1">
                                    La reparación está pausada hasta que lleguen los repuestos necesarios.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
