export interface Estado {
    nombre: string;
    prioridad: number;
    accion: string;
    color: string;
    etapa: number;
}

export interface Estados {
    [key: string]: Estado;
}

export enum Etapas {
    Consulta = 1,
    Respondido = 2,
    Transito = 3,
    Recibido = 4,
    Revisado = 5,
    Presupuestar = 6,
    Presupuestado = 7,
    Reparar = 8,
    Repuestos = 9,
    Reparado = 10,
    Diagnosticado = 11,
    Cobrado = 12,
    Entregado = 13,
    Venta = 14,
    Liquidación = 15,
    Trabado = 16,
}