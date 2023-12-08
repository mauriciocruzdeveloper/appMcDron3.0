import { NodosEnum } from "./nodosjs.enum";

export interface NodoJS {
    id: NodosEnum;
    description: string;
    trigger: () => void;
    childrens: NodosEnum[];
}

export interface NodosJS {
    [id: string]: NodoJS;
}

export const NODOS_INITIAL_STATE: NodosJS = {
    [NodosEnum.INICIO]: {
        id: NodosEnum.INICIO,
        description: 'Initial Page',
        trigger: () => console.log('Iniciando juego'),
        childrens: [NodosEnum.REPARACIONES, NodosEnum.USUARIOS, NodosEnum.MENSAJES],
    },
    [NodosEnum.REPARACIONES]: {
        id: NodosEnum.REPARACIONES,
        description: 'Menu principal',
        trigger: () => console.log('Mostrando menu'),
        childrens: [NodosEnum.REPARACION]
        // Los children tiene que ser objetos, no ids, porque tengo que poder poner varios del mismo tipo,
        // por ejemplo, varias reparaciones. De reparaciones se va a una de varias reparciones.
    },
}