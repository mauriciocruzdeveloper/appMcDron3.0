/* eslint-disable react/jsx-no-target-blank */
import React, { useEffect, useState } from "react";
import history from "../history";
import { useParams } from "react-router-dom";
import { enviarSms, generarAutoDiagnostico } from "../utils/utils";
import { estados } from '../datos/estados';
import { Estado } from "../types/estado";
import { ReparacionType } from "../types/reparacion";
import { enviarEmailVacio } from "../utils/sendEmails";
import { useAppSelector } from "../redux-tool-kit/hooks/useAppSelector";
import { useAppDispatch } from "../redux-tool-kit/hooks/useAppDispatch";
import { useModal } from "./Modal/useModal";
import { eliminarReparacionAsync, guardarReparacionAsync } from "../redux-tool-kit/reparacion/reparacion.actions";
import { borrarFotoAsync, enviarReciboAsync, borrarDocumentoAsync, subirFotoYActualizarReparacionAsync, subirDocumentoYActualizarReparacionAsync } from "../redux-tool-kit/app/app.actions";
import { ChangeEvent } from "react";
import { InputType } from "../types/types";
import TextareaAutosize from "react-textarea-autosize";
import { convertTimestampCORTO } from "../utils/utils";
import "bootstrap-icons/font/bootstrap-icons.css";
import IntervencionesReparacion from './IntervencionesReparacion.component';

interface ParamTypes {
    id: string;
}

export default function ReparacionComponent(): React.ReactElement | null {
    console.log("REPARACION component");

    const dispatch = useAppDispatch();
    const { openModal } = useModal();

    const isAdmin = useAppSelector(state => state.app.usuario?.data.Admin) ?? false;
    const { id } = useParams<ParamTypes>();
    const reparacionStore = useAppSelector(
        state => state.reparacion.coleccionReparaciones.find(reparacion => String(reparacion.id) === id)
    );
    const usuarioStore = useAppSelector(
        state => state.usuario.coleccionUsuarios.find(usuario => usuario.id === reparacionStore?.data.UsuarioRep)
    );

    // Obtener las intervenciones aplicadas a esta reparación
    const intervencionesAplicadas = useAppSelector(state => state.reparacion.intervencionesDeReparacionActual);

    // Calcular el total de las intervenciones
    const totalIntervenciones = intervencionesAplicadas.reduce((total, intervencion) =>
        total + intervencion.data.PrecioTotal, 0);

    const [reparacionOriginal, setReparacionOriginal] = useState<ReparacionType>();
    const [reparacion, setReparacion] = useState<ReparacionType | undefined>(reparacionStore);
    const [fotoSeleccionada, setFotoSeleccionada] = useState<string | null>(null);

    useEffect(() => {
        if (reparacionStore) {
            setReparacion(reparacionStore);
            setReparacionOriginal(reparacionStore);
        }
    }, [reparacionStore, id]);

    useEffect(() => {
        if (reparacion && totalIntervenciones && !reparacion.data.PresuFiRep) {
            setReparacion(prevState => prevState ? {
                ...prevState,
                data: {
                    ...prevState.data,
                    PresuFiRep: totalIntervenciones
                }
            } : prevState);
        }
    }, [totalIntervenciones]);

    if (!reparacion || !usuarioStore) return null;

    const changeInputRep = (field: string, value: string) => {
        setReparacion(prevReparacion => prevReparacion ? {
            ...prevReparacion,
            data: {
                ...prevReparacion.data,
                [field]: value
            }
        } : prevReparacion);
    };

    const handleOnChange = (event: ChangeEvent<InputType>) => {
        const target = event.target;

        let value = target.value;
        if (target.type == "date") {
            const anio = Number(target.value.substr(0, 4));
            const mes = Number(target.value.substr(5, 2)) - 1;
            const dia = Number(target.value.substr(8, 2));
            value = String(Number(new Date(anio, mes, dia).getTime()) + 10800001); // Se agrega este número para que de bien la fecha.
        }
        const field = target.id;
        changeInputRep(field, value);
    }

    const setEstado = (estado: Estado) => {
        if (!reparacion || !reparacionOriginal) return;

        const estadoActual = estados[reparacionOriginal.data.EstadoRep];
        const nuevaEtapa = estado.etapa;

        // No permitir bajar de estado o seleccionar el mismo estado
        // if (nuevaEtapa <= estadoActual.etapa) return;

        // Reglas específicas para ciertos estados
        if (estadoActual.nombre === 'Recibido' && nuevaEtapa < estados['Recibido'].etapa) return;
        if (estadoActual.nombre === 'Reparado' && nuevaEtapa < estados['Reparado'].etapa) return;
        if (estadoActual.nombre === 'Entregado') return;

        type CampoFecha = 'FeConRep' | 'FeFinRep' | 'FeRecRep' | 'FeEntRep';

        let campofecha: CampoFecha | null = null;
        switch (estado.nombre) {
            case "Consulta":
                campofecha = "FeConRep";
                break;
            case "Reparado":
                campofecha = "FeFinRep";
                break;
            case "Recibido":
                campofecha = "FeRecRep";
                break;
            case "Entregado":
                campofecha = "FeEntRep";
                break;
            default:
                break;
        }

        const newReparacion = {
            ...reparacion,
            data: {
                ...reparacion.data,
                EstadoRep: estado.nombre,
                PrioridadRep: estado.prioridad,
            }
        };

        // Regla: Si hay un campo de fecha y no está seteado, se setea con la fecha actual.
        if (campofecha && !newReparacion.data[`${campofecha}`]) {
            newReparacion.data = {
                ...newReparacion.data,
                [campofecha]: new Date().getTime(),
            };
        }

        setReparacion(newReparacion);
    }

    const confirmaGuardarReparacion = async () => {
        if (reparacion.data.EstadoRep === 'Recibido' && !reparacion.data.DiagnosticoRep) {
            reparacion.data.DiagnosticoRep = await dispatch(generarAutoDiagnostico(reparacion));
        }
        const response = await dispatch(guardarReparacionAsync(reparacion));
        setReparacionOriginal(reparacion);
        if (response.meta.requestStatus === 'fulfilled') {
            openModal({
                mensaje: "Reparación guardada correctamente.",
                tipo: "success",
                titulo: "Guardar Reparación",
            })
        } else {
            openModal({
                mensaje: "Error al guardar la reparación.",
                tipo: "danger",
                titulo: "Guardar Reparación",
            })
        }
    }

    const confirmEliminarReparacion = async () => {
        if (!reparacion) return;
        try {
            await dispatch(eliminarReparacionAsync(reparacion.id)).unwrap();

            openModal({
                mensaje: "Reparación eliminada correctamente.",
                tipo: "success",
                titulo: "Eliminar Reparación",
            });
            history.goBack();
        } catch (error: any) { // TODO: Hacer tipo de dato para el error
            console.error("Error al eliminar la reparación:", error);

            openModal({
                mensaje: error?.code || "Error al eliminar la reparación.",
                tipo: "danger",
                titulo: "Eliminar Reparación",
            });
        }
    }

    const handleGuardarReparacion = async () => {
        openModal({
            mensaje: "Desea guardar los cambios?",
            tipo: "warning",
            titulo: "Guardar Reparación",
            confirmCallback: confirmaGuardarReparacion,
        })
    }

    const handleEliminarReparacion = () => {
        openModal({
            mensaje: "Eliminar Reparación?",
            tipo: "danger",
            titulo: "Atención",
            confirmCallback: confirmEliminarReparacion,
        })
    }

    const handleSendEmail = () => {
        if (!reparacion) return;
        enviarEmailVacio(reparacion);
    }

    const handleSendRecibo = async () => {
        if (!reparacion) return;

        const response = await dispatch(enviarReciboAsync(reparacion));
        setReparacionOriginal(reparacion);
        if (response.meta.requestStatus === 'fulfilled') {
            openModal({
                mensaje: "Recibo enviado correctamente.",
                tipo: "success",
                titulo: "Enviar Recibo",
            })
        } else {
            openModal({
                mensaje: "Error al enviar el recibo.",
                tipo: "danger",
                titulo: "Enviar Recibo",
            })
        }
    }

    const handleSendSms = () => {
        const data = {
            number: usuarioStore?.data?.TelefonoUsu || '', /* iOS: ensure number is actually a string */
            message: 'Prueba de sms',

            //CONFIGURATION
            options: {
                replaceLineBreaks: false, // true to replace \n by a new line, false by default
                android: {
                    intent: 'INTENT'  // send SMS with the native android SMS messaging
                    //intent: '' // send SMS without opening any other app, require : android.permission.SEND_SMS and android.permission.READ_PHONE_STATE
                }
            },

            success: () => null,
            error: (e: unknown) => alert('Message Failed:' + e)
        };
        enviarSms(data);
    }

    const handleGenerarAutoDiagnostico = async () => {
        if (!reparacion) return;
        const diagnostico = await dispatch(generarAutoDiagnostico(reparacion));
        const newReparacion = {
            ...reparacion,
            data: {
                ...reparacion.data,
                DiagnosticoRep: diagnostico,
            }
        }
        const response = await dispatch(guardarReparacionAsync(newReparacion));
        setReparacionOriginal(newReparacion);
        if (response.meta.requestStatus === 'rejected') {
            openModal({
                mensaje: "Error al guardar la reparación.",
                tipo: "danger",
                titulo: "Guardar Reparación",
            })
        }
    }

    const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length || !reparacion) return;
        const file = e.target.files[0];
        
        try {
            const response = await dispatch(subirFotoYActualizarReparacionAsync({ 
                reparacionId: reparacion.id, 
                file 
            }));
            
            if (response.meta.requestStatus !== 'fulfilled') {
                openModal({
                    mensaje: "Error al subir la foto.",
                    tipo: "danger",
                    titulo: "Subir Foto",
                });
            }
        } catch (error) {
            openModal({
                mensaje: "Error al subir la foto.",
                tipo: "danger",
                titulo: "Subir Foto",
            });
        }
    };

    const handleDocumentoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length || !reparacion) return;
        const file = e.target.files[0];
        
        try {
            const response = await dispatch(subirDocumentoYActualizarReparacionAsync({ 
                reparacionId: reparacion.id, 
                file 
            }));
            
            if (response.meta.requestStatus === 'fulfilled') {
                const nuevaReparacion = response.payload as ReparacionType;
                setReparacion(nuevaReparacion);
                setReparacionOriginal(nuevaReparacion);
            } else {
                openModal({
                    mensaje: "Error al subir el documento.",
                    tipo: "danger",
                    titulo: "Subir Documento",
                });
            }
        } catch (error) {
            openModal({
                mensaje: "Error al subir el documento.",
                tipo: "danger",
                titulo: "Subir Documento",
            });
        }
    };

    const handleDeleteFoto = async (fotoUrl: string) => {
        if (!reparacion) return;
        const response = await dispatch(borrarFotoAsync({ reparacionId: reparacion.id, fotoUrl }));
        if (response.meta.requestStatus === 'fulfilled') {
            const nuevaReparacion = {
                ...reparacion,
                data: {
                    ...reparacion.data,
                    urlsFotos: reparacion.data.urlsFotos?.filter(url => url !== fotoUrl)
                }
            };
            
            // Guardar los cambios en la base de datos
            const responseGuardar = await dispatch(guardarReparacionAsync(nuevaReparacion));
            
            if (responseGuardar.meta.requestStatus === 'fulfilled') {
                // Actualizar el estado local y el estado original
                setReparacion(nuevaReparacion);
                setReparacionOriginal(nuevaReparacion);
            } else {
                openModal({
                    mensaje: "Error al guardar los cambios después de eliminar la foto.",
                    tipo: "danger",
                    titulo: "Eliminar Foto",
                });
            }
        } else {
            openModal({
                mensaje: "Error al eliminar la foto.",
                tipo: "danger",
                titulo: "Eliminar Foto",
            })
        }
    };

    const handleDeleteDocumento = async (docUrl: string) => {
        if (!reparacion) return;
        const response = await dispatch(borrarDocumentoAsync({ reparacionId: reparacion.id, documentoUrl: docUrl }));
        if (response.meta.requestStatus === 'fulfilled') {
            const nuevaReparacion = {
                ...reparacion,
                data: {
                    ...reparacion.data,
                    urlsDocumentos: reparacion.data.urlsDocumentos?.filter(url => url !== docUrl)
                }
            };
            
            // Guardar los cambios en la base de datos
            const responseGuardar = await dispatch(guardarReparacionAsync(nuevaReparacion));
            
            if (responseGuardar.meta.requestStatus === 'fulfilled') {
                // Actualizar el estado local y el estado original
                setReparacion(nuevaReparacion);
                setReparacionOriginal(nuevaReparacion);
            } else {
                openModal({
                    mensaje: "Error al guardar los cambios después de eliminar el documento.",
                    tipo: "danger",
                    titulo: "Eliminar Documento",
                });
            }
        } else {
            openModal({
                mensaje: "Error al eliminar el documento.",
                tipo: "danger",
                titulo: "Eliminar Documento",
            })
        }
    };

    const handleGoToUser = () => {
        history.push(`/inicio/usuarios/${usuarioStore.data.EmailUsu}`)
    }

    // Formatear precio para mostrar
    const formatPrice = (precio: number): string => {
        return precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
    };

    // UI RENDER
    return (
        <div
            className="p-4"
            style={{
                backgroundColor: estados[reparacion.data.EstadoRep].color
            }}
        >
            <div
                className="card mb-3"
                style={{
                    backgroundColor: "#CCCCCC"
                }}
            >
                <div className="card-body">
                    <h3 className="card-title">
                        REPARACIÓN
                    </h3>
                    <div>id: {reparacion?.id}</div>
                    <div>Drone: {reparacion?.data?.DroneRep}</div>
                    <div>Cliente: {usuarioStore?.data?.NombreUsu} {usuarioStore?.data?.ApellidoUsu}</div>
                </div>
            </div>

            <div className="card mb-3">
                <div className="card-body">
                    <h5 className="card-title bluemcdron">ESTADO DE LA REPARACIÓN</h5>
                    <div className="text-center">
                        {Object.values(estados).map(estado =>
                            <button
                                key={estado.nombre}
                                className="m-2 btn btn-outline-secondary overflow-hidden"
                                type="button"
                                style={{
                                    backgroundColor:
                                        estado.nombre == reparacion?.data?.EstadoRep ?
                                            estado.color :
                                            "#CCCCCC"
                                    ,
                                    width: "90px",
                                    height: "30px"
                                }}
                                onClick={() => setEstado(estado)} // PARA REDUX, Y QUIZÁS PARA USESTATE
                            >
                                {estado.nombre}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {isAdmin ? // Sólo para administrador
                <div className="card mb-3">
                    <div className="card-body">
                        <h5 className="card-title bluemcdron">ENLACE A DRIVE</h5>
                        <div>
                            <label className="form-label">En lace a Drive</label>

                            <div className="input-group">
                                <input
                                    onChange={handleOnChange}
                                    type="text"
                                    className="form-control"
                                    id="DriveRep"
                                    value={reparacion?.data?.DriveRep}
                                />
                                <div className="input-group-append">
                                    <a href={reparacion?.data?.DriveRep}><button className="btn btn-outline-secondary bg-bluemcdron text-white" type="button">Ir</button></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                : null}

            {isAdmin ? // Sólo para administrador
                <div
                    className="card mb-3"
                    style={{
                        backgroundColor: "#FF0000"
                    }}
                >
                    <div className="card-body">
                        <h5 className="card-title bluemcdron">ANOTACIONES CONFIDENCIALES</h5>
                        <div>
                            <label className="form-label text-white">Anotaciones varias</label>
                            <TextareaAutosize
                                onChange={handleOnChange}
                                className="form-control"
                                id="AnotacionesRep"
                                value={reparacion?.data?.AnotacionesRep || ""}
                                rows={5}
                            />
                        </div>
                    </div>
                </div>
                : null}

            <div className="card mb-3">
                <div className="card-body">
                    <div className="d-flex w-100 justify-content-between align-items-center">
                        <h5 className="card-title bluemcdron">CONSULTA - PRIMEROS DATOS</h5>
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
                            value={convertTimestampCORTO(reparacion?.data?.FeConRep)}
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
                                value={usuarioStore?.data?.EmailUsu || ''}
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
                            value={usuarioStore?.data?.NombreUsu}
                            disabled
                        />
                    </div>
                    <div>
                        <label className="form-label">Apellido Cliente</label>
                        <input
                            type="text"
                            className="form-control"
                            id="ApellidoUsu"
                            value={usuarioStore?.data?.ApellidoUsu}
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
                                value={usuarioStore?.data?.TelefonoUsu}
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
                        <label className="form-label">Modelo del Drone</label>
                        <input
                            onChange={handleOnChange}
                            type="text"
                            className="form-control"
                            id="DroneRep"
                            value={reparacion?.data?.DroneRep || ""}
                            disabled={!isAdmin}
                        />
                    </div>
                    <div>
                        <label className="form-label">Desperfectos o Roturas</label>
                        <TextareaAutosize
                            onChange={handleOnChange}
                            className="form-control"
                            id="DescripcionUsuRep"
                            value={reparacion?.data?.DescripcionUsuRep || ""}
                            disabled={!isAdmin}
                        />
                    </div>
                    <div>
                        <div className="d-flex w-100 justify-content-between align-items-center">
                            <label className="form-label">Autodiagnóstico</label>
                            <button
                                type="button"
                                className="btn btn-outline-secondary bg-bluemcdron text-white"
                                onClick={handleGenerarAutoDiagnostico}
                            >
                                <i className="bi bi-arrow-repeat"></i>
                            </button>
                        </div>
                        <TextareaAutosize
                            readOnly
                            className="form-control"
                            id="DiagnosticoRep"
                            value={reparacion?.data?.DiagnosticoRep || ""}
                        />
                    </div>
                </div>
            </div>

            {/* Resto de secciones del formulario */}
            <div className="card mb-3">
                <div className="card-body">
                    <h5 className="card-title bluemcdron">RECEPCIÓN</h5>
                    <div>
                        <label className="form-label">Fecha de Recepción</label>
                        <div className="d-flex w-100 justify-content-between">

                            <input
                                onChange={handleOnChange}
                                type="date"
                                className="form-control"
                                id="FeRecRep"
                                value={convertTimestampCORTO(reparacion?.data?.FeRecRep)}
                                disabled={!isAdmin}
                            />
                            <button
                                type="submit"
                                className="btn btn-outline-secondary bg-bluemcdron text-white"
                                onClick={handleSendRecibo}
                            >
                                <i className="bi bi-envelope"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card mb-3">
                <div className="card-body">
                    <h5 className="card-title bluemcdron">REVISIÓN - DIAGNÓSTICO Y PRESUPUESTO DATOS</h5>
                    <div>
                        <label className="form-label">Número de Serie</label>
                        <input
                            onChange={handleOnChange}
                            type="text"
                            className="form-control"
                            id="NumeroSerieRep"
                            value={reparacion?.data?.NumeroSerieRep || ""}
                            disabled={!isAdmin}
                        />
                    </div>
                    <div>
                        <label className="form-label">Observaciones del Técnico</label>
                        <TextareaAutosize
                            onChange={handleOnChange}
                            className="form-control"
                            id="DescripcionTecRep"
                            value={reparacion?.data?.DescripcionTecRep || ""}
                            rows={5}
                            disabled={!isAdmin}
                        />
                    </div>
                    <div>
                        <label className="form-label">Presupuesto Mano de Obra $</label>
                        <input
                            onChange={handleOnChange}
                            type="number"
                            className="form-control"
                            id="PresuMoRep"
                            value={reparacion?.data?.PresuMoRep || ""}
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
                            value={reparacion?.data?.PresuReRep || ""}
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
                            value={reparacion?.data?.PresuFiRep || ""}
                            disabled={!isAdmin}
                            title="El precio se calcula automáticamente en base a las intervenciones, o puede ingresar un valor manual"
                        />
                        {isAdmin && intervencionesAplicadas.length > 0 && (
                            <small className="form-text text-muted">
                                {totalIntervenciones !== reparacion.data.PresuFiRep
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
                            value={reparacion?.data?.PresuDiRep || ""}
                            disabled={!isAdmin}
                        />
                    </div>
                </div>
            </div>

            {isAdmin ? // Sólo para administrador
                <div className="card mb-3">
                    <div className="card-body">
                        <h5 className="card-title bluemcdron">REPUESTOS - CUALES Y SEGUIMIENTO</h5>
                        <div>
                            <label className="form-label">Qué repuesto, seguimiento, transportista</label>
                            <TextareaAutosize
                                onChange={handleOnChange}
                                className="form-control"
                                id="TxtRepuestosRep"
                                value={reparacion?.data?.TxtRepuestosRep || ""} //Esto es lo correcto
                                rows={5}
                            />
                        </div>
                    </div>
                </div>
                : null
            }

            <div className="card mb-3">
                <div className="card-body">
                    <h5 className="card-title bluemcdron">REPARACIÓN - DATOS DE LA REPARACIÓN</h5>
                    <div>
                        <label className="form-label">Informe de Reparación o Diagnóstico</label>
                        <TextareaAutosize
                            onChange={handleOnChange}
                            className="form-control"
                            id="InformeRep"
                            value={reparacion?.data?.InformeRep || ""}
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
                            value={convertTimestampCORTO(reparacion?.data?.FeFinRep)}
                            disabled={!isAdmin}
                        />
                    </div>
                </div>
            </div>

            <div className="card mb-3">
                <div className="card-body">
                    <h5 className="card-title bluemcdron">ENTREGA - DATOS DE LA ENTREGA</h5>
                    <div>
                        <label className="form-label">Fecha Entrega</label>
                        <input
                            onChange={handleOnChange}
                            type="date"
                            className="form-control"
                            id="FeEntRep"
                            value={convertTimestampCORTO(reparacion?.data?.FeEntRep)}
                            disabled={!isAdmin}
                        />
                    </div>
                    <div>
                        <label className="form-label">Cliente, Comisionista, Correo, Seguimiento</label>
                        <TextareaAutosize
                            onChange={handleOnChange}
                            className="form-control"
                            id="TxtEntregaRep"
                            value={reparacion?.data?.TxtEntregaRep || ""}
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
                            value={reparacion?.data?.SeguimientoEntregaRep || ""}
                            disabled={!isAdmin}
                        />
                    </div>
                </div>
            </div>

            <div className="card mb-3">
                <div className="card-body">
                    <h5 className="card-title bluemcdron">INTERVENCIONES - TRABAJOS REALIZADOS</h5>
                    <IntervencionesReparacion
                        reparacionId={reparacion.id}
                        readOnly={!isAdmin}
                    />
                </div>
            </div>

            <div className="card mb-3">
                <div className="card-body">
                    <div className="d-flex w-100 justify-content-between align-items-center">
                        <h5 className="card-title bluemcdron">FOTOS</h5>
                        <div className="d-flex justify-content-start mb-2">
                            <label className="btn btn-outline-secondary bg-bluemcdron text-white">
                                Subir Foto
                                <input
                                    type="file"
                                    onChange={handleFotoChange}
                                    style={{ display: "none" }}
                                    accept="image/*" // Especifica que solo se aceptan imágenes
                                />
                            </label>
                        </div>
                    </div>
                    <div className="d-flex flex-wrap mt-3">
                        {reparacion.data.urlsFotos?.map((url, idx) => (
                            <div
                                key={idx}
                                style={{
                                    width: "calc((100% - (2 * 12px)) / 3)",
                                    margin: "4px",
                                    backgroundColor: "#f1f1f1"
                                }}
                            >
                                <div
                                    style={{
                                        height: "150px",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => setFotoSeleccionada(url)}
                                >
                                    <img
                                        src={url}
                                        alt="Foto Reparación"
                                        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                                    />
                                </div>
                                {isAdmin && (
                                    <div className="flex text-center my-2">
                                        <a
                                            target="_blank"
                                            href={url}
                                            download
                                            className="btn btn-sm btn-success me-2 bi-cloud-download"
                                        >
                                        </a>
                                        <a
                                            className="btn btn-sm btn-danger bi bi-trash"
                                            onClick={() => handleDeleteFoto(url)}
                                        >
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    {fotoSeleccionada && (
                        <div
                            style={{
                                position: "fixed",
                                top: 0, left: 0,
                                width: "100%", height: "100%",
                                backgroundColor: "rgba(0,0,0,0.7)",
                                display: "flex", alignItems: "center", justifyContent: "center"
                            }}
                        >
                            <div style={{ position: "relative" }}>
                                <button
                                    type="button"
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        right: 0,
                                        margin: "8px"
                                    }}
                                    className="btn btn-sm btn-light"
                                    onClick={() => setFotoSeleccionada(null)}
                                >
                                    X
                                </button>
                                <img
                                    src={fotoSeleccionada}
                                    alt="Foto Ampliada"
                                    style={{ maxHeight: "80vh", maxWidth: "90vw", objectFit: "contain" }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="card mb-3">
                <div className="card-body">
                    <div className="d-flex w-100 justify-content-between align-items-center">
                        <h5 className="card-title bluemcdron">DOCUMENTOS</h5>
                        <div className="d-flex justify-content-start mb-2">
                            <label className="btn btn-outline-secondary bg-bluemcdron text-white">
                                Subir Documento
                                <input
                                    type="file"
                                    onChange={handleDocumentoChange}
                                    style={{ display: "none" }}
                                />
                            </label>
                        </div>
                    </div>
                    <div className="mt-3">
                        {reparacion.data.urlsDocumentos?.length ? (
                            <div className="list-group">
                                {reparacion.data.urlsDocumentos.map((url, idx) => {
                                    // Decodificar caracteres especiales como %20
                                    let fileName = decodeURIComponent(url);
                                    // Extraer nombre del documento de la URL y decodificar
                                    fileName = fileName.split('/').pop() || `Documento ${idx + 1}`;
                                    // Eliminar los parámetros de consulta
                                    fileName = fileName.split('?')[0];

                                    return (
                                        <div
                                            key={idx}
                                            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center mb-2"
                                        >
                                            <div className="text-truncate" style={{ maxWidth: "70%" }}>
                                                <i className="bi bi-file-earmark-text me-2"></i>
                                                <span className="text-truncate">{fileName}</span>
                                            </div>
                                            <div>
                                                <a
                                                    href={url}
                                                    target="_blank"
                                                    className="btn btn-sm btn-success me-3"
                                                    download
                                                >
                                                    <i className="bi bi-cloud-download"></i>
                                                </a>
                                                {isAdmin && (
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleDeleteDocumento(url)}
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center text-muted">
                                <p>No hay documentos adjuntos</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isAdmin ? // Sólo para administrador
                <div className="text-center">
                    <button
                        key="botonGuardar"
                        onClick={handleGuardarReparacion}
                        className="w-100 mb-3 btn bg-bluemcdron text-white"
                    >
                        Guardar
                    </button>
                    <button
                        key="botonEliminar"
                        onClick={handleEliminarReparacion}
                        className="w-100 btn bg-danger text-white"
                    >
                        Eliminar
                    </button>
                </div>
                : null}
        </div>
    );
}
