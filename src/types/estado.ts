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
    Indefinido = 0,     // Estado para casos no reconocidos
    Consulta = 1,
    Respondido = 2,
    Transito = 3,
    Recibido = 4,
    Revisado = 5,
    Presupuestado = 6,
    Aceptado = 7,
    Abandonado = 8,
    Rechazado = 9,
    Reparado = 10,
    Diagnosticado = 11,
    Cobrado = 12,
    Enviado = 13,
    Finalizado = 14,
    Cancelado = 15,
    
    // Estados de retrocompatibilidad (etapas altas para identificarlos)
    Reparar = 100,
    Repuestos = 101,
    Entregado = 103,
    Venta = 104,
    Liquidación = 105,
}