import { EMAIL_REPARACIONES } from "../types/constantes";
import { HttpMethod } from "../types/httpMethods";
import { ReparacionType } from "../types/reparacion";
import { Response } from "../types/response";
import { callEndpoint, enviarEmail } from "./utils";

// export const enviarRecibo = (reparacion: ReparacionType): void => {
//     const datosEmail = {
//         from: EMAIL_REPARACIONES,
//         to: reparacion.data.EmailUsu,
//         cc: EMAIL_REPARACIONES,
//         bcc: [],
//         subject: 'Recibo de equipo ' + reparacion.data.DroneRep,
//         body: bodyRecibo(reparacion),
//     };
//     enviarEmail(datosEmail);
// }


// export const enviarRecibo = async (reparacion: ReparacionType): Promise<Response> => {
//     const body = {
//         cliente: reparacion.data.NombreUsu,
//         nro_reparacion: reparacion.id,
//         equipo: reparacion.data.DroneRep,
//         fecha_ingreso: new Date(Number(reparacion.data.FeRecRep)).toLocaleDateString(),
//         observaciones: reparacion.data.DescripcionUsuRep,
//         telefono: reparacion.data.TelefonoUsu,
//         email: reparacion.data.EmailUsu
//     };

//     const url = process.env.REACT_APP_API_URL + '/send_recibo';

//     const response = await callEndpoint({
//         url,
//         method: HttpMethod.POST,
//         body,
//     });

//     return response;
// }

export const enviarEmailVacio = (reparacion: ReparacionType): void => {
    const datosEmail = {
        from: EMAIL_REPARACIONES,
        to: reparacion.data.UsuarioRep,
        cc: EMAIL_REPARACIONES,
        bcc: [],
        subject: '',
        body: ''
    };
    enviarEmail(datosEmail);
}