import { getMessagesPersistencia, sendMessagePersistencia } from "../../persistencia/persistenciaFirebase";
import { isFetchingComplete, isFetchingStart } from "../app/app.slice";
import { setMessagesToRedux } from "./mensaje.slice";

// GUARDA Mensaje
export const sendMessage = (message: any) => () => {
    console.log("sendMessage()");
    return new Promise((resolve, reject) => {
        sendMessagePersistencia(message)
            .then(message => resolve(message))
            .catch(error => {
                // dispatch(abreModal("Mensaje no enviado", "Código - " + error, "danger"));
                reject(error);
            })
    });
}

// GET de todos los Mensajes
export const getMessages = (emailUsu: string, emailCli: string) => (dispatch) => {
    console.log("getMessages()");
    dispatch(isFetchingStart());
    return new Promise((resolve, reject) => {
        getMessagesPersistencia(emailUsu, emailCli, mensajes => dispatch(setMessagesToRedux(mensajes)))
            // podría ubicar unsubscribeMessages en el store así puedo accederla desde cualquier lado
            .then((unsubscribeMessages) => resolve(unsubscribeMessages))
            // .catch(() => {
            //     dispatch(abreModal("Error", "getMessages() en getMensajesPersistencia()", "danger"));
            //     reject()
            // })
            .finally(() => dispatch(isFetchingComplete()));
    });
}