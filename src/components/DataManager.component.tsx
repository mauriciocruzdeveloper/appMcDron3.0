import { useEffect, useState } from "react";
import { getMessagesPersistencia, getReparacionesPersistencia, getRepuestosPersistencia, getUsuariosPersistencia } from "../persistencia/persistenciaFirebase";
import { useAppDispatch } from "../redux-tool-kit/hooks/useAppDispatch";
import { setReparaciones } from "../redux-tool-kit/reparacion/reparacion.slice";
import { ReparacionType } from "../types/reparacion";
import { Unsubscribe } from "firebase/auth";
import { useAppSelector } from "../redux-tool-kit/hooks/useAppSelector";
import { setUsuarios, setUsuariosSelect } from "../redux-tool-kit/usuario/usuario.slice";
import { Usuario } from "../types/usuario";
import { setMessages } from "../redux-tool-kit/mensaje/mensaje.slice";
import { setRepuestos } from "../redux-tool-kit/repuesto/repuesto.slice";

export interface DataManagerProps {
    children: React.ReactNode;
}

export function DataManagerComponent({ children }: DataManagerProps): React.ReactElement {
    const dispatch = useAppDispatch();
    const usuario = useAppSelector(state => state.app.usuario);
    const emailUsuMessage = useAppSelector(state => state.mensaje.emailUsuMessage);
    const emailCliMessage = useAppSelector(state => state.mensaje.emailCliMessage);
    const [unsubscribeReparaciones, setUnsubscribeReparaciones] = useState<Unsubscribe>();
    const [unsubscribeUsuarios, setUnsubscribeUsuarios] = useState<Unsubscribe>();
    const [unsubscribeMessages, setUnsubscribeMessages] = useState<Unsubscribe>();

    useEffect(() => {
        getUsuarios();
        return () => {
            unsubscribeUsuarios?.();
        };
    }, []);

    useEffect(() => {
        getReparaciones();
        return () => {
            unsubscribeReparaciones?.();
        };
    }, [usuario]);

    useEffect(() => {
        if (!emailUsuMessage || !emailCliMessage) return;
        getMensajes();
        return () => {
            unsubscribeMessages?.();
        };
    }, [emailUsuMessage, emailCliMessage]);

    useEffect(() => {
        getRepuestos();
        return () => {
            unsubscribeReparaciones?.();
        };
    }, []);

    const getReparaciones = async () => {
        try {
            const unsubscribe = await getReparacionesPersistencia(
                (reparaciones: ReparacionType[]) => {
                    dispatch(setReparaciones(reparaciones));
                },
                usuario
            );

            setUnsubscribeReparaciones(() => unsubscribe); // Guarda el unsubscribe en el estado local
        } catch (error) {
            console.error("Error al obtener reparaciones:", error);
        }
    };

    const getUsuarios = async () => {
        try {
            const unsubscribe = await getUsuariosPersistencia(
                (usuarios: Usuario[]) => {
                    dispatch(setUsuarios(usuarios));
                    const usuariosSelect = usuarios.map(usuario => {
                        const dato = usuario.data.EmailUsu ? usuario.data.EmailUsu : usuario.id;
                        return {
                            value: dato,
                            label: dato,
                        }
                    });
                    dispatch(setUsuarios(usuarios));
                    // TODO: Para los usuarios select hacer un selector específico, cuando haga selectores. Usar librería reselct
                    dispatch(setUsuariosSelect(usuariosSelect));
                },
            );

            setUnsubscribeUsuarios(() => unsubscribe); // Guarda el unsubscribe en el estado local
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
        }
    };

    const getMensajes = async () => {
        try {
            const unsubscribe = await getMessagesPersistencia(
                (mensajes: any) => {
                    dispatch(setMessages(mensajes));
                },
                emailUsuMessage,
                emailCliMessage,
            );

            setUnsubscribeMessages(() => unsubscribe); // Guarda el unsubscribe en el estado local
        } catch (error) {
            console.error("Error al obtener mensajes:", error);
        }
    };

    const getRepuestos = async () => {
        try {
            const unsubscribe = await getRepuestosPersistencia(
                (repuestos: any) => {
                    dispatch(setRepuestos(repuestos));
                },
            );

            setUnsubscribeReparaciones(() => unsubscribe); // Guarda el unsubscribe en el estado local
        } catch (error) {
            console.error("Error al obtener reparaciones:", error);
        }
    }

    // TODO: Hace falta que sea un wrapper???
    return (
        <div>
            {children}
        </div>
    );
}