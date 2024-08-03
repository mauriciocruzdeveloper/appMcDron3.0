export interface Estado {
    nombre: string;
    prioridad: number;
    accion: string;
    color: string;
}

export interface Estados {
    [key: string]: Estado;
}
