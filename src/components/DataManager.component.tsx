import { useEffect, useState } from "react";
import { getReparacionesPersistencia, getUsuariosPersistencia } from "../persistencia/persistenciaFirebase";
import { useAppDispatch } from "../redux-tool-kit/hooks/useAppDispatch";
import { setReparaciones } from "../redux-tool-kit/reparacion/reparacion.slice";
import { ReparacionType } from "../types/reparacion";
import { Unsubscribe } from "firebase/auth";
import { useAppSelector } from "../redux-tool-kit/hooks/useAppSelector";
import { setUsuarios } from "../redux-tool-kit/usuario/usuario.slice";
import { Usuario } from "../types/usuario";

export interface DataManagerProps {
    children: React.ReactNode;
}

export function DataManagerComponent({ children }: DataManagerProps): React.ReactElement {
    console.log('!!! DataManagerComponent');
    const dispatch = useAppDispatch();
    const usuario = useAppSelector(state => state.app.usuario);
    const [unsubscribeReparaciones, setUnsubscribeReparaciones] = useState<Unsubscribe>();
    const [unsubscribeUsuarios, setUnsubscribeUsuarios] = useState<Unsubscribe>();

    useEffect(() => {
        getReparaciones();
        getUsuarios();

        return () => {
            unsubscribeReparaciones?.();
            unsubscribeUsuarios?.();
        };
    }, []);

    const getReparaciones = async () => {
        try {
            const unsubscribe = getReparacionesPersistencia(
                (reparaciones: ReparacionType[]) => {
                    console.log("!!! Reparaciones obtenidas:", reparaciones);
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
            const unsubscribe = getUsuariosPersistencia(
                (usuarios: Usuario[]) => {
                    console.log("!!! Usuarios obtenidos:", usuarios);
                    dispatch(setUsuarios(usuarios));
                },
            );

            setUnsubscribeUsuarios(() => unsubscribe); // Guarda el unsubscribe en el estado local
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
        }
    };

    // TODO: Hace falta que se aun wrapper
    return (
        <div>
            {children}
        </div>
    );
}