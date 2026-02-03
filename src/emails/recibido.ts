import { ReparacionType } from "../types/reparacion";

export const bodyRecibo = (reparacion: ReparacionType): string => {
    const clienteNombre = reparacion.data.ApellidoUsu 
        ? `${reparacion.data.NombreUsu} ${reparacion.data.ApellidoUsu}` 
        : reparacion.data.NombreUsu;
    
    const fechaIngreso = reparacion.data.FeRecRep ? new Date(reparacion.data.FeRecRep).toLocaleDateString() : 'No especificada';
    
    return `Nro. de reparación: ${reparacion.id}
Recibo de equipo: ${reparacion.data.ModeloDroneNameRep}
Fecha de ingreso: ${fechaIngreso}
Observaciones: ${reparacion.data.DescripcionUsuRep}
Cliente: ${clienteNombre}
Teléfono: ${reparacion.data.TelefonoUsu}

IMPORTANTE:
- El diagnóstico y presupesto demorará hasta 48 hs hábiles a partir de la fecha de ingreso del equipo.
- En caso de aceptar el presupuesto, el tiempo de reparación es aproximadamente de 5 a 7 días hábiles.
- En caso de no aceptar el presupuesto, el costo del diagnóstico es de U$S 25.
- La reparación tiene 90 días de garantía.


Mauricio Cruz Drones
www.mauriciocruzdrones.com
Teléfono: +54 9 341 7439091
Email reparaciones: reparaciones@mauriciocruzdrones.com
Email información general: info@mauriciocruzdrones.com
`;
}
