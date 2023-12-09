interface Estado {
    nombre: string;
    prioridad: number;
    accion: string;
    color: string;
}

interface Estados {
    [key: string]: Estado;
}
