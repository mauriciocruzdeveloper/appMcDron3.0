import React from "react";
import { useAppSelector } from "../../../redux-tool-kit/hooks/useAppSelector";
import { useAppDispatch } from "../../../redux-tool-kit/hooks/useAppDispatch";
import { useDebouncedField } from "../../../hooks/useDebouncedField";
import { useModal } from "../../Modal/useModal";
import { 
    selectReparacionById, 
    selectSeccionesVisibles,
    selectPuedeAvanzarA,
} from "../../../redux-tool-kit/reparacion";
import { 
    cambiarEstadoReparacionAsync,
} from "../../../redux-tool-kit/reparacion/reparacion.actions";
import { enviarReciboAsync } from "../../../redux-tool-kit/app/app.actions";
import { convertTimestampCORTO } from "../../../utils/utils";

interface ReparacionRecepcionProps {
    reparacionId: string;
    isAdmin: boolean;
}

export const ReparacionRecepcion: React.FC<ReparacionRecepcionProps> = ({ 
    reparacionId, 
    isAdmin 
}) => {
    const dispatch = useAppDispatch();
    const { openModal } = useModal();
    
    const reparacion = useAppSelector(state => selectReparacionById(reparacionId)(state));
    const seccionVisible = useAppSelector(state => 
        selectSeccionesVisibles(reparacionId, isAdmin)(state).recepcion
    );
    const puedeAvanzarARecibido = useAppSelector(state => 
        selectPuedeAvanzarA(reparacionId, 'Recibido')(state)
    );

    const fechaRecepcion = useDebouncedField({
        reparacionId,
        campo: 'FeRecRep',
        valorInicial: reparacion?.data.FeRecRep || "",
        delay: 500,
        isDateField: true
    });

    if (!seccionVisible || !reparacion) return null;

    const handleSendRecibo = async () => {
        if (!reparacion) return;

        const response = await dispatch(enviarReciboAsync(reparacion));
        if (response.meta.requestStatus === 'fulfilled') {
            openModal({
                mensaje: "Recibo enviado correctamente.",
                tipo: "success",
                titulo: "Enviar Recibo",
            });
        } else {
            openModal({
                mensaje: "Error al enviar el recibo.",
                tipo: "danger",
                titulo: "Enviar Recibo",
            });
        }
    };

    const avanzarARecibido = async () => {
        const response = await dispatch(cambiarEstadoReparacionAsync({
            reparacionId,
            nuevoEstado: 'Recibido',
            enviarEmail: true
        }));

        if (response.meta.requestStatus === 'fulfilled') {
            openModal({
                mensaje: "Drone marcado como recibido y recibo enviado por email correctamente.",
                tipo: "success",
                titulo: "Drone Recibido",
            });
        } else {
            openModal({
                mensaje: "Error al marcar como recibido.",
                tipo: "danger",
                titulo: "Error",
            });
        }
    };

    return (
        <div className="card mb-3" id="seccion-recepcion">
            <div className="card-body">
                <h5 className="card-title bluemcdron">RECEPCIÓN</h5>

                {reparacion.data.EstadoRep !== 'Recibido' && (
                    <div className="alert alert-info mb-3">
                        <strong>Estado actual:</strong> {reparacion.data.EstadoRep}
                        <br />
                        <small>Una vez que el equipo llegue al taller, márcalo como recibido.</small>
                    </div>
                )}

                <div>
                    <label className="form-label">
                        Fecha de Recepción
                        {fechaRecepcion.isSaving && <small className="text-muted ms-2">Guardando...</small>}
                    </label>
                    <div className="d-flex w-100 justify-content-between">
                        <input
                            onChange={(e) => fechaRecepcion.onChange(e.target.value)}
                            type="date"
                            className="form-control"
                            id="FeRecRep"
                            value={fechaRecepcion.value}
                            disabled={!isAdmin}
                        />
                        <button
                            type="submit"
                            className="btn btn-outline-secondary bg-bluemcdron text-white"
                            onClick={handleSendRecibo}
                            disabled={!reparacion.data.FeRecRep}
                            title={!reparacion.data.FeRecRep ? "Primero marque como recibido" : "Enviar recibo por email"}
                        >
                            <i className="bi bi-envelope"></i>
                        </button>
                    </div>
                </div>

                {isAdmin && (
                    <div className="mt-3">
                        {puedeAvanzarARecibido && (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={avanzarARecibido}
                            >
                                <i className="bi bi-check-circle me-2"></i>
                                Marcar como Recibido
                            </button>
                        )}
                        {reparacion.data.EstadoRep === 'Recibido' && (
                            <div className="alert alert-success mt-2 mb-0">
                                <i className="bi bi-check-circle-fill me-2"></i>
                                Equipo recibido correctamente
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
