import {
    notificacionesPorMensajesPersistencia
} from '../persistencia/persistenciaFirebase';

export const convertTimestampCORTO = (timestamp) => {
    let d = new Date(parseInt(timestamp)*1), // Convert the passed timestamp to milliseconds
    yyyy = d.getFullYear(),
    mm = ('0' + (d.getMonth() + 1)).slice(-2),  // Months are zero based. Add leading 0.
    dd = ('0' + d.getDate()).slice(-2);
    let time = yyyy + '-' + mm + '-' + dd;
      
    return time;
};

export const actualizarLeidos = () => {

}

export const notificacionesPorMensajes = (EmailUsu) => {
    notificacionesPorMensajesPersistencia(EmailUsu);
}