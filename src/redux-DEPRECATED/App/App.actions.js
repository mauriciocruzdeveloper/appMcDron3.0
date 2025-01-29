/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// En este archivo están las definiciones de acciones para el reducer y también funciones
// que pueden no disparar una acción. Acá están todas las funciones que se llaman desde
// los componentes.
// Habría que separar la lógica de las acciones... No se cómo. Puede ser con in middleware.
// Otra opción podría se usar componentes "Contenedores", donde esté la lógica, y aquí también
// se disparen las acciones, y luego los componentes "Presentación" que se sirvan de los estados del store.

import {
    getProvinciasSelectPersistencia,
    getLocPorProvPersistencia,
    getUsuariosPersistencia,
} from "../../persistencia/persistenciaFirebase";
import { callEndpoint, OpenaiFetchAPI } from "../../utils/utils";
import { HttpMethod } from "../../types/httpMethods";
import { isFetchingComplete, isFetchingStart } from "../../redux-tool-kit/app/app.slice";
import { setLocalidadesSelect, setProvinciasSelect, setUsuariosSelect } from "../../redux-tool-kit/usuario/usuario.slice";
// } from "../../persistencia/persistenciaJava";
// } from "../../persistencia/persistenciaNode";


//////////////////////////////////////////////////////////////////////////
//////// ACTIONS /////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////
// FUNCIONES PARA CONECTARSE A LA PERSISTENCIA //
/////////////////////////////////////////////////

// Envía Recibo
export const enviarRecibo = (reparacion) => (dispatch) => {
    const body = {
        cliente: reparacion.data.NombreUsu,
        nro_reparacion: reparacion.id,
        equipo: reparacion.data.DroneRep,
        fecha_ingreso: new Date(Number(reparacion.data.FeRecRep)).toLocaleDateString(),
        observaciones: reparacion.data.DescripcionUsuRep,
        telefono: reparacion.data.TelefonoUsu,
        email: reparacion.data.EmailUsu
    };

    const url = process.env.REACT_APP_API_URL + '/send_recibo';

    return new Promise((resolve, reject) => {
        callEndpoint({
            url,
            method: HttpMethod.POST,
            body,
        })
            .then(response => {
                // dispatch(abreModal("Envío de correo", response.message));
                resolve(response);
            })
            .catch(error => {
                // dispatch(abreModal("Envío de correo", error.message, "danger"));
                reject(error);
            });
    });
}

// Autodiagnóstico
export const generarAutoDiagnostico = (reparacion) => async (dispatch) => {
    const descripcionProblema = reparacion.data.DescripcionUsuRep;

    const prompt = `Eres un experto en reparación de drones. Basado en la siguiente descripción del problema, proporciona un diagnóstico, posibles repuestos necesarios y posibles soluciones. Si se proporcionan códigos de error, buscar qué significan esos códigos de error y responder en consecuencia. Se conciso. 

  Descripción del problema:
  ${descripcionProblema}`;

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

// export const rememberMe = () => {
//     localStorage.setItem('memoria', JSON.stringify( estado.display1 ));
//     const memoria = JSON.parse(localStorage.getItem('memoria')) || [];
// }