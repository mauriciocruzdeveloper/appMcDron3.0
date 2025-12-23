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

    // Usar debounce para campo de texto
    const descripcionTec = useDebouncedField({
        reparacionId,
        campo: 'DescripcionTecRep',
        valorInicial: reparacion?.data.DescripcionTecRep || "",
        delay: 2000 // 2 segundos para informes largos
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

    return (
        <div className="card mb-3" id="seccion-reparar">
            <div className="card-body">
                <h5 className="card-title bluemcdron">REPARAR</h5>
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
