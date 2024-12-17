import {
    notificacionesPorMensajesPersistencia,
    actualizarLeidosPersistencia
} from '../persistencia/persistenciaFirebase';

export const convertTimestampCORTO = (timestamp) => {
    let d = new Date(parseInt(timestamp) * 1), // Convert the passed timestamp to milliseconds
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
    // eslint-disable-next-line no-undef
    cordova.plugins.email.open({
        ...data,
        body: encodeURIComponent(data.body),
    });
}

export const enviarSms = ({ number, message, options, success, error }) => {
    // eslint-disable-next-line no-undef
    sms.send(number, message, options, success, error);
}

export const triggerNotification = ({ title, text, foreground, vibrate }) => {
    console.log("envia notificacion");
    if (window.cordova) {
        // eslint-disable-next-line no-undef
        cordova.plugins.notification.local.schedule({
            title: title,
            text: text,
            foreground: foreground,
            vibrate: vibrate
        });
    }
}

export async function OpenaiFetchAPI(prompt) {
    const api_key_openai = process.env.REACT_APP_API_KEY_OPENAI;
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${api_key_openai}`
            },
            body: JSON.stringify({
                "model": "gpt-4o",
                "messages": [
                    {
                        "role": "system",
                        "content": "Cuando respondas, no digas claro, ni por supuesto, ni nada de eso."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0,
                "max_tokens": 500,
            })
        });
        return response.json().then(data => {
            return data['choices'][0].message.content
        });
    } catch (error) {
        console.error('Error al llamar a la API de OpenAI:', error);
        return 'No se pudo generar un diagnóstico automático.';
    }
}
