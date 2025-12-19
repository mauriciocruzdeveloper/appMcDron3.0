import React, { ChangeEvent } from "react";
import { useAppSelector } from "../../../redux-tool-kit/hooks/useAppSelector";
import { useAppDispatch } from "../../../redux-tool-kit/hooks/useAppDispatch";
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

interface ReparacionEntregaProps {
    reparacionId: string;
    isAdmin: boolean;
}

export const ReparacionEntrega: React.FC<ReparacionEntregaProps> = ({ 
    reparacionId, 
    isAdmin 
}) => {
    const dispatch = useAppDispatch();
    
    const reparacion = useAppSelector(state => selectReparacionById(reparacionId)(state));
    const seccionVisible = useAppSelector(state => 
        selectSeccionesVisibles(reparacionId, isAdmin)(state).entrega
    );
    const puedeAvanzarACobrado = useAppSelector(state => 
        selectPuedeAvanzarA(reparacionId, 'Cobrado')(state)
    );
    const puedeAvanzarAEnviado = useAppSelector(state => 
        selectPuedeAvanzarA(reparacionId, 'Enviado')(state)
    );
    const puedeAvanzarAFinalizado = useAppSelector(state => 
        selectPuedeAvanzarA(reparacionId, 'Finalizado')(state)
    );
    const puedeAvanzarAAbandonado = useAppSelector(state => 
        selectPuedeAvanzarA(reparacionId, 'Abandonado')(state)
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

    const avanzarACobrado = () => {
        dispatch(cambiarEstadoReparacionAsync({
            reparacionId,
            nuevoEstado: 'Cobrado',
            enviarEmail: false
        }));
    };

    const avanzarAEnviado = () => {
        dispatch(cambiarEstadoReparacionAsync({
            reparacionId,
            nuevoEstado: 'Enviado',
            enviarEmail: false
        }));
    };

    const avanzarAFinalizado = () => {
        dispatch(cambiarEstadoReparacionAsync({
            reparacionId,
            nuevoEstado: 'Finalizado',
            enviarEmail: false
        }));
    };

    const avanzarAAbandonado = () => {
        dispatch(cambiarEstadoReparacionAsync({
            reparacionId,
            nuevoEstado: 'Abandonado',
            enviarEmail: false
        }));
    };

    return (
        <div className="card mb-3" id="seccion-entrega">
            <div className="card-body">
                <h5 className="card-title bluemcdron">ENTREGA</h5>
                <div>
                    <label className="form-label">Fecha Entrega</label>
                    <input
                        onChange={handleOnChange}
                        type="date"
                        className="form-control"
                        id="FeEntRep"
                        value={convertTimestampCORTO(reparacion.data.FeEntRep)}
                        disabled={!isAdmin}
                    />
                </div>
                <div>
                    <label className="form-label">Cliente, Comisionista, Correo, Seguimiento</label>
                    <TextareaAutosize
                        onChange={handleOnChange}
                        className="form-control"
                        id="TxtEntregaRep"
                        value={reparacion.data.TxtEntregaRep || ""}
                        rows={5}
                        disabled={!isAdmin}
                    />
                </div>
                <div>
                    <label className="form-label">Nro. de Seguimiento</label>
                    <input
                        onChange={handleOnChange}
                        type="text"
                        className="form-control"
                        id="SeguimientoEntregaRep"
                        value={reparacion.data.SeguimientoEntregaRep || ""}
                        disabled={!isAdmin}
                    />
                </div>

                {isAdmin && (
                    <div className="mt-3">
                        <div className="d-flex flex-wrap gap-2 mb-2">
                            {(reparacion.data.EstadoRep === 'Reparado' || reparacion.data.EstadoRep === 'Diagnosticado') && puedeAvanzarACobrado && (
                                <button
                                    type="button"
                                    className="btn btn-info flex-fill"
                                    style={{ minWidth: '140px' }}
                                    onClick={avanzarACobrado}
                                >
                                    Marcar como Cobrado
                                </button>
                            )}
                            {puedeAvanzarAEnviado && (
                                <button
                                    type="button"
                                    className="btn btn-warning flex-fill"
                                    style={{ minWidth: '140px' }}
                                    onClick={avanzarAEnviado}
                                >
                                    Marcar como Enviado
                                </button>
                            )}
                        </div>

                        <div className="d-flex flex-wrap gap-2">
                            {puedeAvanzarAFinalizado && (
                                <button
                                    type="button"
                                    className="btn btn-success flex-fill"
                                    style={{ minWidth: '140px' }}
                                    onClick={avanzarAFinalizado}
                                >
                                    Finalizar Reparación
                                </button>
                            )}
                            {puedeAvanzarAAbandonado && (
                                <button
                                    type="button"
                                    className="btn btn-secondary flex-fill"
                                    style={{ minWidth: '140px' }}
                                    onClick={avanzarAAbandonado}
                                >
                                    Marcar como Abandonado
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
