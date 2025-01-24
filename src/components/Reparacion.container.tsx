import React from "react";
import { useEffect, useState } from "react";
import history from "../history";
import { useParams } from "react-router-dom";
import {
    guardarReparacion,
    eliminarReparacion,
    enviarRecibo,
} from "../redux-DEPRECATED/root-actions";
import {
    enviarSms,
} from "../utils/utils";
import { estados } from '../datos/estados';
import ReparacionPresentational from './Reparacion.presentational';
import { Estado } from "../types/estado";
import { ReparacionType } from "../types/reparacion";
import { generarAutoDiagnostico } from "../redux-DEPRECATED/App/App.actions";
import { enviarEmailVacio } from "../utils/sendEmails";
import { subirFotoReparacionPersistencia, eliminarFotoReparacionPersistencia } from "../persistencia/subeFotoFirebase";
import { useAppSelector } from "../redux-tool-kit/hooks/useAppSelector";
import { useAppDispatch } from "../redux-tool-kit/hooks/useAppDispatch";
import { useModal } from "./Modal/useModal";

interface ParamTypes {
    id: string;
}


export default function Reparacion(): React.ReactElement | null {
    console.log("REPARACION container");

    const dispatch = useAppDispatch();

    const {
        openModal,
    } = useModal();

    const coleccionReparaciones = useAppSelector(state => state.reparacion.coleccionReparaciones);
    const isAdmin = useAppSelector(state => state.app.usuario?.data.Admin) ?? false;

    const { id } = useParams<ParamTypes>();

    const [reparacionOriginal, setReparacionOriginal] = useState<ReparacionType>();
    const [reparacion, setReparacion] = useState<ReparacionType>();

    useEffect(() => {
        if (!coleccionReparaciones) return;
        const rep = coleccionReparaciones.find(reparacion => String(reparacion.id) === id);
        setReparacionOriginal(rep);
        setReparacion(rep);
    }, [coleccionReparaciones, id]);

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
        const response = await dispatch(guardarReparacion(reparacion));
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
        const response = await dispatch(eliminarReparacion(reparacion.id));
        if (response.meta.requestStatus === 'fulfilled') {
            openModal({
                mensaje: "Reparación eliminada correctamente.",
                tipo: "success",
                titulo: "Eliminar Reparación",
            })
            history.goBack();
        } else {
            openModal({
                mensaje: "Error al eliminar la reparación.",
                tipo: "danger",
                titulo: "Eliminar Reparación",
            })
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
            tipo: "Atención",
            titulo: "danger",
            confirmCallback: confirmEliminarReparacion,
        })
    }

    const handleSendEmail = () => {
        if (!reparacion) return;
        enviarEmailVacio(reparacion);
    }

    const handleSendRecibo = () => {
        if (!reparacion) return;
        dispatch(enviarRecibo(reparacion));
    }

    const handleSendSms = () => {
        const data = {
            number: reparacion?.data?.TelefonoUsu || '', /* iOS: ensure number is actually a string */
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
        setReparacion({
            ...reparacion,
            data: {
                ...reparacion.data,
                DiagnosticoRep: diagnostico,
            }
        });
    }

    const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length || !reparacion) return;
        const file = e.target.files[0];
        const urlFoto = await subirFotoReparacionPersistencia(reparacion.id, file);
        setReparacion({
            ...reparacion,
            data: {
                ...reparacion.data,
                urlsFotos: [...(reparacion.data.urlsFotos || []), urlFoto]
            }
        });
    };

    const handleDeleteFoto = async (fotoUrl: string) => {
        if (!reparacion) return;
        await eliminarFotoReparacionPersistencia(reparacion.id, fotoUrl);
        setReparacion({
            ...reparacion,
            data: {
                ...reparacion.data,
                urlsFotos: reparacion.data.urlsFotos?.filter(url => url !== fotoUrl)
            }
        });
    };

    return (
        // Sólo se renderiza el componente presentacional cuando están los datos necesarios ya cargados.
        estados && reparacion ?
            <ReparacionPresentational
                admin={isAdmin}
                reparacion={reparacion}
                estados={estados}
                setEstado={setEstado}
                changeInputRep={changeInputRep}
                handleGuardarReparacion={handleGuardarReparacion}
                handleEliminarReparacion={handleEliminarReparacion}
                handleSendEmail={handleSendEmail}
                handleSendSms={handleSendSms}
                handleSendRecibo={handleSendRecibo}
                handleGenerarAutoDiagnostico={handleGenerarAutoDiagnostico}
                handleFotoChange={handleFotoChange}
                handleDeleteFoto={handleDeleteFoto}
            /> : null
    )
}
