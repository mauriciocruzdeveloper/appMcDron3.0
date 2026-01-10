import React, { ChangeEvent } from "react";
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
    actualizarCampoReparacionAsync,
    cambiarEstadoReparacionAsync,
    generarYGuardarDiagnosticoAsync,
} from "../../../redux-tool-kit/reparacion/reparacion.actions";
import TextareaAutosize from "react-textarea-autosize";

interface ReparacionRevisionProps {
    reparacionId: string;
    isAdmin: boolean;
}

export const ReparacionRevision: React.FC<ReparacionRevisionProps> = ({ 
    reparacionId, 
    isAdmin 
}) => {
    const dispatch = useAppDispatch();
    const { openModal } = useModal();
    
    const reparacion = useAppSelector(state => selectReparacionById(reparacionId)(state));
    const seccionVisible = useAppSelector(state => 
        selectSeccionesVisibles(reparacionId, isAdmin)(state).revision
    );
    const puedeAvanzarARevisado = useAppSelector(state => 
        selectPuedeAvanzarA(reparacionId, 'Revisado')(state)
    );

    // Usar debounce para campos de texto
    const numeroSerie = useDebouncedField({
        reparacionId,
        campo: 'NumeroSerieRep',
        valorInicial: reparacion?.data.NumeroSerieRep || "",
        delay: 1000 // 1 segundo después de dejar de escribir
    });

    const diagnostico = useDebouncedField({
        reparacionId,
        campo: 'DiagnosticoRep',
        valorInicial: reparacion?.data.DiagnosticoRep || "",
        delay: 1500 // 1.5 segundos para campos más largos
    });

    if (!seccionVisible || !reparacion) return null;

    const handleGenerarAutoDiagnostico = async () => {
        const response = await dispatch(generarYGuardarDiagnosticoAsync(reparacionId));
        if (response.meta.requestStatus === 'rejected') {
            openModal({
                mensaje: "Error al generar el diagnóstico.",
                tipo: "danger",
                titulo: "Generar Diagnóstico",
            });
        }
    };

    const avanzarARevisado = () => {
        dispatch(cambiarEstadoReparacionAsync({
            reparacionId,
            nuevoEstado: 'Revisado',
            enviarEmail: false
        }));
    };

    return (
        <div className="card mb-3" id="seccion-revision">
            <div className="card-body">
                <h5 className="card-title bluemcdron">REVISIÓN</h5>
                <div>
                    <label className="form-label">
                        Número de Serie
                        {numeroSerie.isSaving && <small className="text-muted ms-2">Guardando...</small>}
                    </label>
                    <input
                        onChange={(e) => numeroSerie.onChange(e.target.value)}
                        type="text"
                        className="form-control"
                        id="NumeroSerieRep"
                        value={numeroSerie.value}
                        disabled={!isAdmin}
                    />
                </div>
                <div className="d-flex w-100 justify-content-between align-items-center">
                    <label className="form-label">Autodiagnóstico</label>
                    {isAdmin && (
                        <button
                            type="button"
                            className="btn btn-outline-secondary bg-bluemcdron text-white"
                            onClick={handleGenerarAutoDiagnostico}
                        >
                            <i className="bi bi-arrow-repeat"></i>
                        </button>
                    )}
                </div>
                <div>
                    <label className="form-label">
                        Observaciones del Técnico
                        {diagnostico.isSaving && <small className="text-muted ms-2">Guardando...</small>}
                    </label>
                    <TextareaAutosize
                        onChange={(e) => diagnostico.onChange(e.target.value)}
                        className="form-control"
                        id="DiagnosticoRep"
                        value={diagnostico.value}
                        rows={5}
                        disabled={!isAdmin}
                    />
                </div>

                {isAdmin && puedeAvanzarARevisado && (
                    <div className="mt-3">
                        <button
                            type="button"
                            className="btn btn-info"
                            onClick={avanzarARevisado}
                        >
                            Marcar como Revisado
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
