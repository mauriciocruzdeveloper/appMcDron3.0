import React from "react";
import { useAppDispatch } from "../../../redux-tool-kit/hooks/useAppDispatch";
import { useHistory } from "../../../hooks/useHistory";
import { useModal } from "../../Modal/useModal";
import { useAppSelector } from "../../../redux-tool-kit/hooks/useAppSelector";
import { selectReparacionById } from "../../../redux-tool-kit/reparacion";
import { cancelarAvisoAbandonoAsync, cambiarEstadoReparacionAsync, crearAmpliacionReparacionAsync, eliminarReparacionAsync, enviarAvisoAbandonoAsync } from "../../../redux-tool-kit/reparacion/reparacion.actions";
import { getPublicIdDisplay } from "../../../utils/publicIdHelper";
import { convertTimestampCORTO } from "../../../utils/utils";
import { obtenerFechaHabilitacionAbandono, puedeCancelarAvisoAbandono, puedeConfirmarAbandono, puedeEnviarAvisoAbandono } from "../../../usecases/abandonoReparacion";

interface ReparacionAccionesProps {
    reparacionId: string;
    isAdmin: boolean;
}

export const ReparacionAcciones: React.FC<ReparacionAccionesProps> = ({ 
    reparacionId, 
    isAdmin 
}) => {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const { openModal } = useModal();
    const reparacion = useAppSelector(state => selectReparacionById(reparacionId)(state));

    if (!isAdmin || !reparacion) return null;

    const puedeEnviarAviso = puedeEnviarAvisoAbandono(reparacion);
    const puedeCancelarAviso = puedeCancelarAvisoAbandono(reparacion);
    const puedeAbandonar = puedeConfirmarAbandono(reparacion);
    const fechaHabilitacion = reparacion.data.FechaAvisoAbandono
        ? obtenerFechaHabilitacionAbandono(reparacion.data.FechaAvisoAbandono)
        : null;

    const handleEnviarAviso = () => {
        openModal({
            mensaje: "¿Enviar al cliente el aviso previo de abandono? La reparación conservará su estado y el cliente tendrá 7 días para retirar el drone.",
            tipo: "warning",
            titulo: "Enviar Aviso de Abandono",
            confirmCallback: async () => {
                const response = await dispatch(enviarAvisoAbandonoAsync(reparacionId));

                openModal({
                    mensaje: response.meta.requestStatus === "fulfilled"
                        ? "Aviso de abandono enviado y fecha registrada correctamente."
                        : "No se pudo enviar o registrar el aviso de abandono.",
                    tipo: response.meta.requestStatus === "fulfilled" ? "success" : "danger",
                    titulo: "Aviso de Abandono",
                });
            },
        });
    };

    const handleCancelarAviso = () => {
        openModal({
            mensaje: "¿Cancelar el aviso de abandono? La reparación conservará su estado actual.",
            tipo: "warning",
            titulo: "Cancelar Aviso de Abandono",
            confirmCallback: async () => {
                const response = await dispatch(cancelarAvisoAbandonoAsync(reparacionId));

                openModal({
                    mensaje: response.meta.requestStatus === "fulfilled"
                        ? "Aviso de abandono cancelado."
                        : "No se pudo cancelar el aviso de abandono.",
                    tipo: response.meta.requestStatus === "fulfilled" ? "success" : "danger",
                    titulo: "Cancelar Aviso de Abandono",
                });
            },
        });
    };

    const handleAbandonarReparacion = () => {
        openModal({
            mensaje: "¿Marcar definitivamente esta reparación como abandonada? No se podrá volver al estado anterior.",
            tipo: "warning",
            titulo: "Confirmar Abandono Definitivo",
            confirmCallback: async () => {
                const response = await dispatch(cambiarEstadoReparacionAsync({
                    reparacionId,
                    nuevoEstado: "Abandonado",
                    enviarEmail: false,
                }));

                if (response.meta.requestStatus === "fulfilled") {
                    openModal({
                        mensaje: "Reparación marcada definitivamente como abandonada.",
                        tipo: "success",
                        titulo: "Drone Abandonado",
                    });
                    return;
                }

                openModal({
                    mensaje: "No se pudo marcar la reparación como abandonada.",
                    tipo: "danger",
                    titulo: "Error",
                });
            },
        });
    };

    const handleCrearAmpliacion = () => {
        openModal({
            mensaje: `Se creará una nueva reparación vinculada a ${getPublicIdDisplay(reparacion)}.`,
            tipo: "warning",
            titulo: "Crear Ampliación",
            confirmCallback: async () => {
                try {
                    const nuevaReparacion = await dispatch(crearAmpliacionReparacionAsync(reparacionId)).unwrap();
                    openModal({
                        mensaje: `Ampliación creada: ${getPublicIdDisplay(nuevaReparacion)}.`,
                        tipo: "success",
                        titulo: "Crear Ampliación",
                    });
                    history.push(`/inicio/reparaciones/${nuevaReparacion.id}`);
                } catch (error: unknown) {
                    console.error("Error al crear la ampliación:", error);
                    openModal({
                        mensaje: "No se pudo crear la ampliación.",
                        tipo: "danger",
                        titulo: "Crear Ampliación",
                    });
                }
            },
        });
    };

    const handleEliminarReparacion = () => {
        openModal({
            mensaje: "¿Eliminar Reparación?",
            tipo: "danger",
            titulo: "Atención",
            confirmCallback: async () => {
                try {
                    await dispatch(eliminarReparacionAsync(reparacionId)).unwrap();
                    openModal({
                        mensaje: "Reparación eliminada correctamente.",
                        tipo: "success",
                        titulo: "Eliminar Reparación",
                    });
                    history.replace("/inicio/reparaciones");
                } catch (error: unknown) {
                    console.error("Error al eliminar la reparación:", error);
                    openModal({
                        mensaje: (error as { code?: string })?.code || "Error al eliminar la reparación.",
                        tipo: "danger",
                        titulo: "Eliminar Reparación",
                    });
                }
            },
        });
    };

    return (
        <div className="text-center">
            {reparacion.data.FechaAvisoAbandono && (
                <div className="alert alert-warning text-start" role="status">
                    Aviso enviado el {convertTimestampCORTO(reparacion.data.FechaAvisoAbandono)}.
                    {fechaHabilitacion && (
                        <> El abandono definitivo se habilita el {convertTimestampCORTO(fechaHabilitacion)}.</>
                    )}
                </div>
            )}

            {puedeEnviarAviso && (
                <button
                    type="button"
                    onClick={handleEnviarAviso}
                    className="w-100 btn btn-warning mb-2"
                >
                    Enviar aviso de abandono
                </button>
            )}

            {puedeCancelarAviso && (
                <button
                    type="button"
                    onClick={handleCancelarAviso}
                    className="w-100 btn btn-outline-secondary mb-2"
                >
                    Cancelar aviso de abandono
                </button>
            )}

            {puedeAbandonar && (
                <button
                    type="button"
                    onClick={handleAbandonarReparacion}
                    className="w-100 btn btn-secondary mb-2"
                >
                    Marcar como Abandonado
                </button>
            )}

            <button
                key="botonCrearAmpliacion"
                onClick={handleCrearAmpliacion}
                className="w-100 btn btn-primary mb-2"
            >
                Crear Ampliación
            </button>

            <button
                key="botonEliminar"
                onClick={handleEliminarReparacion}
                className="w-100 btn bg-danger text-white"
            >
                Eliminar
            </button>
        </div>
    );
};
