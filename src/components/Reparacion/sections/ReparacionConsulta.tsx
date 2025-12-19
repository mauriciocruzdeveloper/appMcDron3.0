import React, { ChangeEvent } from "react";
import { useAppSelector } from "../../../redux-tool-kit/hooks/useAppSelector";
import { useAppDispatch } from "../../../redux-tool-kit/hooks/useAppDispatch";
import { useHistory } from "../../../hooks/useHistory";
import { 
    selectReparacionById, 
    selectSeccionesVisibles,
    selectPuedeAvanzarA,
} from "../../../redux-tool-kit/reparacion";
import { 
    actualizarCampoReparacionAsync,
    cambiarEstadoReparacionAsync,
} from "../../../redux-tool-kit/reparacion/reparacion.actions";
import { selectUsuarioPorId } from "../../../redux-tool-kit/usuario/usuario.selectors";
import { selectDronesByPropietario } from "../../../redux-tool-kit/drone/drone.selectors";
import { selectModeloDronePorId } from "../../../redux-tool-kit/modeloDrone/modeloDrone.selectors";
import { enviarSms } from "../../../utils/utils";
import { enviarEmailVacio } from "../../../utils/sendEmails";
import { convertTimestampCORTO } from "../../../utils/utils";
import TextareaAutosize from "react-textarea-autosize";

interface ReparacionConsultaProps {
    reparacionId: string;
    isAdmin: boolean;
}

export const ReparacionConsulta: React.FC<ReparacionConsultaProps> = ({ 
    reparacionId, 
    isAdmin 
}) => {
    const dispatch = useAppDispatch();
    const history = useHistory();
    
    const reparacion = useAppSelector(state => selectReparacionById(reparacionId)(state));
    const usuario = useAppSelector(state => 
        selectUsuarioPorId(state, reparacion?.data.UsuarioRep || "")
    );
    const dronesDelCliente = useAppSelector(state => 
        selectDronesByPropietario(usuario?.id || "")(state)
    );
    const seccionVisible = useAppSelector(state => 
        selectSeccionesVisibles(reparacionId, isAdmin)(state).consulta
    );
    const puedeAvanzarARespondido = useAppSelector(state => 
        selectPuedeAvanzarA(reparacionId, 'Respondido')(state)
    );
    const puedeAvanzarATransito = useAppSelector(state => 
        selectPuedeAvanzarA(reparacionId, 'Transito')(state)
    );

    if (!seccionVisible || !reparacion) return null;

    const handleOnChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    const handleDroneChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const droneId = event.target.value;
        dispatch(actualizarCampoReparacionAsync({ 
            reparacionId, 
            campo: 'DroneId', 
            valor: droneId 
        }));
    };

    const handleGoToUser = () => {
        if (!usuario?.id) return;
        history.push(`/inicio/usuarios/${usuario.id}`);
    };

    const handleSendEmail = () => {
        if (!reparacion) return;
        enviarEmailVacio(reparacion);
    };

    const handleSendSms = () => {
        const data = {
            number: usuario?.data?.TelefonoUsu || '',
            message: 'Prueba de sms',
            options: {
                replaceLineBreaks: false,
                android: { intent: 'INTENT' }
            },
            success: () => null,
            error: (e: unknown) => alert('Message Failed:' + e)
        };
        enviarSms(data);
    };

    const avanzarARespondido = () => {
        dispatch(cambiarEstadoReparacionAsync({
            reparacionId,
            nuevoEstado: 'Respondido',
            enviarEmail: false
        }));
    };

    const avanzarATransito = () => {
        dispatch(cambiarEstadoReparacionAsync({
            reparacionId,
            nuevoEstado: 'Transito',
            enviarEmail: false
        }));
    };

    return (
        <div className="card mb-3" id="seccion-consulta">
            <div className="card-body">
                <div className="d-flex w-100 justify-content-between align-items-center">
                    <h5 className="card-title bluemcdron">CONSULTA</h5>
                    <button
                        type="button"
                        className="btn btn-outline-secondary bg-bluemcdron text-white"
                        onClick={handleGoToUser}
                    >
                        Ir al Cliente
                    </button>
                </div>
                <div>
                    <label className="form-label">Fecha de Cosulta</label>
                    <input
                        type="date"
                        className="form-control"
                        id="FeConRep"
                        value={convertTimestampCORTO(reparacion.data.FeConRep)}
                        disabled
                    />
                </div>
                <div>
                    <label className="form-label">Email Cliente</label>
                    <div className="d-flex w-100 justify-content-between">
                        <input
                            type="text"
                            className="form-control"
                            id="EmailUsu"
                            value={usuario?.data?.EmailUsu || ''}
                            disabled
                        />
                        <button
                            type="submit"
                            className="btn btn-outline-secondary bg-bluemcdron text-white"
                            onClick={handleSendEmail}
                        >
                            <i className="bi bi-envelope"></i>
                        </button>
                    </div>
                </div>
                <div>
                    <label className="form-label">Nombre Cliente</label>
                    <input
                        type="text"
                        className="form-control"
                        id="NombreUsu"
                        value={usuario?.data?.NombreUsu}
                        disabled
                    />
                </div>
                <div>
                    <label className="form-label">Apellido Cliente</label>
                    <input
                        type="text"
                        className="form-control"
                        id="ApellidoUsu"
                        value={usuario?.data?.ApellidoUsu}
                        disabled
                    />
                </div>
                <div>
                    <label className="form-label">Teléfono Cliente</label>
                    <div className="d-flex w-100 justify-content-between">
                        <input
                            type="tel"
                            className="form-control"
                            id="TelefonoUsu"
                            value={usuario?.data?.TelefonoUsu}
                            disabled
                        />
                        <button
                            type="submit"
                            className="btn btn-outline-secondary bg-bluemcdron text-white"
                            onClick={handleSendSms}
                        >
                            <i className="bi bi-chat-left-text"></i>
                        </button>
                    </div>
                </div>
                <div>
                    <label className="form-label">Nombre del Drone</label>
                    <select
                        className="form-control"
                        id="DroneId"
                        value={reparacion.data.DroneId || ""}
                        onChange={handleDroneChange}
                        disabled={!isAdmin}
                    >
                        <option value="">Seleccione un drone</option>
                        {dronesDelCliente.map(drone => (
                            <option key={drone.id} value={drone.id}>
                                {drone.data.Nombre || `Drone sin nombre (${drone.id})`}
                            </option>
                        ))}
                    </select>
                    {dronesDelCliente.length === 0 && usuario?.id && (
                        <small className="form-text text-muted">
                            El cliente no tiene drones registrados
                        </small>
                    )}
                </div>
                <div>
                    <label className="form-label">Modelo del Drone</label>
                    <input
                        type="text"
                        className="form-control"
                        id="ModeloDroneNameRep"
                        value={reparacion.data.ModeloDroneNameRep || ""}
                        onChange={handleOnChange}
                        disabled={!isAdmin}
                    />
                </div>
                <div>
                    <label className="form-label">Desperfectos o Roturas</label>
                    <TextareaAutosize
                        onChange={handleOnChange}
                        className="form-control"
                        id="DescripcionUsuRep"
                        value={reparacion.data.DescripcionUsuRep || ""}
                        disabled={!isAdmin}
                    />
                </div>

                {isAdmin && (
                    <div className="d-flex flex-wrap gap-2 mt-3">
                        {puedeAvanzarARespondido && (
                            <button
                                type="button"
                                className="btn btn-success flex-fill"
                                style={{ minWidth: '140px' }}
                                onClick={avanzarARespondido}
                            >
                                Marcar como Respondido
                            </button>
                        )}
                        {puedeAvanzarATransito && (
                            <button
                                type="button"
                                className="btn btn-warning flex-fill"
                                style={{ minWidth: '140px' }}
                                onClick={avanzarATransito}
                            >
                                Marcar en Tránsito
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
