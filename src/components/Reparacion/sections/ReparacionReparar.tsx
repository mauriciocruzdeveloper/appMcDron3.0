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
    actualizarIncluirRepuestoAsignacionAsync,
    actualizarRepuestosAsignacionAsync,
    cambiarEstadoReparacionAsync,
    eliminarIntervencionDeReparacionAsync,
    getIntervencionesPorReparacionAsync,
    cambiarEstadoAsignacionAsync,
} from "../../../redux-tool-kit/reparacion/reparacion.actions";
import { subirFotoInformeAsync, borrarFotoInformeAsync } from "../../../redux-tool-kit/app/app.actions";
import { selectColeccionIntervenciones, selectIntervencionesAsignables } from "../../../redux-tool-kit/intervencion/intervencion.selectors";
import { selectColeccionRepuestos } from "../../../redux-tool-kit/repuesto/repuesto.selectors";
import { selectDroneById } from "../../../redux-tool-kit/drone/drone.selectors";
import { AsignacionIntervencion, EstadoAsignacion, OrigenAsignacion, RepuestoAsignacionSnapshot } from "../../../types/intervencion";
import {
    evaluarAjusteRepuestosAsignacion,
    formatearListaRepuestos,
    normalizarRepuestosSnapshot,
} from "../../../usecases/repuestosAsignacion";
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
    const coleccionRepuestos = useAppSelector(state =>
        state.repuesto ? selectColeccionRepuestos(state) : {}
    );
    const [intervencionAdicionalSeleccionada, setIntervencionAdicionalSeleccionada] = useState<string | null>(null);
    const [incluirRepuestoAdicional, setIncluirRepuestoAdicional] = useState<boolean>(true);
    const [asignacionEditandoRepuestosId, setAsignacionEditandoRepuestosId] = useState<string | null>(null);
    const [borradorRepuestos, setBorradorRepuestos] = useState<RepuestoAsignacionSnapshot[]>([]);
    const [repuestoSustitutoSeleccionado, setRepuestoSustitutoSeleccionado] = useState<string | null>(null);
    const [guardandoRepuestosAsignacion, setGuardandoRepuestosAsignacion] = useState<boolean>(false);

    const intervencionAdicionalCatalogo = intervencionAdicionalSeleccionada
        ? catalogoIntervenciones[intervencionAdicionalSeleccionada]
        : undefined;
    const intervencionAdicionalTieneRepuestos = (intervencionAdicionalCatalogo?.data.RepuestosIds?.length || 0) > 0;

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
                incluirRepuesto: intervencionAdicionalTieneRepuestos ? incluirRepuestoAdicional : false,
            })).unwrap();
            setIntervencionAdicionalSeleccionada(null);
            setIncluirRepuestoAdicional(true);
        } catch (error: unknown) {
            openModal({
                mensaje: (error as { message?: string })?.message || "No se pudo agregar la intervención adicional.",
                tipo: "danger",
                titulo: "Error",
            });
        }
    };

    const handleCambiarIncluirRepuesto = async (
        asignacionId: string,
        intervencionId: string,
        incluirRepuesto: boolean,
    ) => {
        try {
            await dispatch(actualizarIncluirRepuestoAsignacionAsync({
                asignacionId,
                intervencionId,
                incluirRepuesto,
            })).unwrap();
        } catch (error: unknown) {
            openModal({
                mensaje: (error as { message?: string })?.message || "No se pudo actualizar el uso de repuestos.",
                tipo: "danger",
                titulo: "Error",
            });
        }
    };

    const obtenerNombreRepuesto = (partId: string): string =>
        coleccionRepuestos[partId]?.data?.NombreRepu || partId;

    const modeloDroneIdActual = drone?.data.ModeloDroneId;
    const opcionesRepuestosInventario = Object.values(coleccionRepuestos)
        .filter(rep => !rep.data.Obsoleta)
        .sort((a, b) => {
            const compA = modeloDroneIdActual && a.data.ModelosDroneIds?.includes(modeloDroneIdActual) ? 0 : 1;
            const compB = modeloDroneIdActual && b.data.ModelosDroneIds?.includes(modeloDroneIdActual) ? 0 : 1;
            if (compA !== compB) return compA - compB;
            return (a.data.NombreRepu || '').localeCompare(b.data.NombreRepu || '');
        })
        .map(rep => {
            const esCompatible = Boolean(
                modeloDroneIdActual && rep.data.ModelosDroneIds?.includes(modeloDroneIdActual)
            );
            const stock = Number(rep.data.StockRepu ?? 0);
            const prefijo = esCompatible ? '★ ' : '';
            return {
                value: rep.id,
                label: `${prefijo}${rep.data.NombreRepu} (Stock: ${stock})`,
            };
        });

    const handleAbrirEdicionRepuestos = (asignacion: AsignacionIntervencion) => {
        if (asignacionEditandoRepuestosId === asignacion.id) {
            setAsignacionEditandoRepuestosId(null);
            setBorradorRepuestos([]);
            setRepuestoSustitutoSeleccionado(null);
            return;
        }
        const intervencion = catalogoIntervenciones[asignacion.data.intervencionId];
        const evaluacion = evaluarAjusteRepuestosAsignacion(asignacion.data, intervencion);
        setAsignacionEditandoRepuestosId(asignacion.id);
        setBorradorRepuestos(evaluacion.repuestosEfectivos.map(item => ({ ...item })));
        setRepuestoSustitutoSeleccionado(null);
    };

    const handleReemplazarBorradorRepuesto = () => {
        if (!repuestoSustitutoSeleccionado) return;
        setBorradorRepuestos([{ partId: repuestoSustitutoSeleccionado, quantity: 1 }]);
        setRepuestoSustitutoSeleccionado(null);
    };

    const handleSumarBorradorRepuesto = () => {
        if (!repuestoSustitutoSeleccionado) return;
        setBorradorRepuestos(prev =>
            normalizarRepuestosSnapshot([
                ...prev,
                { partId: repuestoSustitutoSeleccionado, quantity: 1 },
            ])
        );
        setRepuestoSustitutoSeleccionado(null);
    };

    const handleCambiarCantidadBorrador = (partId: string, cantidadRaw: string) => {
        const cantidad = Math.max(1, Math.floor(Number(cantidadRaw) || 1));
        setBorradorRepuestos(prev =>
            prev.map(item => (item.partId === partId ? { ...item, quantity: cantidad } : item))
        );
    };

    const handleQuitarRepuestoBorrador = (partId: string) => {
        setBorradorRepuestos(prev => prev.filter(item => item.partId !== partId));
    };

    const handleGuardarRepuestosAsignacion = async (asignacionId: string, repuestosAGuardar: RepuestoAsignacionSnapshot[]) => {
        setGuardandoRepuestosAsignacion(true);
        try {
            await dispatch(actualizarRepuestosAsignacionAsync({
                asignacionId,
                repuestos: repuestosAGuardar,
                textoInformeActual: descripcionTec.value,
            })).unwrap();
            setAsignacionEditandoRepuestosId(null);
            setBorradorRepuestos([]);
            setRepuestoSustitutoSeleccionado(null);
        } catch (error: unknown) {
            openModal({
                mensaje: (error as { message?: string })?.message || "No se pudieron actualizar los repuestos de la tarea.",
                tipo: "danger",
                titulo: "Error",
            });
        } finally {
            setGuardandoRepuestosAsignacion(false);
        }
    };

    const handleRestaurarRepuestosOriginales = async (asignacionId: string) => {
        setGuardandoRepuestosAsignacion(true);
        try {
            await dispatch(actualizarRepuestosAsignacionAsync({
                asignacionId,
                restaurarOriginal: true,
                textoInformeActual: descripcionTec.value,
            })).unwrap();
            setAsignacionEditandoRepuestosId(null);
            setBorradorRepuestos([]);
            setRepuestoSustitutoSeleccionado(null);
        } catch (error: unknown) {
            openModal({
                mensaje: (error as { message?: string })?.message || "No se pudieron restaurar los repuestos originales.",
                tipo: "danger",
                titulo: "Error",
            });
        } finally {
            setGuardandoRepuestosAsignacion(false);
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
                                    onChange={(selected) => {
                                        setIntervencionAdicionalSeleccionada(selected?.value || null);
                                        setIncluirRepuestoAdicional(true);
                                    }}
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
                        {intervencionAdicionalTieneRepuestos && (
                            <div className="form-check mt-2">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="incluir-repuesto-adicional"
                                    checked={incluirRepuestoAdicional}
                                    onChange={(e) => setIncluirRepuestoAdicional(e.target.checked)}
                                />
                                <label className="form-check-label small" htmlFor="incluir-repuesto-adicional">
                                    Usar repuesto del taller
                                </label>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Lista simplificada de intervenciones con checks */}
                {asignaciones.length > 0 && (
                    <div className="mb-4">
                        <h6 className="mb-3">Tareas a Realizar</h6>
                        <div className="list-group">
                            {[...asignaciones]
                                .sort((a, b) => {
                                    const diferenciaPrecio = (b.data.PrecioTotal || 0) - (a.data.PrecioTotal || 0);
                                    // Desempate por id para que marcar un check no reordene la lista
                                    return diferenciaPrecio !== 0 ? diferenciaPrecio : a.id.localeCompare(b.id, undefined, { numeric: true });
                                })
                                .map((asignacion) => {
                                const intervencion = catalogoIntervenciones[asignacion.data.intervencionId];
                                const estaCompletada = asignacion.data.estado === EstadoAsignacion.COMPLETADA;
                                const tieneRepuestosAsociados = Array.isArray(asignacion.data.repuestosSnapshot)
                                    ? asignacion.data.repuestosSnapshot.length > 0
                                    : (intervencion?.data?.RepuestosIds?.length || 0) > 0;
                                const incluyeRepuestos = asignacion.data.incluyeRepuestosTaller ?? ((asignacion.data.PrecioPiezas || 0) > 0);
                                const evaluacionRepuestos = evaluarAjusteRepuestosAsignacion(asignacion.data, intervencion);
                                const puedeEditarRepuestosAsignacion =
                                    isAdmin &&
                                    (estadoActual === 'Aceptado' || estadoActual === 'Repuestos') &&
                                    asignacion.data.estado === EstadoAsignacion.PENDIENTE;
                                const puedeEditarAdicionalPendiente =
                                    puedeEditarRepuestosAsignacion &&
                                    asignacion.data.origen === OrigenAsignacion.ADICIONAL;
                                const editandoEstaAsignacion =
                                    puedeEditarRepuestosAsignacion &&
                                    asignacionEditandoRepuestosId === asignacion.id;
                                
                                return (
                                    <div 
                                        key={asignacion.id} 
                                        className="list-group-item py-2"
                                    >
                                        <div className="d-flex align-items-center">
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
                                                    {tieneRepuestosAsociados && !incluyeRepuestos && (
                                                        <span className="badge bg-secondary ms-2">Repuesto no incluido</span>
                                                    )}
                                                    {evaluacionRepuestos.tipoAjuste === 'sustituido' && (
                                                        <span className="badge bg-warning text-dark ms-2">Repuesto sustituto</span>
                                                    )}
                                                    {evaluacionRepuestos.tipoAjuste === 'sin_repuesto_stock' && (
                                                        <span className="badge bg-warning text-dark ms-2">Sin repuesto de stock</span>
                                                    )}
                                                </label>
                                            </div>
                                            {puedeEditarRepuestosAsignacion && (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-secondary ms-2"
                                                    title="Cambiar repuestos utilizados en esta tarea"
                                                    aria-label={`Cambiar repuestos de ${intervencion?.data?.NombreInt || 'intervención'}`}
                                                    onClick={() => handleAbrirEdicionRepuestos(asignacion)}
                                                >
                                                    <i className="bi bi-tools me-1"></i>
                                                    {editandoEstaAsignacion ? 'Cerrar' : 'Repuestos'}
                                                </button>
                                            )}
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
                                        {isAdmin && evaluacionRepuestos.repuestosEfectivos.length > 0 && (
                                            <div className="small text-muted mt-1 ms-4">
                                                Repuesto a usar: {formatearListaRepuestos(
                                                    evaluacionRepuestos.repuestosEfectivos,
                                                    obtenerNombreRepuesto,
                                                )}
                                            </div>
                                        )}
                                        {isAdmin && evaluacionRepuestos.tipoAjuste === 'sin_repuesto_stock' && (
                                            <div className="small text-muted mt-1 ms-4">
                                                Repuesto a usar: resuelto sin repuestos de stock
                                            </div>
                                        )}
                                        {puedeEditarAdicionalPendiente && tieneRepuestosAsociados && (
                                            <div className="form-check form-switch mt-1 ms-4">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    role="switch"
                                                    id={`usar-repuesto-${asignacion.id}`}
                                                    checked={incluyeRepuestos}
                                                    onChange={(e) => handleCambiarIncluirRepuesto(
                                                        asignacion.id,
                                                        asignacion.data.intervencionId,
                                                        e.target.checked,
                                                    )}
                                                />
                                                <label
                                                    className="form-check-label small text-muted"
                                                    htmlFor={`usar-repuesto-${asignacion.id}`}
                                                >
                                                    Usar repuesto del taller
                                                </label>
                                            </div>
                                        )}
                                        {editandoEstaAsignacion && (
                                            <div className="border rounded bg-light p-2 mt-2 ms-4">
                                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-1 mb-2">
                                                    <span className="small fw-semibold">
                                                        Ajustar repuestos efectivos de la tarea
                                                    </span>
                                                    {evaluacionRepuestos.repuestosCatalogo.length > 0 && (
                                                        <span className="small text-muted">
                                                            Catálogo: {formatearListaRepuestos(
                                                                evaluacionRepuestos.repuestosCatalogo,
                                                                obtenerNombreRepuesto,
                                                            )}
                                                        </span>
                                                    )}
                                                </div>

                                                {borradorRepuestos.length === 0 ? (
                                                    <div className="small text-muted fst-italic mb-2">
                                                        Sin repuestos de inventario seleccionados (no descontará stock).
                                                    </div>
                                                ) : (
                                                    <div className="d-flex flex-column gap-1 mb-2">
                                                        {borradorRepuestos.map(item => (
                                                            <div
                                                                key={item.partId}
                                                                className="d-flex align-items-center gap-2 bg-white border rounded px-2 py-1"
                                                            >
                                                                <span className="small flex-grow-1">
                                                                    {obtenerNombreRepuesto(item.partId)}
                                                                </span>
                                                                <input
                                                                    type="number"
                                                                    min={1}
                                                                    className="form-control form-control-sm"
                                                                    style={{ width: '70px' }}
                                                                    aria-label={`Cantidad de ${obtenerNombreRepuesto(item.partId)}`}
                                                                    value={item.quantity}
                                                                    onChange={(e) => handleCambiarCantidadBorrador(item.partId, e.target.value)}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-danger py-0 px-2"
                                                                    aria-label={`Quitar ${obtenerNombreRepuesto(item.partId)}`}
                                                                    onClick={() => handleQuitarRepuestoBorrador(item.partId)}
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="row g-2 align-items-center mb-2">
                                                    <div className="col">
                                                        <ComboBox
                                                            options={opcionesRepuestosInventario}
                                                            value={repuestoSustitutoSeleccionado || ''}
                                                            onChange={(selected) => setRepuestoSustitutoSeleccionado(selected?.value || null)}
                                                            placeholder="Buscar repuesto en inventario..."
                                                            noOptionsMessage="No se encontraron repuestos"
                                                            isClearable
                                                        />
                                                    </div>
                                                    {borradorRepuestos.length > 0 ? (
                                                        <>
                                                            <div className="col-auto">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    disabled={!repuestoSustitutoSeleccionado}
                                                                    onClick={handleReemplazarBorradorRepuesto}
                                                                >
                                                                    Reemplazar
                                                                </button>
                                                            </div>
                                                            <div className="col-auto">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-secondary"
                                                                    disabled={!repuestoSustitutoSeleccionado}
                                                                    onClick={handleSumarBorradorRepuesto}
                                                                >
                                                                    Sumar
                                                                </button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="col-auto">
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-primary"
                                                                disabled={!repuestoSustitutoSeleccionado}
                                                                onClick={handleSumarBorradorRepuesto}
                                                            >
                                                                Agregar repuesto
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="d-flex flex-wrap align-items-center gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm bg-bluemcdron text-white"
                                                        disabled={guardandoRepuestosAsignacion}
                                                        onClick={() => handleGuardarRepuestosAsignacion(asignacion.id, borradorRepuestos)}
                                                    >
                                                        Guardar repuestos
                                                    </button>
                                                    {borradorRepuestos.length > 0 && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-warning text-dark"
                                                            disabled={guardandoRepuestosAsignacion}
                                                            onClick={() => setBorradorRepuestos([])}
                                                        >
                                                            Sin repuesto de stock
                                                        </button>
                                                    )}
                                                    {evaluacionRepuestos.esAjustado && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-secondary"
                                                            disabled={guardandoRepuestosAsignacion}
                                                            onClick={() => handleRestaurarRepuestosOriginales(asignacion.id)}
                                                        >
                                                            Restaurar original
                                                        </button>
                                                    )}
                                                    {asignacion.data.origen !== OrigenAsignacion.ADICIONAL && (
                                                        <small className="text-muted ms-auto">
                                                            No altera el presupuesto acordado.
                                                        </small>
                                                    )}
                                                </div>
                                            </div>
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
