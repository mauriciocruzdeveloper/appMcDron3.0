/* eslint-disable react/jsx-no-target-blank */
import React, { useEffect, useState } from "react";
import { useHistory } from "../../hooks/useHistory";
import { useParams } from "react-router-dom";
import { enviarSms, generarAutoDiagnostico } from "../../utils/utils";
import { estados } from '../../datos/estados';
import { obtenerEstadoSeguro, esEstadoLegacy, obtenerMensajeMigracion } from '../../utils/estadosHelper';
import { Estado } from "../../types/estado";
import { ReparacionType } from "../../types/reparacion";
import { enviarEmailVacio } from "../../utils/sendEmails";
import { useAppSelector } from "../../redux-tool-kit/hooks/useAppSelector";
import { useAppDispatch } from "../../redux-tool-kit/hooks/useAppDispatch";
import { useModal } from "../Modal/useModal";
import { eliminarReparacionAsync, guardarReparacionAsync } from "../../redux-tool-kit/reparacion/reparacion.actions";
import {
    borrarFotoAsync,
    enviarReciboAsync,
    enviarDroneReparadoAsync,
    enviarDroneDiagnosticadoAsync,
    borrarDocumentoAsync,
    subirFotoYActualizarReparacionAsync,
    subirDocumentoYActualizarReparacionAsync,
} from "../../redux-tool-kit/app/app.actions";
import { ChangeEvent } from "react";
import { InputType } from "../../types/types";
import TextareaAutosize from "react-textarea-autosize";
import { convertTimestampCORTO } from "../../utils/utils";
import "bootstrap-icons/font/bootstrap-icons.css";
import IntervencionesReparacion from '../IntervencionesReparacion.component';
import { selectUsuarioPorId } from "../../redux-tool-kit/usuario/usuario.selectors";
import {
    selectReparacionById,
    selectIntervencionesDeReparacionActual
} from "../../redux-tool-kit/reparacion";
import { selectDroneById, selectDronesByPropietario } from "../../redux-tool-kit/drone/drone.selectors";
import { selectModeloDronePorId } from "../../redux-tool-kit/modeloDrone/modeloDrone.selectors";

interface ParamTypes extends Record<string, string | undefined> {
    id: string;
}

export default function ReparacionComponent(): React.ReactElement | null {
    console.log("REPARACION component");

    const dispatch = useAppDispatch();
    const history = useHistory();
    const { openModal } = useModal();

    const isAdmin = useAppSelector(state => state.app.usuario?.data.Admin) ?? false;
    const { id } = useParams<ParamTypes>();
    const isNew = id === "new";

    // Estado inicial para alta
    const reparacionVacia: ReparacionType = {
        id: "",
        data: {
            EstadoRep: "Consulta",
            PrioridadRep: 1,
            DroneId: "",
            ModeloDroneNameRep: "",
            NombreUsu: "",
            ApellidoUsu: "",
            UsuarioRep: "",
            DriveRep: "",
            AnotacionesRep: "",
            FeConRep: Date.now(),
            EmailUsu: "",
            TelefonoUsu: "",
            DescripcionUsuRep: "",
            DiagnosticoRep: "",
            FeRecRep: 0,
            NumeroSerieRep: "",
            DescripcionTecRep: "",
            PresuMoRep: 0,
            PresuReRep: 0,
            PresuFiRep: 0,
            PresuDiRep: 0,
            TxtRepuestosRep: "",
            FeFinRep: 0,
            FeEntRep: 0,
            TxtEntregaRep: "",
            SeguimientoEntregaRep: "",
            urlsFotos: [],
            urlsDocumentos: [],
            IntervencionesIds: []
        }
    };

    const reparacionStore = useAppSelector(selectReparacionById(id || ""));
    const usuarioStore = useAppSelector(
        state => selectUsuarioPorId(state, isNew ? "" : reparacionStore?.data.UsuarioRep || "")
    );

    // Obtener las intervenciones aplicadas a esta reparación usando el selector optimizado
    const intervencionesAplicadas = useAppSelector(selectIntervencionesDeReparacionActual);

    // Calcular el total de las intervenciones
    const totalIntervenciones = intervencionesAplicadas.reduce((total, intervencion) =>
        total + intervencion.data.PrecioTotal, 0);

    const [reparacionOriginal, setReparacionOriginal] = useState<ReparacionType | undefined>(isNew ? reparacionVacia : reparacionStore);
    const [reparacion, setReparacion] = useState<ReparacionType | undefined>(isNew ? reparacionVacia : reparacionStore);
    const [fotoSeleccionada, setFotoSeleccionada] = useState<string | null>(null);

    console.log('!!! reparacion en reparación componente', reparacion);

    // Obtener el drone asociado a la reparación
    const drone = useAppSelector(
        state => selectDroneById(isNew ? "" : reparacion?.data.DroneId || "")(state)
    );

    // Obtener el modelo del drone
    const modeloDrone = useAppSelector(
        state => selectModeloDronePorId(state, drone?.data.ModeloDroneId || "")
    );

    // Obtener los drones del cliente para el selector
    const dronesDelCliente = useAppSelector(
        state => selectDronesByPropietario(usuarioStore?.id || "")(state)
    );

    useEffect(() => {
        if (!isNew && reparacionStore) {
            setReparacion(reparacionStore);
            setReparacionOriginal(reparacionStore);
        }
        if (isNew) {
            setReparacion(reparacionVacia);
            setReparacionOriginal(reparacionVacia);
        }
    }, [reparacionStore, id, isNew]);

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

    // useEffect para scroll automático según el estado
    useEffect(() => {
        if (!reparacion || isNew) return;

        const scrollToSection = () => {
            const estadoActual = obtenerEstadoSeguro(reparacion.data.EstadoRep);
            let sectionId = '';

            // Determinar a qué sección hacer scroll según el estado
            switch (estadoActual.nombre) {
                case 'Consulta':
                case 'Respondido':
                    sectionId = 'seccion-consulta';
                    break;
                case 'Transito':
                    sectionId = 'seccion-recepcion';
                    break;
                case 'Recibido':
                    sectionId = 'seccion-revision';
                    break;
                case 'Revisado':
                case 'Presupuestado':
                    sectionId = 'seccion-presupuesto';
                    break;
                case 'Aceptado':
                case 'Rechazado':
                    sectionId = 'seccion-reparar';
                    break;
                case 'Reparado':
                case 'Diagnosticado':
                case 'Cobrado':
                case 'Enviado':
                    sectionId = 'seccion-entrega';
                    break;
                case 'Finalizado':
                case 'Abandonado':
                case 'Cancelado':
                    break; // No hacer scroll
                // Estados legacy
                case 'Reparar':
                case 'Repuestos':
                    sectionId = 'seccion-reparar';
                    break;
                case 'Entregado':
                    sectionId = 'seccion-entrega';
                    break;
                default:
                    sectionId = 'seccion-consulta';
                    break;
            }

            // Hacer scroll suave a la sección con offset para compensar el NavMcDron
            setTimeout(() => {
                const element = document.getElementById(sectionId);
                if (element) {
                    const navHeight = 80; // Altura aproximada del NavMcDron + padding
                    const elementPosition = element.offsetTop - navHeight;

                    window.scrollTo({
                        top: elementPosition,
                        behavior: 'smooth'
                    });
                }
            }, 100); // Pequeño delay para asegurar que el DOM esté renderizado
        };

        scrollToSection();
    }, [reparacion?.data.EstadoRep, isNew]);

    if (!reparacion) return null;

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

    const handleDroneChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const droneId = event.target.value;
        // El nombre del modelo se actualizará automáticamente por el useEffect
        setReparacion(prevReparacion => prevReparacion ? {
            ...prevReparacion,
            data: {
                ...prevReparacion.data,
                DroneId: droneId,
                ModeloDroneNameRep: modeloDrone?.data?.NombreModelo || "" // Asegurarse de que el modelo esté actualizado
            }
        } : prevReparacion);
    }

    const setEstado = async (estado: Estado) => {
        if (!reparacion || !reparacionOriginal) return;

        const estadoActual = obtenerEstadoSeguro(reparacionOriginal.data.EstadoRep);
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
            case "Recibido":
                campofecha = "FeRecRep";
                break;
            case "Reparado":
                campofecha = "FeFinRep";
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

        // Generar diagnóstico automático si es necesario
        if (newReparacion.data.EstadoRep === 'Recibido' && !newReparacion.data.DiagnosticoRep) {
            newReparacion.data.DiagnosticoRep = await dispatch(generarAutoDiagnostico(newReparacion));
        }

        // Actualizar estado local primero
        setReparacion(newReparacion);

        // Guardar automáticamente en la base de datos
        try {
            const response = await dispatch(guardarReparacionAsync(newReparacion));

            if (response.meta.requestStatus === 'fulfilled') {
                setReparacionOriginal(newReparacion);
            } else {
                // Si falla el guardado, revertir el estado local
                setReparacion(reparacion);
                openModal({
                    mensaje: "Error al guardar el cambio de estado.",
                    tipo: "danger",
                    titulo: "Error",
                });
            }
        } catch (error) {
            // Si hay error, revertir el estado local
            setReparacion(reparacion);
            openModal({
                mensaje: "Error al guardar el cambio de estado.",
                tipo: "danger",
                titulo: "Error",
            });
        }
    }

    // Funciones específicas para avanzar al siguiente estado
    const avanzarARespondido = () => setEstado(estados.Respondido);
    const avanzarATransito = () => setEstado(estados.Transito);
    const avanzarARecibido = async () => {
        await setEstado(estados.Recibido);

        // Enviar email de recibo automáticamente
        if (reparacion) {
            try {
                const response = await dispatch(enviarReciboAsync(reparacion));
                if (response.meta.requestStatus === 'fulfilled') {
                    openModal({
                        mensaje: "Drone marcado como recibido y recibo enviado por email correctamente.",
                        tipo: "success",
                        titulo: "Drone Recibido",
                    });
                } else {
                    openModal({
                        mensaje: "Drone marcado como recibido, pero hubo un error al enviar el recibo.",
                        tipo: "warning",
                        titulo: "Drone Recibido",
                    });
                }
            } catch (error) {
                openModal({
                    mensaje: "Drone marcado como recibido, pero hubo un error al enviar el recibo.",
                    tipo: "warning",
                    titulo: "Drone Recibido",
                });
            }
        }
    };
    const avanzarARevisado = () => setEstado(estados.Revisado);
    const avanzarAPresupuestado = () => setEstado(estados.Presupuestado);
    const avanzarAAceptado = () => setEstado(estados.Aceptado);
    const avanzarARechazado = () => setEstado(estados.Rechazado);
    const avanzarAReparado = async () => {
        await setEstado(estados.Reparado);

        // Enviar email de notificación de drone reparado
        if (reparacion) {
            try {
                const response = await dispatch(enviarDroneReparadoAsync(reparacion));
                if (response.meta.requestStatus === 'fulfilled') {
                    openModal({
                        mensaje: "Drone marcado como reparado y email enviado correctamente.",
                        tipo: "success",
                        titulo: "Drone Reparado",
                    });
                } else {
                    openModal({
                        mensaje: "Drone marcado como reparado, pero hubo un error al enviar el email.",
                        tipo: "warning",
                        titulo: "Drone Reparado",
                    });
                }
            } catch (error) {
                openModal({
                    mensaje: "Drone marcado como reparado, pero hubo un error al enviar el email.",
                    tipo: "warning",
                    titulo: "Drone Reparado",
                });
            }
        }
    };
    const avanzarADiagnosticado = async () => {
        await setEstado(estados.Diagnosticado);

        // Enviar email de notificación de drone diagnosticado
        if (reparacion) {
            try {
                const response = await dispatch(enviarDroneDiagnosticadoAsync(reparacion));
                if (response.meta.requestStatus === 'fulfilled') {
                    openModal({
                        mensaje: "Drone marcado como diagnosticado y email enviado correctamente.",
                        tipo: "success",
                        titulo: "Drone Diagnosticado",
                    });
                } else {
                    openModal({
                        mensaje: "Drone marcado como diagnosticado, pero hubo un error al enviar el email.",
                        tipo: "warning",
                        titulo: "Drone Diagnosticado",
                    });
                }
            } catch (error) {
                openModal({
                    mensaje: "Drone marcado como diagnosticado, pero hubo un error al enviar el email.",
                    tipo: "warning",
                    titulo: "Drone Diagnosticado",
                });
            }
        }
    };
    const avanzarACobrado = () => setEstado(estados.Cobrado);
    const avanzarAEnviado = () => setEstado(estados.Enviado);
    const avanzarAFinalizado = () => setEstado(estados.Finalizado);
    const avanzarAAbandonado = () => setEstado(estados.Abandonado);

    // Función para verificar si se puede avanzar a un estado
    const puedeAvanzarA = (nombreEstado: string): boolean => {
        if (!isAdmin) return false;
        const estadoActual = obtenerEstadoSeguro(reparacion.data.EstadoRep);
        const estadoDestino = estados[nombreEstado];

        // Lógica especial para los flujos de Aceptado/Rechazado
        if (nombreEstado === 'Reparado') {
            return estadoActual.nombre === 'Aceptado';
        }
        if (nombreEstado === 'Diagnosticado') {
            return estadoActual.nombre === 'Rechazado';
        }

        if (estadoActual.nombre === 'Aceptado' && nombreEstado === 'Rechazado') return false;
        if (estadoActual.nombre === 'Rechazado' && nombreEstado === 'Aceptado') return false;

        return estadoDestino.etapa > estadoActual.etapa;
    };

    const confirmaGuardarReparacion = async () => {
        if (reparacion.data.EstadoRep === 'Recibido' && !reparacion.data.DiagnosticoRep) {
            reparacion.data.DiagnosticoRep = await dispatch(generarAutoDiagnostico(reparacion));
        }

        console.log('!!! reparacion en Reparacion.component', reparacion)

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
        } catch (error: unknown) { // TODO: Hacer tipo de dato para el error
            console.error("Error al eliminar la reparación:", error);

            openModal({
                // TODO: Hacer tipo de dato para el error
                mensaje: (error as { code?: string })?.code || "Error al eliminar la reparación.",
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
                reparacion,
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

        setFotoSeleccionada(null); // Resetear el input de archivo
        e.target.value = ''; // Limpiar el input para permitir subir el mismo archivo nuevamente
    };

    const handleDocumentoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length || !reparacion) return;
        const file = e.target.files[0];

        try {
            const response = await dispatch(subirDocumentoYActualizarReparacionAsync({
                reparacion,
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
        if (!usuarioStore?.id) return;
        history.push(`/inicio/usuarios/${usuarioStore.id}`);
    }

    // Formatear precio para mostrar
    const formatPrice = (precio: number): string => {
        return precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
    };

    // Componente de resumen de progreso
    const ResumenProgreso = () => {
        const estadosOrdenados = [
            'Consulta', 'Respondido', 'Transito', 'Recibido', 'Revisado',
            'Presupuestado', 'Aceptado', 'Rechazado', 'Reparado', 'Diagnosticado',
            'Cobrado', 'Enviado', 'Finalizado', 'Abandonado', 'Cancelado'
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
                                        className={`d-flex align-items-center p-2 rounded ${esActual ? 'border border-dark' : ''
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

    // Función para determinar qué secciones mostrar según el estado
    const obtenerSeccionesAMostrar = () => {
        const estadoActual = obtenerEstadoSeguro(reparacion.data.EstadoRep);
        const etapa = estadoActual.etapa;

        // Si es admin, mostrar todo
        if (isAdmin) {
            return {
                consulta: true,
                recepcion: true,
                revision: true,
                presupuesto: true,
                repuestos: true,
                reparar: true,
                entrega: true,
                fotos: true,
                documentos: true
            };
        }

        // Para no-admin, mostrar según el estado
        const secciones = {
            consulta: etapa >= 1, // Siempre visible desde Consulta
            recepcion: etapa >= 3, // Visible desde Transito para poder marcar como Recibido
            revision: etapa >= 4, // Visible desde Recibido
            presupuesto: etapa >= 5, // Visible desde Revisado
            repuestos: etapa >= 7, // Visible desde Aceptado
            reparar: etapa >= 7, // Visible desde Aceptado
            entrega: etapa >= 8, // Visible desde Rechazado/Reparado/Diagnosticado
            fotos: etapa >= 1, // Siempre visible
            documentos: etapa >= 1 // Siempre visible
        };

        return secciones;
    };

    const seccionesVisibles = obtenerSeccionesAMostrar();

    // UI RENDER
    return (
        <div
            className="p-4"
            style={{
                backgroundColor: obtenerEstadoSeguro(reparacion.data.EstadoRep).color
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

                    {/* Alerta para estados legacy */}
                    {esEstadoLegacy(reparacion.data.EstadoRep) && (
                        <div className="alert alert-warning alert-dismissible fade show" role="alert">
                            <strong>⚠️ Estado Legacy Detectado:</strong> Esta reparación tiene el estado &quot;{reparacion.data.EstadoRep}&quot;
                            que pertenece al sistema anterior.
                            <br />
                            <small>
                                <strong>Recomendación:</strong> {obtenerMensajeMigracion(reparacion.data.EstadoRep)}
                            </small>
                        </div>
                    )}

                    <div>id: {reparacion?.id}</div>
                    <div>Drone: {drone?.data?.Nombre || 'Sin nombre'}</div>
                    <div>Modelo: {modeloDrone?.data?.NombreModelo || reparacion?.data?.ModeloDroneNameRep || 'Modelo no disponible'}</div>
                    <div>Cliente: {usuarioStore?.data?.NombreUsu} {usuarioStore?.data?.ApellidoUsu}</div>
                </div>
            </div>

            {/* Resumen de progreso */}
            <ResumenProgreso />

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

            {seccionesVisibles.consulta && (
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
                            <label className="form-label">Nombre del Drone</label>
                            <select
                                className="form-control"
                                id="DroneId"
                                value={reparacion?.data?.DroneId || ""}
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
                            {dronesDelCliente.length === 0 && usuarioStore?.id && (
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
                                value={modeloDrone?.data?.NombreModelo || reparacion?.data?.ModeloDroneNameRep || ""}
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

                        {/* Botones de avance de estado para CONSULTA */}
                        {isAdmin && (
                            <div className="d-flex flex-wrap gap-2 mt-3">
                                {puedeAvanzarA('Respondido') && (
                                    <button
                                        type="button"
                                        className="btn btn-success flex-fill"
                                        style={{ minWidth: '140px' }}
                                        onClick={avanzarARespondido}
                                    >
                                        Marcar como Respondido
                                    </button>
                                )}
                                {puedeAvanzarA('Transito') && (
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
            )}

            {/* Resto de secciones del formulario */}
            {seccionesVisibles.recepcion && (
                <div className="card mb-3" id="seccion-recepcion">
                    <div className="card-body">
                        <h5 className="card-title bluemcdron">RECEPCIÓN</h5>

                        {/* Mostrar información del estado actual si no está recibido */}
                        {reparacion.data.EstadoRep !== 'Recibido' && (
                            <div className="alert alert-info mb-3">
                                <strong>Estado actual:</strong> {reparacion.data.EstadoRep}
                                <br />
                                <small>Una vez que el equipo llegue al taller, márcalo como recibido.</small>
                            </div>
                        )}

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
                                    disabled={!reparacion?.data?.FeRecRep}
                                    title={!reparacion?.data?.FeRecRep ? "Primero marque como recibido" : "Enviar recibo por email"}
                                >
                                    <i className="bi bi-envelope"></i>
                                </button>
                            </div>
                        </div>

                        {/* Botones de avance de estado para RECEPCIÓN */}
                        {isAdmin && (
                            <div className="mt-3">
                                {puedeAvanzarA('Recibido') && (
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={avanzarARecibido}
                                    >
                                        <i className="bi bi-check-circle me-2"></i>
                                        Marcar como Recibido
                                    </button>
                                )}
                                {reparacion.data.EstadoRep === 'Recibido' && (
                                    <div className="alert alert-success mt-2 mb-0">
                                        <i className="bi bi-check-circle-fill me-2"></i>
                                        Equipo recibido correctamente
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {seccionesVisibles.revision && (
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
                                value={reparacion?.data?.NumeroSerieRep || ""}
                                disabled={!isAdmin}
                            />
                        </div>
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
                        <div>
                            <label className="form-label">Observaciones del Técnico</label>
                            <TextareaAutosize
                                onChange={handleOnChange}
                                className="form-control"
                                id="DiagnosticoRep"
                                value={reparacion?.data?.DiagnosticoRep || ""}
                                rows={5}
                                disabled={!isAdmin}
                            />
                        </div>

                        {/* Botones de avance de estado para REVISIÓN */}
                        {isAdmin && puedeAvanzarA('Revisado') && (
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
            )}

            {seccionesVisibles.presupuesto && (
                <div className="card mb-3" id="seccion-presupuesto">
                    <div className="card-body">
                        <h5 className="card-title bluemcdron">PRESUPUESTO</h5>
                        <h6 className="card-title bluemcdron">INTERVENCIONES</h6>
                        <IntervencionesReparacion
                            reparacionId={reparacion.id}
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

                        {/* Botones de avance de estado para PRESUPUESTO */}
                        {isAdmin && (
                            <div className="mt-3">
                                {/* Botón de Presupuestado arriba */}
                                {puedeAvanzarA('Presupuestado') && (
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

                                {/* Botones de Aceptado y Rechazado juntos abajo */}
                                {(puedeAvanzarA('Aceptado') || puedeAvanzarA('Rechazado')) && (
                                    <div className="d-flex flex-wrap gap-2">
                                        {puedeAvanzarA('Aceptado') && (
                                            <button
                                                type="button"
                                                className="btn btn-success flex-fill"
                                                style={{ minWidth: '140px' }}
                                                onClick={avanzarAAceptado}
                                            >
                                                Presupuesto Aceptado
                                            </button>
                                        )}
                                        {puedeAvanzarA('Rechazado') && (
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
            )}

            {(isAdmin && seccionesVisibles.repuestos) ? // Sólo para administrador
                <div className="card mb-3" id="seccion-repuestos">
                    <div className="card-body">
                        <h5 className="card-title bluemcdron">REPUESTOS</h5>
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

            {seccionesVisibles.reparar && (
                <div className="card mb-3" id="seccion-reparar">
                    <div className="card-body">
                        <h5 className="card-title bluemcdron">REPARAR</h5>
                        <div>
                            <label className="form-label">Informe de Reparación o Diagnóstico</label>
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

                        {/* Botones de avance de estado para REPARAR */}
                        {isAdmin && (
                            <div className="mt-3">
                                {/* La lógica está centralizada en puedeAvanzarA() */}
                                {puedeAvanzarA('Reparado') && (
                                    <button
                                        type="button"
                                        className="btn btn-success"
                                        onClick={avanzarAReparado}
                                    >
                                        Marcar como Reparado
                                    </button>
                                )}
                                {puedeAvanzarA('Diagnosticado') && (
                                    <button
                                        type="button"
                                        className="btn btn-warning"
                                        onClick={avanzarADiagnosticado}
                                    >
                                        Marcar como Diagnosticado
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {seccionesVisibles.entrega && (
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

                        {/* Botones de avance de estado para ENTREGA */}
                        {isAdmin && (
                            <div className="mt-3">
                                {/* Primera fila de botones */}
                                <div className="d-flex flex-wrap gap-2 mb-2">
                                    {(reparacion.data.EstadoRep === 'Reparado' || reparacion.data.EstadoRep === 'Diagnosticado') && puedeAvanzarA('Cobrado') && (
                                        <button
                                            type="button"
                                            className="btn btn-info flex-fill"
                                            style={{ minWidth: '140px' }}
                                            onClick={avanzarACobrado}
                                        >
                                            Marcar como Cobrado
                                        </button>
                                    )}
                                    {puedeAvanzarA('Enviado') && (
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

                                {/* Segunda fila de botones */}
                                <div className="d-flex flex-wrap gap-2">
                                    {puedeAvanzarA('Finalizado') && (
                                        <button
                                            type="button"
                                            className="btn btn-success flex-fill"
                                            style={{ minWidth: '140px' }}
                                            onClick={avanzarAFinalizado}
                                        >
                                            Finalizar Reparación
                                        </button>
                                    )}
                                    {puedeAvanzarA('Abandonado') && (
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
            )}

            {seccionesVisibles.fotos && (
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
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    zIndex: 1000,
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
            )}

            {seccionesVisibles.documentos && (
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
            )}

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
