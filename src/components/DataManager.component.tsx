import { useEffect, useState } from "react";
import {
    getMessagesPersistencia,
    getReparacionesPersistencia,
    getRepuestosPersistencia,
    getUsuariosPersistencia,
    getModelosDronePersistencia,
    getDronesPersistencia,
    getIntervencionesPersistencia
} from "../persistencia/persistencia"; // Actualizado para usar la importación centralizada
import { useAppDispatch } from "../redux-tool-kit/hooks/useAppDispatch";
import { setReparaciones } from "../redux-tool-kit/reparacion/reparacion.slice";
import { ReparacionType } from "../types/reparacion";
import { Unsubscribe } from "firebase/auth";
import { useAppSelector } from "../redux-tool-kit/hooks/useAppSelector";
import { setUsuarios, setUsuariosSelect } from "../redux-tool-kit/usuario/usuario.slice";
import { Usuario } from "../types/usuario";
import { setMessages } from "../redux-tool-kit/mensaje/mensaje.slice";
import { setRepuestos } from "../redux-tool-kit/repuesto/repuesto.slice";
import { Repuesto } from "../types/repuesto";
import { ModeloDrone } from "../types/modeloDrone";
import { setModelosDrone } from "../redux-tool-kit/modeloDrone/modeloDrone.slice";
import { Drone } from "../types/drone";
import { setDrones } from "../redux-tool-kit/drone/drone.slice";
import { Intervencion } from "../types/intervencion";
import { setIntervenciones } from "../redux-tool-kit/intervencion/intervencion.slice";
import { verificarConexionWebSocketAsync } from "../redux-tool-kit/app/app.actions";

export interface DataManagerProps {
    children: React.ReactNode;
}

export function DataManagerComponent({ children }: DataManagerProps): React.ReactElement {
    const dispatch = useAppDispatch();
    const usuario = useAppSelector(state => state.app.usuario);
    const usuarioIdMessage = useAppSelector(state => state.mensaje.usuarioIdMessage);
    const otherUserIdMessage = useAppSelector(state => state.mensaje.otherUserIdMessage);
    const [unsubscribeReparaciones, setUnsubscribeReparaciones] = useState<Unsubscribe>();
    const [unsubscribeUsuarios, setUnsubscribeUsuarios] = useState<Unsubscribe>();
    const [unsubscribeMessages, setUnsubscribeMessages] = useState<Unsubscribe>();
    const [unsubscribeRepuestos, setUnsubscribeRepuestos] = useState<Unsubscribe>();
    const [unsubscribeModelosDrone, setUnsubscribeModelosDrone] = useState<Unsubscribe>();
    const [unsubscribeDrones, setUnsubscribeDrones] = useState<Unsubscribe>();
    const [unsubscribeIntervenciones, setUnsubscribeIntervenciones] = useState<Unsubscribe>();

    useEffect(() => {
        const handleVisibilityChange = async () => {
            try {
                const conectado = await dispatch(verificarConexionWebSocketAsync()).unwrap();
                if (conectado) {
                    console.log("Conexión al websocket activa");
                    getUsuarios();
                    getReparaciones();
                    // getMensajes();
                    getRepuestos();
                    getModelosDrone();
                    getDrones();
                    getIntervenciones();
                } else {
                    console.log("No hay conexión al websocket");
                }
            } catch (error) {
                console.error("Error al verificar conexión al websocket:", error);
            }
        };

        handleVisibilityChange();

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

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
        if (!usuarioIdMessage || !otherUserIdMessage) return;
        getMensajes();
        return () => {
            unsubscribeMessages?.();
        };
    }, [usuarioIdMessage, otherUserIdMessage]);

    useEffect(() => {
        getRepuestos();
        return () => {
            unsubscribeRepuestos?.();
        };
    }, []);

    useEffect(() => {
        getModelosDrone();
        return () => {
            unsubscribeModelosDrone?.();
        };
    }, []);

    useEffect(() => {
        getDrones();
        return () => {
            unsubscribeDrones?.();
        };
    }, []);

    useEffect(() => {
        getIntervenciones();
        return () => {
            unsubscribeIntervenciones?.();
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

            setUnsubscribeReparaciones(() => unsubscribe);
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
                        return {
                            value: usuario.id,
                            label: usuario.data.EmailUsu ?? usuario.data.NombreUsu,
                        }
                    });
                    dispatch(setUsuarios(usuarios));
                    dispatch(setUsuariosSelect(usuariosSelect));
                },
            );

            setUnsubscribeUsuarios(() => unsubscribe);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
        }
    };

    const getMensajes = async () => {
        try {
            const unsubscribe = await getMessagesPersistencia(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (mensajes: any) => { // TODO: Poner el tipo correcto
                    dispatch(setMessages(mensajes));
                },
                usuarioIdMessage,
                otherUserIdMessage,
            );

            setUnsubscribeMessages(() => unsubscribe);
        } catch (error) {
            console.error("Error al obtener mensajes:", error);
        }
    };

    const getRepuestos = async () => {
        try {
            const unsubscribe = await getRepuestosPersistencia(
                (repuestos: Repuesto[]) => {
                    dispatch(setRepuestos(repuestos));
                },
            );

            setUnsubscribeRepuestos(() => unsubscribe);
        } catch (error) {
            console.error("Error al obtener repuestos:", error);
        }
    };

    const getModelosDrone = async () => {
        try {
            const unsubscribe = await getModelosDronePersistencia(
                (modelosDrone: ModeloDrone[]) => {
                    dispatch(setModelosDrone(modelosDrone));
                }
            );

            setUnsubscribeModelosDrone(() => unsubscribe);
        } catch (error) {
            console.error("Error al obtener modelos de drones:", error);
        }
    };

    const getDrones = async () => {
        try {
            const unsubscribe = await getDronesPersistencia(
                (drones: Drone[]) => {
                    dispatch(setDrones(drones));
                }
            );

            setUnsubscribeDrones(() => unsubscribe);
        } catch (error) {
            console.error("Error al obtener drones:", error);
        }
    };

    const getIntervenciones = async () => {
        try {
            const unsubscribe = await getIntervencionesPersistencia(
                (intervenciones: Intervencion[]) => {
                    dispatch(setIntervenciones(intervenciones));
                }
            );
            setUnsubscribeIntervenciones(() => unsubscribe);
        } catch (error) {
            console.error("Error al obtener intervenciones:", error);
        }
    };

    return (
        <div>
            {children}
        </div>
    );
}