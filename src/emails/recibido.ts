import { ReparacionType } from "../types/reparacion";

export const bodyRecibo = (reparacion: ReparacionType): string => {
    return `Nro. de reparación: ${reparacion.id}
Recibo de equipo: ${reparacion.data.DroneRep}
Fecha de ingreso: ${new Date(reparacion.data.FeRecRep).toLocaleDateString()}
Observaciones: ${reparacion.data.DescripcionUsuRep}
Cliente: ${reparacion.data.NombreUsu} ${reparacion.data.ApellidoUsu}
Teléfono: ${reparacion.data.TelefonoUsu}
        
Mauricio Cruz Drones
www.mauriciocruzdrones.com
Teléfono: +54 9 341 7439091
Email: mauriciocruzdrones@gmail.com`;
}
