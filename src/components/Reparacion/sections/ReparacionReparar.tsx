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

    if (!seccionVisible || !reparacion) return null;

    const handleOnChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const target = event.target;
        let value = target.value;
        
        if ((target as HTMLInputElement).type === "date") {
            const anio = Number(target.value.substr(0, 4));
            const mes = Number(target.value.substr(5, 2)) - 1;
            const dia = Number(target.value.substr(8, 2));
            value = String(Number(new Date(anio, mes, dia).getTime()) + 10800001);
        }
        
        const field = target.id;
        dispatch(actualizarCampoReparacionAsync({ 
            reparacionId, 
            campo: field as any, 
            valor: value 
        }));
    };

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
                    <label className="form-label">Informe de Reparación o Diagnóstico</label>
                    <TextareaAutosize
                        onChange={handleOnChange}
                        className="form-control"
                        id="DescripcionTecRep"
                        value={reparacion.data.DescripcionTecRep || ""}
                        rows={5}
                        disabled={!isAdmin}
                    />
                </div>
                <div>
                    <label className="form-label">Fecha Finalizacion</label>
                    <input
                        onChange={handleOnChange}
                        type="date"
                        className="form-control"
                        id="FeFinRep"
                        value={convertTimestampCORTO(reparacion.data.FeFinRep)}
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
