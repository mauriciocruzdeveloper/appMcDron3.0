import { ReparacionType } from "../types/reparacion";

export const bodyRecibo = (reparacion: ReparacionType): string => {
    const clienteNombre = reparacion.data.ApellidoUsu 
        ? `${reparacion.data.NombreUsu} ${reparacion.data.ApellidoUsu}` 
        : reparacion.data.NombreUsu;
    
    const fechaIngreso = reparacion.data.FeRecRep ? new Date(reparacion.data.FeRecRep).toLocaleDateString() : 'No especificada';
    
    return `Nro. de reparación: ${reparacion.data.IdPublicoRep || reparacion.id}
Recibo de equipo: ${reparacion.data.ModeloDroneNameRep}
Fecha de ingreso: ${fechaIngreso}
Observaciones: ${reparacion.data.DescripcionUsuRep}
Cliente: ${clienteNombre}
Teléfono: ${reparacion.data.TelefonoUsu}

IMPORTANTE:
- El diagnóstico y presupuesto demorará de 1 a 5 días hábiles a partir de la fecha de ingreso del equipo, dependiendo de la complejidad del mismo.
- En caso de aceptar el presupuesto, el tiempo de reparación es aproximadamente de 5 a 15 días hábiles, dependiendo de la complejidad del equipo.
- En caso de no aceptar el presupuesto, el costo del diagnóstico es de U$S 25.
- La reparación tiene 90 días de garantía.


Mauricio Cruz Drones
www.mauriciocruzdrones.com.ar
Teléfono: +54 9 341 7439091
Email reparaciones: reparaciones@mauriciocruzdrones.com.ar
Email información general: info@mauriciocruzdrones.com.ar
`;
}
