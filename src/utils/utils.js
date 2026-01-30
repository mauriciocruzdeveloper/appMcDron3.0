/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { HttpMethod } from '../types/httpMethods';

import { isFetchingComplete, isFetchingStart } from "../redux-tool-kit/app/app.slice";
import { setLocalidadesSelect, setProvinciasSelect } from "../redux-tool-kit/usuario/usuario.slice";
import {
    actualizarLeidosPersistencia,
    notificacionesPorMensajesPersistencia,
    getLocPorProvPersistencia,
    getProvinciasSelectPersistencia,
} from '../persistencia/persistencia';

export const convertTimestampCORTO = (timestamp) => {
    if (!timestamp || isNaN(timestamp)) return '';
    
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

export const notificacionesPorMensajes = (usuarioId) => {
    notificacionesPorMensajesPersistencia(usuarioId);
}

/**
 * Obtiene el email correcto para enviar notificaciones al usuario
 * Prioriza EmailContacto si existe, sino usa EmailUsu
 * @param {Object} usuario - Objeto usuario con data.EmailContacto y data.EmailUsu
 * @returns {string} Email a usar para notificaciones
 */
export const getEmailForNotifications = (usuario) => {
    if (!usuario?.data) return '';
    return usuario.data.EmailContacto || usuario.data.EmailUsu || '';
}

export const enviarEmail = (data) => {
    // eslint-disable-next-line no-undef
    cordova.plugins.email.open({
        ...data,
        body: data.body,
    });
}

export const callEndpoint = async (params) => {
    const {
        url,
        method = HttpMethod.GET,
        body = null,
        apiKey = process.env.REACT_APP_ENDPOINT_API_KEY
    } = params;

    console.log(`Llamando al endpoint: ${url} con método ${method}`);

    try {
        // Configuración básica de los headers
        const headers = {
            'Content-Type': 'application/json',
            'X-API-KEY': apiKey, // Agregamos la API Key al header
        };

        // Configuración de la solicitud
        const options = {
            method,
            headers,
        };

        // Si el método tiene un cuerpo (POST, PUT, etc.), lo añadimos
        if (body) {
            options.body = JSON.stringify(body);
        }

        console.log(`callEndpoint Enviando solicitud al endpoint:`, { url, options });

        // Realizamos la solicitud
        const response = await fetch(url, options);

        console.log(`callEndpoint Respuesta recibida del endpoint:`, response);

        // Comprobamos si la respuesta es exitosa
        if (!response.ok) {
            console.error(`callEndpoint Error en la respuesta del endpoint:`, response);
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al llamar al endpoint');
        }

        console.log(`Respuesta recibida del endpoint: ${url}`);

        // Retornamos los datos en formato JSON
        return await response.json();
    } catch (error) {
        console.error('Error al llamar al endpoint:', error.message);
        throw error;
    }
};


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
        throw 'No se pudo generar un diagnóstico automático.';
    }
}



// ACCIONES DE REDUX

// Autodiagnóstico
export const generarAutoDiagnostico = (reparacion) => async (dispatch) => {
    const descripcionProblema = reparacion.data.DescripcionUsuRep;
    const drone = reparacion.data.ModeloDroneNameRep;

    const prompt = `
Eres un experto en reparación de drones de la marca DJI.
Basado en la siguiente descripción del problema, proporciona un diagnóstico, posibles repuestos necesarios y posibles soluciones.
Si se proporcionan códigos de error, buscar qué significan esos códigos de error y responder en consecuencia.
Se conciso.

Modelo del drone:
${drone}

Descripción del problema:
${descripcionProblema}
`;

    try {
        dispatch(isFetchingStart());

        const chatCompletion = await OpenaiFetchAPI(prompt);

        dispatch(isFetchingComplete());

        return chatCompletion;
    } catch (error) {
        console.error('Error al generar el diagnóstico:', error);
        return 'No se pudo generar un diagnóstico automático.';
    }
};



////////////////////////////////////////////////////
// FUNCIONES PARA PARA POSIBLES REFACTORIZACIONES //
////////////////////////////////////////////////////

export const getProvinciasSelect = () => (dispatch) => {
    console.log("getProvinciasSelect");
    dispatch(isFetchingStart());
    return new Promise((resolve, reject) => {
        getProvinciasSelectPersistencia()
            .then(provinciasSelect => {
                dispatch(setProvinciasSelect(provinciasSelect));
                resolve(provinciasSelect);
            })
            .catch(error => reject(error))
            .finally(() => dispatch(isFetchingComplete()));
    });
}

export const getLocalidadesPorProvincia = (provincia) => (dispatch) => {
    console.log("getLocalidadesPorProvincia");
    dispatch(isFetchingStart());
    return new Promise((resolve, reject) => {
        getLocPorProvPersistencia(provincia)
            .then(localidadesSelect => {
                dispatch(setLocalidadesSelect(localidadesSelect));
                resolve(localidadesSelect);
            })
            .catch(error => reject(error))
            .finally(() => dispatch(isFetchingComplete()));
    });
}

  // Función para generar nombre único de un drone
  export const generarNombreUnico = (dronesList, NombreModelo, NombreUsu, ApellidoUsu) => {
    const nombreCompleto = `${NombreUsu} ${ApellidoUsu ?? ''}`.trim();
    const nombreBase = `${NombreModelo} - ${nombreCompleto}`;

    const nombresExistentes = dronesList
      .filter(d => d.NombreModelo !== NombreModelo) // Excluir el drone actual
      .map(d => d.data.Nombre);

    let nombreFinal = nombreBase;
    let contador = 1;

    while (nombresExistentes.includes(nombreFinal)) {
      contador++;
      nombreFinal = `${nombreBase} ${contador}`;
    }

    return nombreFinal;
  };

/**
 * Genera una contraseña por defecto basada en el nombre del usuario
 * Formato: nombre_en_minúsculas + "1234"
 * @param {string} nombreUsu - Nombre del usuario
 * @returns {string} Contraseña generada (vacía si no hay nombre)
 */
export const generarPasswordPorDefecto = (nombreUsu) => {
  if (!nombreUsu || nombreUsu.trim().length === 0) {
    return ''; // No generar contraseña sin nombre
  }
  const nombre = nombreUsu.toLowerCase().trim();
  const password = nombre + '1234';
  
  return password;
};
