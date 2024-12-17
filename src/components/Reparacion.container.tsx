import { useEffect, useState, FC } from "react";
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
    enviarSms,
} from "../utils/utils";
import { estados } from '../datos/estados';
import ReparacionPresentational from './Reparacion.presentational';
import { RootState } from "../redux/App/App.reducer";
import { Estado } from "../types/estado";
import { ReparacionType } from "../types/reparacion";
import { generarAutoDiagnostico } from "../redux/App/App.actions";

interface ReparacionProps {
    guardarReparacion: (reparacion: ReparacionType) => void;
    eliminarReparacion: (id: string) => void;
    confirm: (message: string, title: string, type: string, callback: () => void) => void;
    generarAutoDiagnostico: (reparacion: ReparacionType) => Promise<string>;
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
        generarAutoDiagnostico,
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

        // TODO: Refactorizar los estados. Deben tener un id, incremental según el orden.
        // TODO: Las reglas de negocio no deben estar acá. Se podría hacer con clases. En las clases hasta podría validar los campos.
        // Si quiero bajar de estado desde Recibido, no puedo (ni seleccionar el mismo).
        if (reparacion.data.EstadoRep === 'Recibido' && (
            estado.nombre === 'Consulta' ||
            estado.nombre === 'Respondido' ||
            estado.nombre === 'Transito' ||
            estado.nombre === 'Recibido'
        )) return;

        if (reparacion.data.EstadoRep === 'Reparado' && (
            estado.nombre === 'Consulta' ||
            estado.nombre === 'Respondido' ||
            estado.nombre === 'Transito' ||
            estado.nombre === 'Recibido' ||
            estado.nombre === 'Revisado' ||
            estado.nombre === 'Presupuestado' ||
            estado.nombre === 'Reparar' ||
            estado.nombre === 'Repuestos' ||
            estado.nombre === 'Reparado'
        )) return;

        if (reparacion.data.EstadoRep === 'Entregado')
            return;

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

        if (campofecha && !newReparacion.data[`${campofecha}`]) {
            newReparacion.data = {
                ...newReparacion.data,
                [campofecha]: new Date().getTime(),
            };
        }

        setReparacion(newReparacion);

    }

    const confirmaGuardarReparacion = async () => {
        if (reparacion.data.EstadoRep === 'Recibido') reparacion.data.DiagnosticoRep = await generarAutoDiagnostico(reparacion);
        guardarReparacion(reparacion);
    }

    const handleGuardarReparacion = () => {
        confirm(
            "Guardar Reparación?",
            "Atención",
            "warning",
            confirmaGuardarReparacion,
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

        // TODO: Los datos de los emails tienen que estar en otro lado, e importarlos.
        const datosEmail = {
            to: reparacion.data.UsuarioRep,
            cc: 'info@mauriciocruzdrones.com',
            bcc: [],
            subject: '',
            body: ''
        };
        enviarEmail(datosEmail);
    }

    const handleSendRecibo = () => {
        if (!reparacion) return;

        const bodyContent =
`Nro. de reparación: ${reparacion.id}
Recibo de equipo: ${reparacion.data.DroneRep}
Fecha de ingreso: ${reparacion.data.FeRecRep}'
Observaciones: ${reparacion.data.DescripcionUsuRep}
Cliente: ${reparacion.data.NombreUsu} ${reparacion.data.ApellidoUsu}
Teléfono: ${reparacion.data.TelefonoUsu}
        
Mauricio Cruz Drones
www.mauriciocruzdrones.com
Teléfono: +54 9 341 7439091
Email: mauriciocruzdrones@gmail.com`;

        // TODO: Los datos de los emails tienen que estar en otro lado, e importarlos.
        const datosEmail = {
            to: reparacion.data.EmailUsu,
            cc: 'info@mauriciocruzdrones.com',
            bcc: [],
            subject: 'Recibo de equipo ' + reparacion.data.DroneRep,
            body: bodyContent,
            // isHtlm: true
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
                handleSendRecibo={handleSendRecibo}
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
        generarAutoDiagnostico,
    })(Reparacion);