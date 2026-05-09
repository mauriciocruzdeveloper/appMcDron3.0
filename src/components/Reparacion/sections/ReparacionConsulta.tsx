import React, { ChangeEvent } from "react";
import { useAppSelector } from "../../../redux-tool-kit/hooks/useAppSelector";
import { useAppDispatch } from "../../../redux-tool-kit/hooks/useAppDispatch";
import { useHistory } from "../../../hooks/useHistory";
import { useDebouncedField } from "../../../hooks/useDebouncedField";
import { 
    selectReparacionById, 
    selectSeccionesVisibles,
    selectPuedeAvanzarA,
} from "../../../redux-tool-kit/reparacion";
import { 
    actualizarCampoReparacionAsync,
    cambiarEstadoReparacionAsync,
    cambiarModeloDroneEnReparacionAsync,
} from "../../../redux-tool-kit/reparacion/reparacion.actions";
import { selectModeloDroneIdByReparacionId } from "../../../redux-tool-kit/reparacion/reparacion.selectors";
import { selectUsuarioPorId } from "../../../redux-tool-kit/usuario/usuario.selectors";
import { selectDronesByPropietario } from "../../../redux-tool-kit/drone/drone.selectors";
import { selectModelosDroneOrdenados } from "../../../redux-tool-kit/modeloDrone/modeloDrone.selectors";
import { enviarSms, getEmailForNotifications } from "../../../utils/utils";
import { enviarEmailVacio } from "../../../utils/sendEmails";
import { convertTimestampCORTO } from "../../../utils/utils";
import { SectionCard, FormField, FormTextarea, AppButton } from "../../ui";

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
    const modeloDroneIdActual = useAppSelector(state => 
        selectModeloDroneIdByReparacionId(reparacionId)(state)
    );
    const modelosDrone = useAppSelector(selectModelosDroneOrdenados);

    // Usar debounce para campos de texto
    const modeloDrone = useDebouncedField({
        reparacionId,
        campo: 'ModeloDroneNameRep',
        valorInicial: reparacion?.data.ModeloDroneNameRep || ""
    });

    const descripcionUsu = useDebouncedField({
        reparacionId,
        campo: 'DescripcionUsuRep',
        valorInicial: reparacion?.data.DescripcionUsuRep || ""
    });

    if (!seccionVisible || !reparacion) return null;

    const handleDroneChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const droneId = event.target.value;
        dispatch(actualizarCampoReparacionAsync({ 
            reparacionId, 
            campo: 'DroneId', 
            valor: droneId 
        }));
    };

    const handleModeloDroneChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const nuevoModeloDroneId = event.target.value;
        if (!nuevoModeloDroneId || !reparacion.data.DroneId) return;
        dispatch(cambiarModeloDroneEnReparacionAsync({
            reparacionId,
            nuevoModeloDroneId,
        }));
    };

    const handleGoToUser = () => {
        if (!usuario?.id) return;
        history.push(`/inicio/usuarios/${usuario.id}`);
    };

    const handleSendEmail = () => {
        if (!reparacion || !usuario) return;
        enviarEmailVacio(reparacion, usuario);
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
        <SectionCard
            title="CONSULTA"
            id="seccion-consulta"
            headerAction={
                <AppButton variant="outline-secondary" className="bg-bluemcdron text-white" onClick={handleGoToUser}>
                    Ir al Cliente
                </AppButton>
            }
        >
            <FormField
                label="Fecha de Consulta"
                id="FeConRep"
                type="date"
                value={convertTimestampCORTO(reparacion.data.FeConRep)}
                onChange={() => undefined}
                disabled
            />
            <div className="d-flex w-100 justify-content-between align-items-end gap-2">
                <div className="flex-grow-1">
                    <FormField
                        label="Email Cliente"
                        id="EmailUsu"
                        value={getEmailForNotifications(usuario)}
                        onChange={() => undefined}
                        disabled
                    />
                </div>
                <AppButton variant="outline-secondary" className="bg-bluemcdron text-white" onClick={handleSendEmail}>
                    <i className="bi bi-envelope"></i>
                </AppButton>
            </div>
            <FormField
                label="Nombre Cliente"
                id="NombreUsu"
                value={usuario?.data?.NombreUsu || ""}
                onChange={() => undefined}
                disabled
            />
            <FormField
                label="Apellido Cliente"
                id="ApellidoUsu"
                value={usuario?.data?.ApellidoUsu || ""}
                onChange={() => undefined}
                disabled
            />
            <div className="d-flex w-100 justify-content-between align-items-end gap-2">
                <div className="flex-grow-1">
                    <FormField
                        label="Teléfono Cliente"
                        id="TelefonoUsu"
                        type="tel"
                        value={usuario?.data?.TelefonoUsu || ""}
                        onChange={() => undefined}
                        disabled
                    />
                </div>
                <AppButton variant="outline-secondary" className="bg-bluemcdron text-white" onClick={handleSendSms}>
                    <i className="bi bi-chat-left-text"></i>
                </AppButton>
            </div>

            <div>
                <label className="form-label">Nombre del Drone</label>
                <select
                    className="form-control"
                    id="DroneId"
                    value={reparacion.data.DroneId || ""}
                    onChange={handleDroneChange}
                    disabled
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

            {reparacion.data.DroneId ? (
                <div>
                    <label className="form-label">Modelo del Drone</label>
                    <select
                        className="form-control"
                        id="ModeloDroneIdSelect"
                        value={modeloDroneIdActual || ""}
                        onChange={handleModeloDroneChange}
                        disabled={!isAdmin}
                    >
                        <option value="">Seleccione un modelo</option>
                        {modelosDrone.map(modelo => (
                            <option key={modelo.id} value={modelo.id}>
                                {modelo.data.NombreModelo} - {modelo.data.Fabricante}
                            </option>
                        ))}
                    </select>
                </div>
            ) : (
                <FormField
                    label="Modelo del Drone"
                    id="ModeloDroneNameRep"
                    value={modeloDrone.value}
                    onChange={modeloDrone.onChange}
                    isSaving={modeloDrone.isSaving}
                    disabled={!isAdmin}
                />
            )}

            <FormTextarea
                label="Desperfectos o Roturas"
                id="DescripcionUsuRep"
                value={descripcionUsu.value}
                onChange={descripcionUsu.onChange}
                isSaving={descripcionUsu.isSaving}
                disabled={!isAdmin}
            />

            {isAdmin && (
                <div className="d-flex flex-wrap gap-2 mt-3">
                    {puedeAvanzarARespondido && (
                        <AppButton variant="success" className="flex-fill" onClick={avanzarARespondido}>
                            Marcar como Respondido
                        </AppButton>
                    )}
                    {puedeAvanzarATransito && (
                        <AppButton variant="warning" className="flex-fill" onClick={avanzarATransito}>
                            Marcar en Tránsito
                        </AppButton>
                    )}
                </div>
            )}
        </SectionCard>
    );
};
