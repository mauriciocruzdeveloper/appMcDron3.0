import React from "react";
import { useAppSelector } from "../../../redux-tool-kit/hooks/useAppSelector";
import { useAppDispatch } from "../../../redux-tool-kit/hooks/useAppDispatch";
import { useModal } from "../../Modal/useModal";
import { useDebouncedField } from "../../../hooks/useDebouncedField";
import { 
    selectReparacionById, 
    selectSeccionesVisibles,
    selectPuedeAvanzarA,
} from "../../../redux-tool-kit/reparacion";
import { 
    cambiarEstadoReparacionAsync,
} from "../../../redux-tool-kit/reparacion/reparacion.actions";
import { convertTimestampCORTO } from "../../../utils/utils";
import { buildAndreaniTrackingUrl } from "../../../utils/tracking";
import TextareaAutosize from "react-textarea-autosize";
import { BoxArrowUpRight } from "react-bootstrap-icons";

interface ReparacionEntregaProps {
    reparacionId: string;
    isAdmin: boolean;
}

export const ReparacionEntrega: React.FC<ReparacionEntregaProps> = ({ 
    reparacionId, 
    isAdmin 
}) => {
    const dispatch = useAppDispatch();
    const { openModal } = useModal();
    
    const reparacion = useAppSelector(state => selectReparacionById(reparacionId)(state));
    const seccionVisible = useAppSelector(state => 
        selectSeccionesVisibles(reparacionId, isAdmin)(state).entrega
    );
    const puedeAvanzarACobrado = useAppSelector(state => 
        selectPuedeAvanzarA(reparacionId, 'Cobrado')(state)
    );
    const puedeAvanzarAEnviado = useAppSelector(state => 
        selectPuedeAvanzarA(reparacionId, 'Enviado')(state)
    );
    const puedeAvanzarAFinalizado = useAppSelector(state => 
        selectPuedeAvanzarA(reparacionId, 'Finalizado')(state)
    );
    const puedeAvanzarAAbandonado = useAppSelector(state => 
        selectPuedeAvanzarA(reparacionId, 'Abandonado')(state)
    );

    // Usar debounce para campos de texto
    const txtEntrega = useDebouncedField({
        reparacionId,
        campo: 'TxtEntregaRep',
        valorInicial: reparacion?.data.TxtEntregaRep || ""
    });

    const seguimiento = useDebouncedField({
        reparacionId,
        campo: 'SeguimientoEntregaRep',
        valorInicial: reparacion?.data.SeguimientoEntregaRep || ""
    });

    const fechaEntrega = useDebouncedField({
        reparacionId,
        campo: 'FeEntRep',
        valorInicial: reparacion?.data.FeEntRep || "",
        isDateField: true
    });

    if (!seccionVisible || !reparacion) return null;

    const seguimientoLocalValido = Boolean(seguimiento.value.trim());
    const andreaniTrackingUrl = buildAndreaniTrackingUrl(seguimiento.value);
    const puedeMostrarAccionEnviado =
        reparacion.data.EstadoRep === 'Cobrado' || puedeAvanzarAEnviado;

    const avanzarACobrado = () => {
        dispatch(cambiarEstadoReparacionAsync({
            reparacionId,
            nuevoEstado: 'Cobrado',
            enviarEmail: false
        }));
    };

    const avanzarAEnviado = () => {
        dispatch(cambiarEstadoReparacionAsync({
            reparacionId,
            nuevoEstado: 'Enviado',
            enviarEmail: false
        }));
    };

    const avanzarAFinalizado = async () => {
        const response = await dispatch(cambiarEstadoReparacionAsync({
            reparacionId,
            nuevoEstado: 'Finalizado',
            enviarEmail: false
        }));

        // Verificar si se usó la fecha de entrega como fallback para la fecha de finalización
        if (response.meta.requestStatus === 'fulfilled') {
            const payload = response.payload as { reparacion: any; usedDeliveryDateAsFallback: boolean };
            
            if (payload.usedDeliveryDateAsFallback) {
                openModal({
                    mensaje: "⚠️ La reparación no tenía fecha de finalización. Se ha usado la fecha de entrega como fecha de finalización automáticamente.",
                    tipo: "warning",
                    titulo: "Fecha de Finalización Ajustada",
                });
            } else {
                openModal({
                    mensaje: "Reparación finalizada correctamente.",
                    tipo: "success",
                    titulo: "Reparación Finalizada",
                });
            }
        }
    };

    const avanzarAAbandonado = () => {
        dispatch(cambiarEstadoReparacionAsync({
            reparacionId,
            nuevoEstado: 'Abandonado',
            enviarEmail: false
        }));
    };

    return (
        <div className="card mb-3" id="seccion-entrega">
            <div className="card-body">
                <h5 className="card-title bluemcdron">ENTREGA</h5>
                <div>
                    <label className="form-label">
                        Fecha Entrega
                        {fechaEntrega.isSaving && <small className="text-muted ms-2">Guardando...</small>}
                    </label>
                    <input
                        onChange={(e) => fechaEntrega.onChange(e.target.value)}
                        type="date"
                        className="form-control"
                        id="FeEntRep"
                        value={fechaEntrega.value}
                        disabled={!isAdmin}
                    />
                </div>
                <div>
                    <label className="form-label">
                        Cliente, Comisionista, Correo, Seguimiento
                        {txtEntrega.isSaving && <small className="text-muted ms-2">Guardando...</small>}
                    </label>
                    <TextareaAutosize
                        onChange={(e) => txtEntrega.onChange(e.target.value)}
                        className="form-control"
                        id="TxtEntregaRep"
                        value={txtEntrega.value}
                        rows={5}
                        disabled={!isAdmin}
                    />
                </div>
                <div>
                    <label className="form-label">
                        Nro. de Seguimiento
                        {seguimiento.isSaving && <small className="text-muted ms-2">Guardando...</small>}
                    </label>
                    <div className="d-flex flex-column flex-sm-row gap-2">
                        <input
                            onChange={(e) => seguimiento.onChange(e.target.value)}
                            type="text"
                            className="form-control"
                            id="SeguimientoEntregaRep"
                            value={seguimiento.value}
                            disabled={!isAdmin}
                        />
                        {andreaniTrackingUrl && (
                            <a
                                href={andreaniTrackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline-primary text-nowrap"
                                title="Abrir seguimiento oficial de Andreani"
                            >
                                <BoxArrowUpRight className="me-1" aria-hidden="true" />
                                Consultar Andreani
                            </a>
                        )}
                    </div>
                    {andreaniTrackingUrl && (
                        <small className="text-success d-block mt-1">
                            Envío Andreani detectado
                        </small>
                    )}
                </div>

                {isAdmin && (
                    <div className="mt-3">
                        <div className="d-flex flex-wrap gap-2 mb-2">
                            {(reparacion.data.EstadoRep === 'Reparado' || reparacion.data.EstadoRep === 'Diagnosticado') && puedeAvanzarACobrado && (
                                <button
                                    type="button"
                                    className="btn btn-info flex-fill"
                                    style={{ minWidth: '140px' }}
                                    onClick={avanzarACobrado}
                                >
                                    Marcar como Cobrado
                                </button>
                            )}
                            {puedeMostrarAccionEnviado && (
                                <button
                                    type="button"
                                    className="btn btn-warning flex-fill"
                                    style={{ minWidth: '140px' }}
                                    onClick={avanzarAEnviado}
                                    disabled={
                                        !seguimientoLocalValido ||
                                        seguimiento.isSaving ||
                                        !puedeAvanzarAEnviado
                                    }
                                    title={!seguimientoLocalValido
                                        ? 'Ingresá un número de seguimiento para marcar como Enviado'
                                        : undefined}
                                >
                                    Marcar como Enviado
                                </button>
                            )}
                        </div>

                        <div className="d-flex flex-wrap gap-2">
                            {puedeAvanzarAFinalizado && (
                                <button
                                    type="button"
                                    className="btn btn-success flex-fill"
                                    style={{ minWidth: '140px' }}
                                    onClick={avanzarAFinalizado}
                                >
                                    Finalizar Reparación
                                </button>
                            )}
                            {puedeAvanzarAAbandonado && (
                                <button
                                    type="button"
                                    className="btn btn-secondary flex-fill"
                                    style={{ minWidth: '140px' }}
                                    onClick={avanzarAAbandonado}
                                >
                                    Marcar como Abandonado
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
