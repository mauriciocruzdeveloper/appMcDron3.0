import React, { useEffect, useState } from "react";
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
    agregarIntervencionAReparacionAsync,
    cambiarEstadoReparacionAsync,
    eliminarIntervencionDeReparacionAsync,
    getIntervencionesPorReparacionAsync,
    cambiarEstadoAsignacionAsync,
} from "../../../redux-tool-kit/reparacion/reparacion.actions";
import { subirFotoInformeAsync, borrarFotoInformeAsync } from "../../../redux-tool-kit/app/app.actions";
import { selectColeccionIntervenciones, selectIntervencionesAsignables } from "../../../redux-tool-kit/intervencion/intervencion.selectors";
import { selectDroneById } from "../../../redux-tool-kit/drone/drone.selectors";
import { EstadoAsignacion, OrigenAsignacion } from "../../../types/intervencion";
import { convertTimestampCORTO } from "../../../utils/utils";
import { getThumbnailUrl } from "../../../utils/imageUtils";
import { ComboBox } from "../../common";
import TextareaAutosize from "react-textarea-autosize";
import { ReparacionSeccionColapsable } from "./ReparacionSeccionColapsable";

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
    const drone = useAppSelector(state => selectDroneById(reparacion?.data.DroneId || "")(state));
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
    const intervencionesAsignables = useAppSelector(selectIntervencionesAsignables);
    const [intervencionAdicionalSeleccionada, setIntervencionAdicionalSeleccionada] = useState<string | null>(null);

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

    const [fotosInforme, setFotosInforme] = useState<string[]>(reparacion?.data.FotosInformeRep || []);
    const [isUploadingFotoInforme, setIsUploadingFotoInforme] = useState(false);

    // Sincronizar fotos del informe cuando cambian desde el store
    useEffect(() => {
        setFotosInforme(reparacion?.data.FotosInformeRep || []);
    }, [reparacion?.data.FotosInformeRep]);

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

    const handleAgregarIntervencionAdicional = async () => {
        if (!intervencionAdicionalSeleccionada) return;

        try {
            await dispatch(agregarIntervencionAReparacionAsync({
                reparacionId,
                intervencionId: intervencionAdicionalSeleccionada,
                origen: OrigenAsignacion.ADICIONAL,
            })).unwrap();
            setIntervencionAdicionalSeleccionada(null);
        } catch (error: unknown) {
            openModal({
                mensaje: (error as { message?: string })?.message || "No se pudo agregar la intervención adicional.",
                tipo: "danger",
                titulo: "Error",
            });
        }
    };

    const handleEliminarIntervencionAdicional = (asignacionId: string, nombre: string) => {
        openModal({
            mensaje: `¿Eliminar la intervención adicional "${nombre}" y liberar sus repuestos reservados?`,
            tipo: "warning",
            titulo: "Eliminar Intervención Adicional",
            confirmCallback: async () => {
                try {
                    await dispatch(eliminarIntervencionDeReparacionAsync({
                        reparacionId,
                        intervencionId: asignacionId,
                    })).unwrap();
                } catch (error: unknown) {
                    openModal({
                        mensaje: (error as { message?: string })?.message || "No se pudo eliminar la intervención adicional.",
                        tipo: "danger",
                        titulo: "Error",
                    });
                }
            },
        });
    };

    const handleAgregarFotoInforme = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];

        setIsUploadingFotoInforme(true);
        try {
            const response = await dispatch(subirFotoInformeAsync({ reparacionId, file }));

            if (response.meta.requestStatus === 'fulfilled') {
                const nuevasFotos = response.payload as string[];
                setFotosInforme(Array.isArray(nuevasFotos) ? nuevasFotos : fotosInforme);
            } else {
                throw new Error("Fallo en la respuesta");
            }
        } catch (error: unknown) {
            openModal({
                mensaje: "No se pudo subir la foto. Intente de nuevo.",
                tipo: "danger",
                titulo: "Error de Subida",
            });
        } finally {
            setIsUploadingFotoInforme(false);
            e.target.value = '';
        }
    };

    const handleEliminarFotoInforme = async (url: string) => {
        openModal({
            mensaje: '¿Está seguro de que desea eliminar esta foto del informe?',
            tipo: 'danger',
            titulo: 'Eliminar Foto',
            confirmCallback: async () => {
                try {
                    const response = await dispatch(borrarFotoInformeAsync({ reparacionId, fotoUrl: url }));
                    if (response.meta.requestStatus !== 'fulfilled') {
                        throw new Error("Fallo en la respuesta");
                    }
                    setFotosInforme(fotosInforme.filter(f => f !== url));
                } catch (error: unknown) {
                    openModal({
                        mensaje: 'Error al eliminar la foto',
                        tipo: 'danger',
                        titulo: 'Error'
                    });
                }
            }
        });
    };

    return (
        <ReparacionSeccionColapsable id="seccion-reparar" titulo="REPARAR">

                {isAdmin && (estadoActual === 'Aceptado' || estadoActual === 'Repuestos') && (
                    <div className="mb-4">
                        <h6 className="mb-2">Agregar intervención adicional</h6>
                        <div className="row g-2 align-items-center">
                            <div className="col">
                                <ComboBox
                                    options={intervencionesAsignables
                                        .filter(intervencion =>
                                            !intervencion.data.ModeloDroneId ||
                                            intervencion.data.ModeloDroneId === drone?.data.ModeloDroneId
                                        )
                                        .map(intervencion => ({
                                            value: intervencion.id,
                                            label: intervencion.data.NombreInt,
                                        }))}
                                    value={intervencionAdicionalSeleccionada || ''}
                                    onChange={(selected) => setIntervencionAdicionalSeleccionada(selected?.value || null)}
                                    placeholder="Seleccionar una intervención..."
                                    noOptionsMessage="No se encontraron intervenciones"
                                    isClearable
                                />
                            </div>
                            <div className="col-auto">
                                <button
                                    type="button"
                                    className="btn bg-bluemcdron text-white"
                                    onClick={handleAgregarIntervencionAdicional}
                                    disabled={!intervencionAdicionalSeleccionada}
                                >
                                    <i className="bi bi-plus-circle me-1"></i>
                                    Agregar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
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
                                                {asignacion.data.origen === OrigenAsignacion.ADICIONAL && (
                                                    <span className="badge bg-info text-dark ms-2">Adicional</span>
                                                )}
                                            </label>
                                        </div>
                                        {isAdmin &&
                                            asignacion.data.origen === OrigenAsignacion.ADICIONAL &&
                                            asignacion.data.estado === EstadoAsignacion.PENDIENTE && (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger ms-2"
                                                    title="Eliminar intervención adicional"
                                                    aria-label={`Eliminar ${intervencion?.data?.NombreInt || 'intervención adicional'}`}
                                                    onClick={() => handleEliminarIntervencionAdicional(
                                                        asignacion.id,
                                                        intervencion?.data?.NombreInt || 'Intervención adicional',
                                                    )}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            )}
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

                <div className="mt-2 mb-3">
                    <label className="form-label small fw-bold">Fotos del informe</label>

                    {fotosInforme.length > 0 && (
                        <div className="row g-2 mb-2">
                            {fotosInforme.map((url, index) => (
                                <div key={index} className="col-6 col-md-4 col-lg-3">
                                    <div className="position-relative">
                                        <img
                                            src={getThumbnailUrl(url)}
                                            alt={`Foto informe ${index + 1}`}
                                            className="img-fluid rounded"
                                            style={{ width: '100%', height: '120px', objectFit: 'cover', cursor: 'pointer' }}
                                            onClick={() => window.open(url, '_blank')}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                if (target.src !== url) {
                                                    target.src = url;
                                                }
                                            }}
                                            title="Click para ver en tamaño completo"
                                        />
                                        {isAdmin && (
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                                                onClick={() => handleEliminarFotoInforme(url)}
                                                style={{ padding: '2px 6px' }}
                                            >
                                                <i className="bi bi-x"></i>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {isAdmin && (
                        <div>
                            <label className="btn btn-outline-secondary btn-sm">
                                Subir Foto
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAgregarFotoInforme}
                                    disabled={isUploadingFotoInforme}
                                    style={{ display: 'none' }}
                                />
                            </label>
                            {isUploadingFotoInforme && (
                                <small className="text-muted ms-2">Subiendo imagen...</small>
                            )}
                        </div>
                    )}
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
                        {puedeResolverAlternativamente && (
                            <button
                                type="button"
                                className="btn btn-outline-secondary ms-2"
                                onClick={resolverAlternativamente}
                                title="Cerrar la reparación sin completar las intervenciones presupuestadas"
                            >
                                Resolver alternativamente
                            </button>
                        )}
                    </div>
                )}
        </ReparacionSeccionColapsable>
    );
};
