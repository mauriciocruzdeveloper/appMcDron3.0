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
import { SectionCard, FormField, FormTextarea, AppButton } from "../../ui";

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

    // Mostrar botón alternativo cuando hay intervenciones pendientes o se está en Repuestos
    const estadoActual = reparacion?.data.EstadoRep;
    const puedeResolverAlternativamente =
        (estadoActual === 'Aceptado' && !puedeAvanzarAReparado) ||
        estadoActual === 'Repuestos';

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
        valorInicial: reparacion?.data.DescripcionTecRep || ""
    });

    const fechaFin = useDebouncedField({
        reparacionId,
        campo: 'FeFinRep',
        valorInicial: reparacion?.data.FeFinRep || "",
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
        } else {
            openModal({
                mensaje: "Error al marcar el drone como reparado o enviar el email.",
                tipo: "danger",
                titulo: "Error",
            });
        }
    };

    const resolverAlternativamente = () => {
        openModal({
            titulo: "Resolver sin completar intervenciones",
            mensaje:
                "¿Estás seguro? Esta acción marcará la reparación como Reparada " +
                "sin haber completado todas las intervenciones presupuestadas. " +
                "Asegurate de haber explicado la resolución en el campo Informe de Reparación.",
            tipo: "warning",
            confirmCallback: async () => {
                const response = await dispatch(cambiarEstadoReparacionAsync({
                    reparacionId,
                    nuevoEstado: 'Reparado',
                    enviarEmail: true
                }));
                if (response.meta.requestStatus !== 'fulfilled') {
                    openModal({
                        mensaje: "Error al resolver la reparación.",
                        tipo: "danger",
                        titulo: "Error",
                    });
                }
            }
        });
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
        } else {
            openModal({
                mensaje: "Error al marcar el drone como diagnosticado o enviar el email.",
                tipo: "danger",
                titulo: "Error",
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
        <SectionCard title="REPARAR" id="seccion-reparar">
                
                {/* Lista simplificada de intervenciones con checks */}
                {asignaciones.length > 0 && (
                    <div className="mb-4">
                        <h6 className="mb-3">Tareas a Realizar</h6>
                        <div className="list-group">
                            {[...asignaciones]
                                .sort((a, b) => (b.data.PrecioTotal || 0) - (a.data.PrecioTotal || 0))
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

                <FormTextarea
                    label="Informe de Reparación o Diagnóstico"
                    id="DescripcionTecRep"
                    value={descripcionTec.value}
                    onChange={descripcionTec.onChange}
                    isSaving={descripcionTec.isSaving}
                    rows={5}
                    disabled={!isAdmin}
                />
                <FormField
                    label="Fecha Finalización"
                    id="FeFinRep"
                    type="date"
                    value={fechaFin.value}
                    onChange={fechaFin.onChange}
                    isSaving={fechaFin.isSaving}
                    disabled={!isAdmin}
                />

                {isAdmin && (
                    <div className="d-flex flex-wrap gap-2 mt-3">
                        {puedeAvanzarAReparado && (
                            <AppButton variant="success" onClick={avanzarAReparado}>
                                Marcar como Reparado
                            </AppButton>
                        )}
                        {puedeAvanzarADiagnosticado && (
                            <AppButton variant="warning" onClick={avanzarADiagnosticado}>
                                Marcar como Diagnosticado
                            </AppButton>
                        )}
                        {puedeResolverAlternativamente && (
                            <AppButton variant="outline-secondary" onClick={resolverAlternativamente}>
                                Resolver alternativamente
                            </AppButton>
                        )}
                    </div>
                )}
        </SectionCard>
    );
};
