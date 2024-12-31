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
