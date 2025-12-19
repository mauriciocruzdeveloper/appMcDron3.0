import React, { ChangeEvent } from "react";
import { useAppSelector } from "../../../redux-tool-kit/hooks/useAppSelector";
import { useAppDispatch } from "../../../redux-tool-kit/hooks/useAppDispatch";
import { 
    selectReparacionById, 
    selectSeccionesVisibles,
    selectPuedeAvanzarA,
    selectIntervencionesDeReparacionActual,
    selectTotalIntervenciones,
    selectPrecioManualDifiere,
} from "../../../redux-tool-kit/reparacion";
import { 
    actualizarCampoReparacionAsync,
    cambiarEstadoReparacionAsync,
} from "../../../redux-tool-kit/reparacion/reparacion.actions";
import { selectDroneById } from "../../../redux-tool-kit/drone/drone.selectors";
import IntervencionesReparacion from '../../IntervencionesReparacion.component';

interface ReparacionPresupuestoProps {
    reparacionId: string;
    isAdmin: boolean;
}

export const ReparacionPresupuesto: React.FC<ReparacionPresupuestoProps> = ({ 
    reparacionId, 
    isAdmin 
}) => {
    const dispatch = useAppDispatch();
    
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

    if (!seccionVisible || !reparacion) return null;

    const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
        const target = event.target;
        const field = target.id;
        const value = target.value;
        
        dispatch(actualizarCampoReparacionAsync({ 
            reparacionId, 
            campo: field as any, 
            valor: value 
        }));
    };

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

    return (
        <div className="card mb-3" id="seccion-presupuesto">
            <div className="card-body">
                <h5 className="card-title bluemcdron">PRESUPUESTO</h5>
                <h6 className="card-title bluemcdron">INTERVENCIONES</h6>
                <IntervencionesReparacion
                    reparacionId={reparacionId}
                    readOnly={!isAdmin}
                    modeloDroneId={drone?.data.ModeloDroneId}
                />
                <h6 className="card-title bluemcdron">PRECIO</h6>
                <div>
                    <label className="form-label">Presupuesto Mano de Obra $</label>
                    <input
                        onChange={handleOnChange}
                        type="number"
                        className="form-control"
                        id="PresuMoRep"
                        value={reparacion.data.PresuMoRep || ""}
                        disabled={!isAdmin}
                    />
                </div>
                <div>
                    <label className="form-label">Presupuesto Repuestos $</label>
                    <input
                        onChange={handleOnChange}
                        type="number"
                        className="form-control"
                        id="PresuReRep"
                        value={reparacion.data.PresuReRep || ""}
                        disabled={!isAdmin}
                    />
                </div>
                <div>
                    <label className="form-label">Presupuesto Final $</label>
                    <input
                        onChange={handleOnChange}
                        type="number"
                        className="form-control"
                        id="PresuFiRep"
                        value={reparacion.data.PresuFiRep || ""}
                        disabled={!isAdmin}
                        title="El precio se calcula automáticamente en base a las intervenciones, o puede ingresar un valor manual"
                    />
                    {isAdmin && intervencionesAplicadas.length > 0 && (
                        <small className="form-text text-muted">
                            {precioManualDifiere
                                ? `El precio actual difiere del total de intervenciones (${formatPrice(totalIntervenciones)})`
                                : `Precio calculado a partir de las intervenciones: ${formatPrice(totalIntervenciones)}`}
                        </small>
                    )}
                </div>
                <div>
                    <label className="form-label">Diagnóstico $</label>
                    <input
                        onChange={handleOnChange}
                        type="number"
                        className="form-control"
                        id="PresuDiRep"
                        value={reparacion.data.PresuDiRep || ""}
                        disabled={!isAdmin}
                    />
                </div>

                {isAdmin && (
                    <div className="mt-3">
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
