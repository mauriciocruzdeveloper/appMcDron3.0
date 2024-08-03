import {
    notificacionesPorMensajesPersistencia,
    actualizarLeidosPersistencia
} from '../persistencia/persistenciaFirebase';

export const convertTimestampCORTO = (timestamp) => {
    let d = new Date(parseInt(timestamp)*1), // Convert the passed timestamp to milliseconds
    yyyy = d.getFullYear(),
    mm = ('0' + (d.getMonth() + 1)).slice(-2),  // Months are zero based. Add leading 0.
    dd = ('0' + d.getDate()).slice(-2);
    let time = yyyy + '-' + mm + '-' + dd;
      
    return time;
};

export const actualizarLeidos = (mensajesLeidos) => {
    actualizarLeidosPersistencia(mensajesLeidos);
}

export const notificacionesPorMensajes = (EmailUsu) => {
    notificacionesPorMensajesPersistencia(EmailUsu);
}

export const enviarEmail = (data) => {
    cordova.plugins.email.open(data);
}

export const enviarSms = ({ number, message, options, success, error }) => {
    sms.send(number, message, options, success, error);
}

export const triggerNotification = ({ title, text, foreground, vibrate }) => {
    console.log("envia notificacion");
    if(window.cordova) {
        cordova.plugins.notification.local.schedule({
            title: title,
            text: text,
            foreground: foreground,
            vibrate: vibrate
        });
    };
}