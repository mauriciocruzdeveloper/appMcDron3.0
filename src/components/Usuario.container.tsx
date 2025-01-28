import React from "react";
import { useEffect, useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import history from "../history";
import {
    // Usuario y Usuario es lo mismo, pero Usuario se usa para referirse
    // al usuario logueado, y Usuario para el usuario en un ABMC
    getProvinciasSelect,
    getLocalidadesPorProvincia,
} from "../redux-DEPRECATED/root-actions";
import {
    enviarEmail,
    enviarSms
} from "../utils/utils";
import UsuarioPresentational from './Usuario.presentational'
import type { Usuario } from "../types/usuario";
import { useAppSelector } from "../redux-tool-kit/hooks/useAppSelector";
import { useAppDispatch } from "../redux-tool-kit/hooks/useAppDispatch";
import { useModal } from "./Modal/useModal";
import { eliminarUsuarioAsync, guardarUsuarioAsync } from "../redux-tool-kit/usuario/usuario.actions";

interface ParamTypes {
    id: string;
}

export default function UsuarioComponent(): React.ReactElement | null {
    console.log("USUARIO container");

    const dispatch = useAppDispatch();

    const {
        openModal,
    } = useModal();

    const provinciasSelect = useAppSelector(state => state.usuario.provinciasSelect);
    const localidadesSelect = useAppSelector(state => state.usuario.localidadesSelect);
    const coleccionUsuarios = useAppSelector(state => state.usuario.coleccionUsuarios);

    const { id } = useParams<ParamTypes>();

    const [usuario, setUsuario] = useState<Usuario>();

    const inicializaFormulario = useCallback(async () => {
        if (!provinciasSelect?.length) {
            const provincias = await dispatch(getProvinciasSelect());

            if (!provincias.length) {
                openModal({
                    mensaje: "Error al cargar las provincias.",
                    tipo: "danger",
                    titulo: "Cargar Provincias",
                })
            }
        }
        setUsuario(coleccionUsuarios.find(usuario => usuario.id == id))
    }, [coleccionUsuarios]);

    useEffect(() => {
        inicializaFormulario();
    }, [inicializaFormulario]);

    if (!usuario) return null;

    const changeInputUsu = (field: string, value: string) => {
        setUsuario({
            ...usuario,
            data: {
                ...usuario.data,
                [field]: value
            }
        });
    };

    const confirmaGuardarUsuario = async () => {
        const response = await dispatch(guardarUsuarioAsync(usuario));
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

    const confirmEliminarUsuario = async () => {
        if (!usuario) return;
        const response = await dispatch(eliminarUsuarioAsync(usuario.id));
        if (response.meta.requestStatus === 'fulfilled') {
            openModal({
                mensaje: "Usuario eliminado correctamente.",
                tipo: "success",
                titulo: "Eliminar Usuario",
            })
            history.goBack();
        } else {
            openModal({
                mensaje: "Error al eliminar el usuario.",
                tipo: "danger",
                titulo: "Eliminar Usuario",
            })
        }
    }

    const handleGuardarUsuario = async () => {
        openModal({
            mensaje: "Desea guardar los cambios?",
            tipo: "warning",
            titulo: "Guardar Usuario",
            confirmCallback: confirmaGuardarUsuario,
        })
    }

    const handleEliminarUsuario = () => {
        openModal({
            mensaje: "Desea eliminar el Usuario?",
            tipo: "danger",
            titulo: "Eliminar Usuario",
            confirmCallback: confirmEliminarUsuario,
        })
    }

    const handleOnChangeProvincias = async (value: string) => {
        if (!usuario) return;

        await dispatch(getLocalidadesPorProvincia(value));
        setUsuario({
            ...usuario,
            data: {
                ...usuario.data,
                ProvinciaUsu: value
            }
        });
    }

    const handleOnChangeLocalidades = (value: string) => {
        setUsuario({
            ...usuario,
            data: {
                ...usuario.data,
                CiudadUsu: value
            }
        });
    }

    const handleSendEmail = () => {
        const data = {
            to: usuario.data.EmailUsu,
            cc: 'info@mauriciocruzdrones.com',
            bcc: [],
            subject: '',
            body: ''
        };
        enviarEmail(data);
    }

    const handleSendSms = () => {
        const data = {
            number: usuario.data.TelefonoUsu, /* iOS: ensure number is actually a string */
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

    return (
        // Sólo se renderiza el commponente presentacional cuando están los datos necesarios ya cargados.
        usuario && provinciasSelect.length ?
            <UsuarioPresentational
                usuario={usuario}
                provinciasSelect={provinciasSelect}
                localidadesSelect={localidadesSelect}
                handleGuardarUsuario={handleGuardarUsuario}
                handleEliminarUsuario={handleEliminarUsuario}
                changeInputUsu={changeInputUsu}
                onChangeProvincias={handleOnChangeProvincias}
                onChangeLocalidades={handleOnChangeLocalidades}
                handleSendEmail={handleSendEmail}
                handleSendSms={handleSendSms}
            /> : null
    )
}
