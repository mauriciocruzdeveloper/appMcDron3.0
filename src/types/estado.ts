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
    Presupuestado = 6,
    Reparar = 7,
    Repuestos = 8,
    Reparado = 9,
    Diagnosticado = 10,
    Cobrado = 11,
    Entregado = 12,
    Venta = 13,
    Liquidación = 14,
    Trabado = 15,
}