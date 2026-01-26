import React, { useEffect } from "react";
import { useAppSelector } from "../../../redux-tool-kit/hooks/useAppSelector";
import { useAppDispatch } from "../../../redux-tool-kit/hooks/useAppDispatch";
import { useModal } from "../../Modal/useModal";
import { useDebouncedField } from "../../../hooks/useDebouncedField";
import { 
    selectReparacionById, 
    selectSeccionesVisibles,
    selectPuedeAvanzarA,
    selectIntervencionesDeReparacionActual,
} from "../../../redux-tool-kit/reparacion";
import { 
    cambiarEstadoReparacionAsync,
    getIntervencionesPorReparacionAsync,
    cambiarEstadoAsignacionAsync,
} from "../../../redux-tool-kit/reparacion/reparacion.actions";
import { selectColeccionIntervenciones } from "../../../redux-tool-kit/intervencion/intervencion.selectors";
import { EstadoAsignacion } from "../../../types/intervencion";
import { convertTimestampCORTO } from "../../../utils/utils";
import TextareaAutosize from "react-textarea-autosize";

interface ReparacionRepararProps {
    reparacionId: string;
    isAdmin: boolean;
}

export const ReparacionReparar: React.FC<ReparacionRepararProps> = ({ 
    reparacionId, 
    isAdmin 
}) => {
    const dispatch = useAppDispatch();
    const { openModal } = useModal();
    
    const reparacion = useAppSelector(state => selectReparacionById(reparacionId)(state));
    const seccionVisible = useAppSelector(state => 
        selectSeccionesVisibles(reparacionId, isAdmin)(state).reparar
    );
    const puedeAvanzarAReparado = useAppSelector(state => 
        selectPuedeAvanzarA(reparacionId, 'Reparado')(state)
    );
    const puedeAvanzarADiagnosticado = useAppSelector(state => 
        selectPuedeAvanzarA(reparacionId, 'Diagnosticado')(state)
    );

    // Obtener asignaciones de intervenciones
    const asignaciones = useAppSelector(selectIntervencionesDeReparacionActual);
    const catalogoIntervenciones = useAppSelector(selectColeccionIntervenciones);

    // Cargar asignaciones al montar
    useEffect(() => {
        if (seccionVisible) {
            dispatch(getIntervencionesPorReparacionAsync(reparacionId));
        }
    }, [dispatch, reparacionId, seccionVisible]);

    // Usar debounce para campo de texto
    const descripcionTec = useDebouncedField({
        reparacionId,
        campo: 'DescripcionTecRep',
        valorInicial: reparacion?.data.DescripcionTecRep || "",
        delay: 3000 // 3 segundos para informes largos
    });

    const fechaFin = useDebouncedField({
        reparacionId,
        campo: 'FeFinRep',
        valorInicial: reparacion?.data.FeFinRep || "",
        delay: 500,
        isDateField: true
    });

    if (!seccionVisible || !reparacion) return null;

    const avanzarAReparado = async () => {
        const response = await dispatch(cambiarEstadoReparacionAsync({
            reparacionId,
            nuevoEstado: 'Reparado',
            enviarEmail: true
        }));

        if (response.meta.requestStatus === 'fulfilled') {
            openModal({
                mensaje: "Drone marcado como reparado y email enviado correctamente.",
                tipo: "success",
                titulo: "Drone Reparado",
            });
        }
    };

    const avanzarADiagnosticado = async () => {
        const response = await dispatch(cambiarEstadoReparacionAsync({
            reparacionId,
            nuevoEstado: 'Diagnosticado',
            enviarEmail: true
        }));

        if (response.meta.requestStatus === 'fulfilled') {
            openModal({
                mensaje: "Drone marcado como diagnosticado y email enviado correctamente.",
                tipo: "success",
                titulo: "Drone Diagnosticado",
            });
        }
    };

    const handleCambiarEstado = async (asignacionId: string, estadoActual: string) => {
        const nuevoEstado = estadoActual === EstadoAsignacion.COMPLETADA 
            ? EstadoAsignacion.PENDIENTE 
            : EstadoAsignacion.COMPLETADA;

        try {
            await dispatch(cambiarEstadoAsignacionAsync({
                asignacionId,
                nuevoEstado
            })).unwrap();
        } catch (error: unknown) {
            openModal({
                mensaje: (error as { message?: string })?.message || "Error al cambiar el estado.",
                tipo: "danger",
                titulo: "Error",
            });
        }
    };

    return (
        <div className="card mb-3" id="seccion-reparar">
            <div className="card-body">
                <h5 className="card-title bluemcdron">REPARAR</h5>
                
                {/* Lista simplificada de intervenciones con checks */}
                {asignaciones.length > 0 && (
                    <div className="mb-4">
                        <h6 className="mb-3">Tareas a Realizar</h6>
                        <div className="list-group">
                            {[...asignaciones]
                                .sort((a, b) => a.id.localeCompare(b.id))
                                .map((asignacion) => {
                                const intervencion = catalogoIntervenciones[asignacion.data.intervencionId];
                                const estaCompletada = asignacion.data.estado === EstadoAsignacion.COMPLETADA;
                                
                                return (
                                    <div 
                                        key={asignacion.id} 
                                        className="list-group-item d-flex align-items-center py-2"
                                    >
                                        <div className="form-check flex-grow-1">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={estaCompletada}
                                                onChange={() => handleCambiarEstado(asignacion.id, asignacion.data.estado)}
                                                id={`tarea-${asignacion.id}`}
                                                disabled={!isAdmin}
                                                style={{ cursor: isAdmin ? 'pointer' : 'default' }}
                                            />
                                            <label 
                                                className={`form-check-label ms-2 ${estaCompletada ? 'text-decoration-line-through text-muted' : ''}`}
                                                htmlFor={`tarea-${asignacion.id}`}
                                                style={{ cursor: isAdmin ? 'pointer' : 'default' }}
                                            >
                                                {intervencion?.data?.NombreInt || 'Intervención'}
                                            </label>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div>
                    <label className="form-label">
                        Informe de Reparación o Diagnóstico
                        {descripcionTec.isSaving && <small className="text-muted ms-2">Guardando...</small>}
                    </label>
                    <TextareaAutosize
                        onChange={(e) => descripcionTec.onChange(e.target.value)}
                        className="form-control"
                        id="DescripcionTecRep"
                        value={descripcionTec.value}
                        rows={5}
                        disabled={!isAdmin}
                    />
                </div>
                <div>
                    <label className="form-label">
                        Fecha Finalizacion
                        {fechaFin.isSaving && <small className="text-muted ms-2">Guardando...</small>}
                    </label>
                    <input
                        onChange={(e) => fechaFin.onChange(e.target.value)}
                        type="date"
                        className="form-control"
                        id="FeFinRep"
                        value={fechaFin.value}
                        disabled={!isAdmin}
                    />
                </div>

                {isAdmin && (
                    <div className="mt-3">
                        {puedeAvanzarAReparado && (
                            <button
                                type="button"
                                className="btn btn-success"
                                onClick={avanzarAReparado}
                            >
                                Marcar como Reparado
                            </button>
                        )}
                        {puedeAvanzarADiagnosticado && (
                            <button
                                type="button"
                                className="btn btn-warning ms-2"
                                onClick={avanzarADiagnosticado}
                            >
                                Marcar como Diagnosticado
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
