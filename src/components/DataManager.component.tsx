import { useEffect, useRef } from "react";
import {
    getMessagesPersistencia,
    getReparacionesPersistencia,
    getRepuestosPersistencia,
    getUsuariosPersistencia,
    getModelosDronePersistencia,
    getDronesPersistencia,
    getIntervencionesPersistencia,
    getPedidosPersistencia,
    getPlantillasEmailPersistencia,
    getCampanasEmailPersistencia,
    initWebSocketManager,
    stopWebSocketManager,
    verifyAndReconnectChannels
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
import { setPedidos } from "../redux-tool-kit/pedidoRepuesto/pedidoRepuesto.slice";
import { PedidoRepuesto } from "../types/pedidoRepuesto";
import { verificarConexionWebSocketAsync } from "../redux-tool-kit/app/app.actions";
import { setPlantillasEmail } from "../redux-tool-kit/plantillaEmail/plantillaEmail.slice";
import { setCampanasEmail } from "../redux-tool-kit/campanaEmail/campanaEmail.slice";
import { EmailTemplate } from "../types/emailTemplate";
import { EmailCampaign } from "../types/emailCampaign";
import { PullToRefresh } from "./PullToRefresh.component";

export interface DataManagerProps {
    children: React.ReactNode;
}

export function DataManagerComponent({ children }: DataManagerProps): React.ReactElement {
    const dispatch = useAppDispatch();
    const usuario = useAppSelector(state => state.app.usuario);
    const usuarioIdMessage = useAppSelector(state => state.mensaje.usuarioIdMessage);
    const otherUserIdMessage = useAppSelector(state => state.mensaje.otherUserIdMessage);
    // Refs (no state) para que cleanups y handlers siempre vean la desuscripción vigente
    const unsubscribeReparaciones = useRef<Unsubscribe>();
    const unsubscribeUsuarios = useRef<Unsubscribe>();
    const unsubscribeMessages = useRef<Unsubscribe>();
    const unsubscribeRepuestos = useRef<Unsubscribe>();
    const unsubscribeModelosDrone = useRef<Unsubscribe>();
    const unsubscribeDrones = useRef<Unsubscribe>();
    const unsubscribeIntervenciones = useRef<Unsubscribe>();
    const unsubscribePedidos = useRef<Unsubscribe>();
    const unsubscribePlantillasEmail = useRef<Unsubscribe>();
    const unsubscribeCampanasEmail = useRef<Unsubscribe>();

    // 🚀 Inicializar WebSocket Manager al montar el componente
    useEffect(() => {
        console.log('🔧 Inicializando WebSocket Manager...');
        initWebSocketManager();

        return () => {
            console.log('🔧 Deteniendo WebSocket Manager...');
            stopWebSocketManager();
        };
    }, []);

    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.hidden) {
                console.log("📱 App en segundo plano");
                return;
            }

            console.log("📱 App en primer plano - Verificando conexión...");
            
            try {
                // Usar el nuevo WebSocket Manager para verificar y reconectar
                const result = await verifyAndReconnectChannels();
                
                if (result.success) {
                    console.log(`✅ Verificación completada: ${result.reconnected}/${result.total} canales reconectados`);
                    
                    // Solo recargar datos si hubo reconexiones
                    if (result.reconnected > 0) {
                        console.log("🔄 Recargando datos después de reconexión...");
                        reloadAllData();
                    }
                } else {
                    console.log("⚠️ No se pudo verificar la conexión WebSocket");
                }
            } catch (error) {
                console.error("❌ Error al verificar conexión al websocket:", error);
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
            unsubscribeUsuarios.current?.();
        };
    }, []);

    useEffect(() => {
        getReparaciones();
        return () => {
            unsubscribeReparaciones.current?.();
        };
    }, [usuario]);

    useEffect(() => {
        if (!usuarioIdMessage || !otherUserIdMessage) return;
        getMensajes();
        return () => {
            unsubscribeMessages.current?.();
        };
    }, [usuarioIdMessage, otherUserIdMessage]);

    useEffect(() => {
        getRepuestos();
        return () => {
            unsubscribeRepuestos.current?.();
        };
    }, []);

    useEffect(() => {
        getModelosDrone();
        return () => {
            unsubscribeModelosDrone.current?.();
        };
    }, []);

    useEffect(() => {
        getDrones();
        return () => {
            unsubscribeDrones.current?.();
        };
    }, []);

    useEffect(() => {
        getIntervenciones();
        return () => {
            unsubscribeIntervenciones.current?.();
        };
    }, []);

    useEffect(() => {
        getPedidos();
        return () => {
            unsubscribePedidos.current?.();
        };
    }, []);

    useEffect(() => {
        getPlantillasEmail();
        return () => {
            unsubscribePlantillasEmail.current?.();
        };
    }, []);

    useEffect(() => {
        getCampanasEmail();
        return () => {
            unsubscribeCampanasEmail.current?.();
        };
    }, []);

    const getReparaciones = async () => {
        try {
            // Cerrar el canal anterior antes de crear uno nuevo con el mismo topic
            unsubscribeReparaciones.current?.();
            const unsubscribe = await getReparacionesPersistencia(
                (reparaciones: ReparacionType[]) => {
                    dispatch(setReparaciones(reparaciones));
                },
                usuario
            );

            unsubscribeReparaciones.current = unsubscribe;
        } catch (error) {
            console.error("Error al obtener reparaciones:", error);
        }
    };

    const getUsuarios = async () => {
        try {
            unsubscribeUsuarios.current?.();
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

            unsubscribeUsuarios.current = unsubscribe;
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
        }
    };

    const getMensajes = async () => {
        try {
            unsubscribeMessages.current?.();
            const unsubscribe = await getMessagesPersistencia(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (mensajes: any) => { // TODO: Poner el tipo correcto
                    dispatch(setMessages(mensajes));
                },
                usuarioIdMessage,
                otherUserIdMessage,
            );

            unsubscribeMessages.current = unsubscribe;
        } catch (error) {
            console.error("Error al obtener mensajes:", error);
        }
    };

    const getRepuestos = async () => {
        try {
            unsubscribeRepuestos.current?.();
            const unsubscribe = await getRepuestosPersistencia(
                (repuestos: Repuesto[]) => {
                    dispatch(setRepuestos(repuestos));
                },
            );

            unsubscribeRepuestos.current = unsubscribe;
        } catch (error) {
            console.error("Error al obtener repuestos:", error);
        }
    };

    const getModelosDrone = async () => {
        try {
            unsubscribeModelosDrone.current?.();
            const unsubscribe = await getModelosDronePersistencia(
                (modelosDrone: ModeloDrone[]) => {
                    dispatch(setModelosDrone(modelosDrone));
                }
            );

            unsubscribeModelosDrone.current = unsubscribe;
        } catch (error) {
            console.error("Error al obtener modelos de drones:", error);
        }
    };

    const getDrones = async () => {
        try {
            unsubscribeDrones.current?.();
            const unsubscribe = await getDronesPersistencia(
                (drones: Drone[]) => {
                    dispatch(setDrones(drones));
                }
            );

            unsubscribeDrones.current = unsubscribe;
        } catch (error) {
            console.error("Error al obtener drones:", error);
        }
    };

    const getIntervenciones = async () => {
        try {
            unsubscribeIntervenciones.current?.();
            const unsubscribe = await getIntervencionesPersistencia(
                (intervenciones: Intervencion[]) => {
                    dispatch(setIntervenciones(intervenciones));
                }
            );
            unsubscribeIntervenciones.current = unsubscribe;
        } catch (error) {
            console.error("Error al obtener intervenciones:", error);
        }
    };

    const getPedidos = async () => {
        try {
            unsubscribePedidos.current?.();
            const unsubscribe = await getPedidosPersistencia(
                (pedidos: PedidoRepuesto[]) => {
                    dispatch(setPedidos(pedidos));
                }
            );
            unsubscribePedidos.current = unsubscribe;
        } catch (error) {
            console.error("Error al obtener pedidos:", error);
        }
    };

    const getPlantillasEmail = async () => {
        try {
            unsubscribePlantillasEmail.current?.();
            const unsubscribe = await getPlantillasEmailPersistencia(
                (plantillas: EmailTemplate[]) => {
                    dispatch(setPlantillasEmail(plantillas));
                }
            );
            unsubscribePlantillasEmail.current = unsubscribe;
        } catch (error) {
            console.error("Error al obtener plantillas de email:", error);
        }
    };

    const getCampanasEmail = async () => {
        try {
            unsubscribeCampanasEmail.current?.();
            const unsubscribe = await getCampanasEmailPersistencia(
                (campanas: EmailCampaign[]) => {
                    dispatch(setCampanasEmail(campanas));
                }
            );
            unsubscribeCampanasEmail.current = unsubscribe;
        } catch (error) {
            console.error("Error al obtener campanas de email:", error);
        }
    };

    // Refresco manual (gesto de deslizar hacia abajo): reintenta la conexión
    // realtime y vuelve a pedir todos los datos, igual que al volver del segundo plano
    const refreshAll = async () => {
        try {
            await verifyAndReconnectChannels();
            reloadAllData();
        } catch (error) {
            console.error("Error al refrescar datos:", error);
        }
    };

    // Cada getX() ya cierra su canal anterior antes de crear el nuevo,
    // por lo que rehacer todo es seguro (sin canales duplicados)
    const reloadAllData = () => {
        getUsuarios();
        getReparaciones();
        getRepuestos();
        getModelosDrone();
        getDrones();
        getIntervenciones();
        getPedidos();
        getPlantillasEmail();
        getCampanasEmail();
        if (usuarioIdMessage && otherUserIdMessage) {
            getMensajes();
        }
    };

    return (
        <PullToRefresh onRefresh={refreshAll}>
            {children}
        </PullToRefresh>
    );
}