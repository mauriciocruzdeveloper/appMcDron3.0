import React from "react";
import { useAppSelector } from "../../../redux-tool-kit/hooks/useAppSelector";
import { selectReparacionById } from "../../../redux-tool-kit/reparacion";
import { estados } from "../../../datos/estados";
import { obtenerEstadoSeguro, esEstadoLegacy } from "../../../utils/estadosHelper";

interface ReparacionProgresoProps {
    reparacionId: string;
}

export const ReparacionProgreso: React.FC<ReparacionProgresoProps> = ({ reparacionId }) => {
    const reparacion = useAppSelector(state => selectReparacionById(reparacionId)(state));

    if (!reparacion) return null;

    const estadosOrdenados = [
        'Consulta', 'Respondido', 'Transito', 'Recibido', 'Revisado',
        'Presupuestado', 'Aceptado', 'Repuestos', 'Rechazado', 'Reparado', 
        'Diagnosticado', 'Cobrado', 'Enviado', 'Finalizado', 'Abandonado', 'Cancelado'
    ];

    const estadoActual = obtenerEstadoSeguro(reparacion.data.EstadoRep);
    const etapaActual = estadoActual.etapa;

    return (
        <div className="card mb-3">
            <div className="card-body">
                <h5 className="card-title bluemcdron">PROGRESO DE LA REPARACIÓN</h5>
                <div className="row">
                    {estadosOrdenados.map((nombreEstado) => {
                        const estado = estados[nombreEstado];
                        const completado = estado.etapa <= etapaActual && !esEstadoLegacy(reparacion.data.EstadoRep);
                        const esActual = estado.nombre === reparacion.data.EstadoRep;

                        return (
                            <div key={nombreEstado} className="col-6 col-md-4 col-lg-3 mb-2">
                                <div
                                    className={`d-flex align-items-center p-2 rounded ${
                                        esActual ? 'border border-dark' : ''
                                    }`}
                                    style={{
                                        backgroundColor: completado || esActual ? estado.color : '#e9ecef',
                                        color: completado || esActual ? 'white' : '#6c757d',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    <div className="me-2">
                                        {completado && !esActual ? '✓' : esActual ? '●' : '○'}
                                    </div>
                                    <div className="text-truncate">
                                        {estado.nombre}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {esEstadoLegacy(reparacion.data.EstadoRep) && (
                    <div className="mt-2">
                        <small className="text-muted">
                            * Estado legacy detectado. El progreso no se puede calcular automáticamente.
                        </small>
                    </div>
                )}
            </div>
        </div>
    );
};
