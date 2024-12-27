import { bodyRecibo } from "../emails/recibido";
import { EMAIL_REPARACIONES } from "../types/constantes";
import { ReparacionType } from "../types/reparacion";
import { enviarEmail } from "./utils";

export const enviarRecibo = (reparacion: ReparacionType): void => {
    const datosEmail = {
        to: reparacion.data.EmailUsu,
        cc: EMAIL_REPARACIONES,
        bcc: [],
        subject: 'Recibo de equipo ' + reparacion.data.DroneRep,
        body: bodyRecibo(reparacion),
    };
    enviarEmail(datosEmail);
}