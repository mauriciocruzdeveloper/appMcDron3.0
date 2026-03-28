import React from "react";
import { useAppSelector } from "../../../redux-tool-kit/hooks/useAppSelector";
import { useAppDispatch } from "../../../redux-tool-kit/hooks/useAppDispatch";
import { useDebouncedField } from "../../../hooks/useDebouncedField";
import { 
    selectReparacionById, 
    selectSeccionesVisibles,
    selectPuedeAvanzarA,
    selectIntervencionesDeReparacionActual,
    selectTotalIntervenciones,
    selectPrecioManualDifiere,
} from "../../../redux-tool-kit/reparacion";
import { 
    cambiarEstadoReparacionAsync,
} from "../../../redux-tool-kit/reparacion/reparacion.actions";
import { enviarPresupuestoAsync, generarPDFPresupuestoAsync } from "../../../redux-tool-kit/app/app.actions";
import { obtenerEstadoSeguro } from "../../../utils/estadosHelper";
import { selectDroneById } from "../../../redux-tool-kit/drone/drone.selectors";
import IntervencionesReparacion from '../../IntervencionesReparacion.component';
import { useModal } from "../../Modal/useModal";

interface ReparacionPresupuestoProps {
    reparacionId: string;
    isAdmin: boolean;
}

export const ReparacionPresupuesto: React.FC<ReparacionPresupuestoProps> = ({ 
    reparacionId, 
    isAdmin 
}) => {
    const dispatch = useAppDispatch();
    const { openModal } = useModal();
    
    const reparacion = useAppSelector(state => selectReparacionById(reparacionId)(state));
    const drone = useAppSelector(state => 
        selectDroneById(reparacion?.data.DroneId || "")(state)
    );
    const intervencionesAplicadas = useAppSelector(selectIntervencionesDeReparacionActual);
    const totalIntervenciones = useAppSelector(selectTotalIntervenciones);
    const precioManualDifiere = useAppSelector(state => 
        selectPrecioManualDifiere(reparacionId)(state)
    );
    const seccionVisible = useAppSelector(state => 
        selectSeccionesVisibles(reparacionId, isAdmin)(state).presupuesto
    );
    const puedeAvanzarAPresupuestado = useAppSelector(state => 
        selectPuedeAvanzarA(reparacionId, 'Presupuestado')(state)
    );
    const puedeAvanzarAAceptado = useAppSelector(state => 
        selectPuedeAvanzarA(reparacionId, 'Aceptado')(state)
    );
    const puedeAvanzarARechazado = useAppSelector(state => 
        selectPuedeAvanzarA(reparacionId, 'Rechazado')(state)
    );

    // Bloqueo por estado: una vez presupuestado no se puede modificar el presupuesto
    const isPresupuestado = reparacion
        ? obtenerEstadoSeguro(reparacion.data.EstadoRep).etapa >= 6
        : false;

    // Usar debounce para campos numéricos
    const presuMo = useDebouncedField({
        reparacionId,
        campo: 'PresuMoRep',
        valorInicial: reparacion?.data.PresuMoRep || ""
    });

    const presuRe = useDebouncedField({
        reparacionId,
        campo: 'AdelantoRep',
        valorInicial: reparacion?.data.AdelantoRep || ""
    });

    const presuFi = useDebouncedField({
        reparacionId,
        campo: 'PresuFiRep',
        valorInicial: reparacion?.data.PresuFiRep || ""
    });

    // Actualizar PresuFiRep cuando cambia totalIntervenciones (por agregar/quitar
    // asignaciones o marcar/desmarcar checkbox de repuesto), SOLO si el admin no
    // modificó el total manualmente. Se detecta comparando el valor actual del campo
    // con el último total que el sistema calculó.
    const ultimoTotalCalculadoRef = React.useRef<number | null>(null);
    React.useEffect(() => {
        if (ultimoTotalCalculadoRef.current === null) {
            // Carga inicial: registrar el valor calculado sin pisar el campo (puede ser un total manual)
            ultimoTotalCalculadoRef.current = totalIntervenciones;
            return;
        }
        const valorActual = Number(presuFi.value) || 0;
        if (Math.abs(valorActual - ultimoTotalCalculadoRef.current) < 0.01) {
            // El campo sigue igual al último total calculado → el admin no lo tocó, actualizamos
            presuFi.onChange(String(totalIntervenciones));
        }
        ultimoTotalCalculadoRef.current = totalIntervenciones;
    }, [totalIntervenciones]); // eslint-disable-line

    const diagnostico = useDebouncedField({
        reparacionId,
        campo: 'PresuDiRep',
        valorInicial: reparacion?.data.PresuDiRep || ""
    });

    if (!seccionVisible || !reparacion) return null;

    const formatPrice = (precio: number): string => {
        return precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
    };

    const avanzarAPresupuestado = () => {
        dispatch(cambiarEstadoReparacionAsync({
            reparacionId,
            nuevoEstado: 'Presupuestado',
            enviarEmail: false
        }));
    };

    const avanzarAAceptado = () => {
        dispatch(cambiarEstadoReparacionAsync({
            reparacionId,
            nuevoEstado: 'Aceptado',
            enviarEmail: false
        }));
    };

    const avanzarARechazado = () => {
        dispatch(cambiarEstadoReparacionAsync({
            reparacionId,
            nuevoEstado: 'Rechazado',
            enviarEmail: false
        }));
    };

    const enviarPresupuesto = async () => {
        if (!reparacion) return;

        try {
            await dispatch(enviarPresupuestoAsync({ reparacion })).unwrap();
            openModal({
                mensaje: "Presupuesto enviado correctamente por email.",
                tipo: "success",
                titulo: "Presupuesto Enviado",
            });
        } catch (error: unknown) {
            openModal({
                mensaje: (error as { message?: string })?.message || "Error al enviar el presupuesto.",
                tipo: "danger",
                titulo: "Error",
            });
        }
    };

    const generarPDF = async () => {
        if (!reparacion) return;

        try {
            await dispatch(generarPDFPresupuestoAsync({ reparacion })).unwrap();
            openModal({
                mensaje: "PDF del presupuesto generado. Se abrirá en una nueva pestaña.",
                tipo: "success",
                titulo: "PDF Generado",
            });
        } catch (error: unknown) {
            openModal({
                mensaje: (error as { message?: string })?.message || "Error al generar el PDF del presupuesto.",
                tipo: "danger",
                titulo: "Error",
            });
        }
    };

    return (
        <div className="card mb-3" id="seccion-presupuesto">
            <div className="card-body">
                <h5 className="card-title bluemcdron">PRESUPUESTO</h5>
                <h6 className="card-title bluemcdron">INTERVENCIONES</h6>
                <IntervencionesReparacion
                    reparacionId={reparacionId}
                    readOnly={!isAdmin || isPresupuestado}
                    modeloDroneId={drone?.data.ModeloDroneId}
                />
                <h6 className="card-title bluemcdron">PRECIO</h6>
                <div>
                    <label className="form-label">
                        Presupuesto Mano de Obra $
                        {presuMo.isSaving && <small className="text-muted ms-2">Guardando...</small>}
                    </label>
                    <input
                        onChange={(e) => presuMo.onChange(e.target.value)}
                        type="number"
                        className="form-control"
                        id="PresuMoRep"
                        value={presuMo.value}
                        disabled={!isAdmin}
                    />
                </div>
                <div>
                    <label className="form-label">
                        Adelanto $
                        {presuRe.isSaving && <small className="text-muted ms-2">Guardando...</small>}
                    </label>
                    <input
                        onChange={(e) => presuRe.onChange(e.target.value)}
                        type="number"
                        className="form-control"
                        id="AdelantoRep"
                        value={presuRe.value}
                        disabled={!isAdmin}
                    />
                </div>
                <div>
                    <label className="form-label">
                        Presupuesto Final $
                        {presuFi.isSaving && <small className="text-muted ms-2">Guardando...</small>}
                    </label>
                    <input
                        onChange={(e) => presuFi.onChange(e.target.value)}
                        type="number"
                        className="form-control"
                        id="PresuFiRep"
                        value={presuFi.value}
                        disabled={!isAdmin}
                        title="El precio se calcula automáticamente en base a las intervenciones, o puede ingresar un valor manual"
                    />
                    {isAdmin && intervencionesAplicadas.length > 0 && (
                        <small className="form-text text-muted">
                            {Math.abs(totalIntervenciones - (Number(presuFi.value) || 0)) > 0.01
                                ? `El precio actual difiere del total de intervenciones (${formatPrice(totalIntervenciones)})`
                                : `Precio calculado a partir de las intervenciones: ${formatPrice(totalIntervenciones)}`}
                        </small>
                    )}
                </div>
                <div>
                    <label className="form-label">
                        Diagnóstico $
                        {diagnostico.isSaving && <small className="text-muted ms-2">Guardando...</small>}
                    </label>
                    <input
                        onChange={(e) => diagnostico.onChange(e.target.value)}
                        type="number"
                        className="form-control"
                        id="PresuDiRep"
                        value={diagnostico.value}
                        disabled={!isAdmin}
                    />
                </div>

                {isAdmin && (
                    <div className="mt-3">
                        {/* Botones para enviar presupuesto por email o generar PDF */}
                        {intervencionesAplicadas.length > 0 && (
                            <div className="mb-3">
                                <div className="d-flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={enviarPresupuesto}
                                    >
                                        <i className="bi bi-envelope me-2"></i>
                                        Enviar por Email
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={generarPDF}
                                    >
                                        <i className="bi bi-file-pdf me-2"></i>
                                        Descargar PDF
                                    </button>
                                </div>
                                <small className="form-text text-muted d-block mt-1">
                                    Enviar el presupuesto por email o descargar como PDF
                                </small>
                            </div>
                        )}

                        {puedeAvanzarAPresupuestado && (
                            <div className="mb-2">
                                <button
                                    type="button"
                                    className="btn btn-warning"
                                    onClick={avanzarAPresupuestado}
                                >
                                    Marcar como Presupuestado
                                </button>
                            </div>
                        )}

                        {(puedeAvanzarAAceptado || puedeAvanzarARechazado) && (
                            <div className="d-flex flex-wrap gap-2">
                                {puedeAvanzarAAceptado && (
                                    <button
                                        type="button"
                                        className="btn btn-success flex-fill"
                                        style={{ minWidth: '140px' }}
                                        onClick={avanzarAAceptado}
                                    >
                                        Presupuesto Aceptado
                                    </button>
                                )}
                                {puedeAvanzarARechazado && (
                                    <button
                                        type="button"
                                        className="btn btn-danger flex-fill"
                                        style={{ minWidth: '140px' }}
                                        onClick={avanzarARechazado}
                                    >
                                        Presupuesto Rechazado
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
