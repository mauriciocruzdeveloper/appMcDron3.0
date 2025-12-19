import React, { ChangeEvent } from "react";
import { useAppSelector } from "../../../redux-tool-kit/hooks/useAppSelector";
import { useAppDispatch } from "../../../redux-tool-kit/hooks/useAppDispatch";
import { useModal } from "../../Modal/useModal";
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

    if (!seccionVisible || !reparacion) return null;

    const handleOnChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const target = event.target;
        const field = target.id;
        const value = target.value;
        
        dispatch(actualizarCampoReparacionAsync({ 
            reparacionId, 
            campo: field as any, 
            valor: value 
        }));
    };

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
                    <label className="form-label">Número de Serie</label>
                    <input
                        onChange={handleOnChange}
                        type="text"
                        className="form-control"
                        id="NumeroSerieRep"
                        value={reparacion.data.NumeroSerieRep || ""}
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
                    <label className="form-label">Observaciones del Técnico</label>
                    <TextareaAutosize
                        onChange={handleOnChange}
                        className="form-control"
                        id="DiagnosticoRep"
                        value={reparacion.data.DiagnosticoRep || ""}
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
