import { createAsyncThunk } from "@reduxjs/toolkit";
import { sendMessagePersistencia } from "../../persistencia/persistenciaFirebase";
import { isFetchingComplete, isFetchingStart } from "../app/app.slice";
// import { setMessages } from "./mensaje.slice";

// GUARDA MENSAJE
export const sendMessageAsync = createAsyncThunk(
    'app/sendMessage',
    async (message: any, { dispatch }) => {
        try {
            dispatch(isFetchingStart());
            const messageGuardado = await sendMessagePersistencia(message);
            dispatch(isFetchingComplete());
            return messageGuardado;
        } catch (error: any) {
            dispatch(isFetchingComplete());
            return error;
        }
    },
);

// // GET de todos los Mensajes
// export const getMessagesAsync = createAsyncThunk(
//     'app/getMessages',
//     async ({ emailUsu, emailCli }: { emailUsu:string, emailCli:string }, { dispatch }) => {
//         try {
//             dispatch(isFetchingStart());
//             const mensajes = await getMessagesPersistencia(emailUsu, emailCli);
//             dispatch(setMessagesToRedux(mensajes));
//             dispatch(isFetchingComplete());
//             return mensajes;
//         } catch (error: any) {
//             dispatch(isFetchingComplete());
//             return error;
//         }
//     },
// );
