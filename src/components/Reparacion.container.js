// React
import { useEffect, useCallback, useState } from "react";
//
import history from "../history";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
// Actions
import { 
    guardarReparacion,
    eliminarReparacion,
    confirm,
  } from "../redux/root-actions";
// Utils
import { 
    enviarEmail,
    enviarSms
} from "../utils/utils";
// No se si está bien. Me gusta más que lo traiga la persistencia mediante una acción.
import { estados } from '../datos/estados.json';
// Components
import ReparacionPresentational from './Reparacion.presentational';

const Reparacion = ({ 
    guardarReparacion,
    eliminarReparacion,
    confirm,
    coleccionReparaciones,
    admin
}) => {

    console.log("REPARACION container");

    const { id } = useParams();

    const [ reparacion, setReparacion ] = useState();

    const inicializarFormulario = useCallback(async () => {
        reparacion = await coleccionReparaciones.find(reparacion => reparacion.id == id);
        setReparacion(reparacion);
    // Cuando cambia la colección de reparaciones, el escuchador lo ve, y se actualiza la colección
    // entonces la pongo como dependencia del useCallback para que se vuelva a renderizar la función
    // y vuelva a setear la reparación como está en la actualidad.
    }, [coleccionReparaciones]);
    
    useEffect(() => {
        inicializarFormulario();
    }, [inicializarFormulario]);
    
    const changeInputRep = target => {
        let value = null;
        if(target.type == "date"){
            let anio = target.value.substr(0, 4);
            let mes = target.value.substr(5, 2)-1;
            let dia = target.value.substr(8, 2);
            value = new Date(anio, mes, dia).getTime()+10800001; // Se agrega este número para que de bien la fecha.
        }else{
            value = target.value;
        };
        setReparacion({ 
            ...reparacion, 
            data: {
                ...reparacion.data,
                [target.id]: value
            } 
        });
    };
    // Tengo que hacer una función aparte porque cuando modifica el estado de la reparación
    // también tengo que modificar la prioridad. Se podría hacer diferente quizás con 
    // id, value y otra prop del botón.
    const setEstado = (estado) => {
        let campofecha = null;

        switch(estado.nombre){
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
                break;
        }

        setReparacion({
            ...reparacion, 
            data: {
                ...reparacion.data,
                EstadoRep: estado.nombre, 
                PrioridadRep: estado.prioridad,
                [campofecha]: new Date().getTime()+10800001
            }
        });
    }

    const handleGuardarReparacion = () => {
        confirm(
            "Guardar Reparación?",
            "Atención",
            "warning",
            () => guardarReparacion(reparacion)
        );
    }

    const handleEliminarReparacion = () => {
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
        const datosEmail = {
            to: reparacion.data.UsuarioRep,
            cc: 'info@mauriciocruzdrones.com',
            bcc: [],
            subject: '',
            body:    ''
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
            error: e => alert('Message Failed:' + e)
        };
        enviarSms(data);
    }

    return(
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
}

const mapStateToProps = (state) => ({
    coleccionReparaciones: state.app?.coleccionReparaciones
});


export default connect(
    mapStateToProps, 
    {
        guardarReparacion, 
        eliminarReparacion, 
        confirm,
    })(Reparacion);