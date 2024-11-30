import { useEffect, useCallback, useState, FC } from "react";
import history from "../history";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import {
    guardarReparacion,
    eliminarReparacion,
    confirm,
} from "../redux/root-actions";
import {
    enviarEmail,
    enviarSms
} from "../utils/utils";
import { estados } from '../datos/estados';
import ReparacionPresentational from './Reparacion.presentational';
import { RootState } from "../redux/App/App.reducer";
import { Estado } from "../types/estado";
import { ReparacionType } from "../types/reparacion";
import { setReparacionesToRedux } from "../redux/App/App.actions";

interface ReparacionProps {
    guardarReparacion: (reparacion: ReparacionType) => void;
    eliminarReparacion: (id: string) => void;
    confirm: (message: string, title: string, type: string, callback: () => void) => void;
    coleccionReparaciones: ReparacionType[];
    admin: boolean;
}

interface ParamTypes {
    id: string;
}

const Reparacion: FC<ReparacionProps> = (props) => {

    const {
        guardarReparacion,
        eliminarReparacion,
        confirm,
        coleccionReparaciones,
        admin,
    } = props;

    console.log("REPARACION container");

    const { id } = useParams<ParamTypes>();

    const [reparacion, setReparacion] = useState<ReparacionType>();

    useEffect(() => {
        if (!coleccionReparaciones) return;
        const rep = coleccionReparaciones.find(reparacion => String(reparacion.id) === id);
        setReparacion(rep);
    }, [coleccionReparaciones, id]);

    if (!reparacion) return null;

    const changeInputRep = (field: string, value: string) => {
        if (!reparacion) return;
        setReparacion({
            ...reparacion,
            data: {
                ...reparacion.data,
                [field]: value
            }
        });
    };
    // Tengo que hacer una función aparte porque cuando modifica el estado de la reparación
    // también tengo que modificar la prioridad. Se podría hacer diferente quizás con 
    // id, value y otra prop del botón.
    const setEstado = (estado: Estado) => {
        if (!reparacion) return;

        let campofecha = null;
        switch (estado.nombre) {
            case "En Espera":
                campofecha = "FechaEsperaRep";
                break;
            case "En Reparación":
                campofecha = "FechaReparacionRep";
                break;
            case "Reparado":
                campofecha = "FechaReparadoRep";
                break;
            case "Entregado":
                campofecha = "FechaEntregadoRep";
                break;
            case "Cancelado":
                campofecha = "FechaCanceladoRep";
                break;
            default:
                return;
        }

        setReparacion({
            ...reparacion,
            data: {
                ...reparacion.data,
                EstadoRep: estado.nombre,
                PrioridadRep: estado.prioridad,
                [campofecha]: new Date().getTime() + 10800001
            }
        });
    }

    const handleGuardarReparacion = () => {
        confirm(
            "Guardar Reparación?",
            "Atención",
            "warning",
            () => {
                guardarReparacion(reparacion)
                // TODO: Verficiar esto. La idea es guardar en el state de redux la reparación modificada a la vez que en la base de datos.
                // esto debería estar en el action creator de guardarReparacion
                // También hay que agregar un mecanismo para que cuando se guarde o no se guarde, redux se actualice.
                // O quizás intenar guardar varias veces hasta que se consiga, y si no se consigue, mostrar un mensaje de error.
                const newColleccionReparaciones = coleccionReparaciones.map(rep => {
                    if (rep.id === reparacion.id) return reparacion;
                    return rep;
                });
            }
        );

    }

    const handleEliminarReparacion = () => {
        if (!reparacion) return;

        confirm(
            "Eliminar Reparación?",
            "Atención",
            "danger",
            async () => {
                await eliminarReparacion(reparacion.id);
                history.goBack();
            }
        );
    }

    const handleSendEmail = () => {
        if (!reparacion) return;

        const datosEmail = {
            to: reparacion.data.UsuarioRep,
            cc: 'info@mauriciocruzdrones.com',
            bcc: [],
            subject: '',
            body: ''
        };
        enviarEmail(datosEmail);
    }

    // Estas funciones, acá y en usuario, hay que modificarlas y hacer todo dentro de enviarSms()
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
            error: (e: any) => alert('Message Failed:' + e)
        };
        enviarSms(data);
    }

    return (
        // Sólo se renderiza el commponente presentacional cuando están los datos necesarios ya cargados.
        estados && reparacion ?
            <ReparacionPresentational
                admin={admin}
                reparacion={reparacion}
                estados={estados}
                setEstado={setEstado}
                changeInputRep={changeInputRep}
                handleGuardarReparacion={handleGuardarReparacion}
                handleEliminarReparacion={handleEliminarReparacion}
                handleSendEmail={handleSendEmail}
                handleSendSms={handleSendSms}
            /> : null
    )
};

const mapStateToProps = (state: RootState) => ({
    coleccionReparaciones: state.app.coleccionReparaciones
});


export default connect(
    mapStateToProps,
    {
        guardarReparacion,
        eliminarReparacion,
        confirm,
    })(Reparacion);